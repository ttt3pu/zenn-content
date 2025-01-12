---
title: "pnpm + @nuxtjs/composition-api 環境で、依存関係のエラーが出た場合の解決法"
emoji: "😵"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["pnpm", "nuxt", "vue", "compositionapi"]
published: true
---

:::message
2022年3月時点、`@nuxtjs/composition-api` が `v0.32.0` の時点での情報です。アップデートによって直る可能性もあります。
:::

## 事象

pnpm環境で、 `@nuxtjs/composition-api` を導入しているnuxtを動かそうとすると、下記のように依存パッケージが足りない旨のエラーが出ます。

```
ERROR  Cannot find module '@vue/composition-api' from ...
```

`pnpm add @vue/composition-api` すれば直るようにも見える内容ですが、
今度は `Cannot find module 'defu' ...` のように、別の依存パッケージの要求が出てきてキリがない感じになってしまいます。 🤔

## 解決法

プロジェクトの `.npmrc` に (無い場合はルートに作成する)、下記の記述を追加することで解決できます。

```json:.npmrc
shamefully-hoist: true
```

## `shamefully-hoist` とは？

`shamefully-hoist` は、厳格で無い依存関係でlockファイルが作成されてしまっているような場合でも、巻き上げてimportをしてくれるようなオプションです。
<https://pnpm.io/npmrc#shamefully-hoist>

デフォルトは `false` ですが、 `true` にすることで、以下のような状況のエラーを回避できるようになります。

- ライブラリ内で使用されている依存パッケージがプロジェクトルートに存在しない
- 孫以降の依存関係を直接 import しようとした際にエラーが発生する

この問題の原因は、`@nuxtjs/composition-api` の内部のコードで、依存関係を適切に解決できない `import` 方法が使用されている可能性があるからと思われます。
そのため、プロジェクト側で `shamefully-hoist` を設定し、依存関係の問題を回避してあげる必要があるようです。
