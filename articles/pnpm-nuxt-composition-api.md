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

`shamefully-hoist` は、厳格で無い依存関係でlockファイルが作成されてしまっているような場合でも、巻き上げてimportをしてくれるようなオプションのようです。
https://pnpm.io/npmrc#shamefully-hoist

おそらく `@nuxtjs/composition-api` のバグ的なものだと思うので、一時的な対応方法ではありますが、いつかこの設定が無くても動くように修正されるかもしれません。
