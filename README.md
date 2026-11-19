# Zenn Contents

* [📘 How to use](https://zenn.dev/zenn/articles/zenn-cli-guide)
* [📘 Markdown guide](https://zenn.dev/zenn/articles/markdown-guide)

## Commoands

### CIの検証を実行する

```shell
pnpm install --frozen-lockfile
pnpm test
```

CIはすべてのPRとmainへのpushで実行します。`package.json`で指定したNode.js・pnpmを使い、Zennプレビューでテスト用記事の取得とMarkdownのHTML変換を確認します。

### 👇新しい記事を作成する

```shell
$ zenn new:article
```

### 👇新しい本を作成する

```shell
$ zenn new:book
```

### 👇表示をプレビューする

```shell
$ zenn preview
```
