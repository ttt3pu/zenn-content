import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { setTimeout as delay } from 'node:timers/promises';
import { test } from 'node:test';

test('記事のタイトルとMarkdown本文をプレビューで取得できること', { timeout: 30_000 }, async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'zenn-preview-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await mkdir(join(directory, 'articles'));
  await writeFile(join(directory, 'articles', 'preview-check.md'), `---
title: "プレビュー動作確認"
emoji: "📝"
type: "tech"
topics: ["markdown"]
published: false
---

## 動作確認の見出し

本文の**強調表示**を確認します。

~~~js
console.log('preview-check');
~~~
`);

  const reservation = createServer();
  reservation.listen(0, '127.0.0.1');
  await once(reservation, 'listening');
  const { port } = reservation.address();
  await new Promise((resolve, reject) => reservation.close((error) => error ? reject(error) : resolve()));

  const require = createRequire(import.meta.url);
  const cli = require.resolve('zenn-cli/dist/server/zenn.js');
  const preview = spawn(process.execPath, [cli, 'preview', '--port', String(port)], {
    cwd: directory,
    env: { ...process.env, CI: 'true' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const exited = once(preview, 'exit');
  let output = '';
  for (const stream of [preview.stdout, preview.stderr]) {
    stream.on('data', (chunk) => { output = (output + chunk).slice(-8_000); });
  }
  t.after(async () => {
    preview.kill('SIGKILL');
    await exited;
  });

  const baseUrl = `http://127.0.0.1:${port}`;
  let response;
  for (let attempt = 0; attempt < 60; attempt++) {
    assert.equal(preview.exitCode, null, `プレビューが終了しました: ${output}`);
    try {
      response = await fetch(`${baseUrl}/api/articles/preview-check`, { signal: AbortSignal.timeout(2_000) });
      break;
    } catch {
      await delay(250);
    }
  }
  assert.ok(response, `プレビューが起動しませんでした: ${output}`);
  assert.equal(response.status, 200);
  const { article } = await response.json();
  assert.equal(article.title, 'プレビュー動作確認');
  assert.equal(article.slug, 'preview-check');
  assert.equal(article.published, false);
  assert.match(article.bodyHtml, /<h2\b[^>]*>.*動作確認の見出し/);
  assert.match(article.bodyHtml, /<strong>強調表示<\/strong>/);
  assert.match(article.bodyHtml, /<pre\b/);
  assert.match(article.bodyHtml, /preview-check/);

  const page = await fetch(`${baseUrl}/articles/preview-check`);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /<script\b[^>]*src=/);
});
