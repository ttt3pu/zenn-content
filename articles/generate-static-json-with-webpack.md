---
title: "【webpack】JSファイルでreturnした値から静的JSONファイルを生成する"
emoji: "🔧"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["javascript", "webpack", "json", "nodejs"]
published: true
---

## 概要

APIのモックとしてJSONファイルが必要な際に、  
普通は[json-server](https://www.npmjs.com/package/json-server)とか便利なやつがいっぱいあるのでそれらを使えば良いと思うのですが、  
訳あって静的ファイルとして必要なシチュエーションがあったため、webpackを使ってJSファイルから書き出せるように構築してみました。

（小さいJSONファイルなら普通に手打ちして作ったほうが早い場合もあるとは思うのですが、Math.randomとか反復処理とか使いたかったので）

例えばこのようなJSファイルをimportしたときに

```js:hoge.js
const json = {
  hoge: '1',
  huga: '2',
};

// 文字列に変換してからreturnする必要がある（詳細は後述）
export default JSON.stringify(json, null, 2);
```

このようなJSONファイルとして書き出されるように設定していきます。

```json:hoge.json
{
  "hoge": "1",
  "huga": "2"
}
```

## 設定方法

今回はディレクトリ構造はこのようにします。

```
.
┣ src/
┃  ┣ index.js
┃  ┗ hoge.js
┣ dist/
┃  ┗ （ここにhoge.jsonが書き出される）
┗ webpack.config.js
```

webpack.config.jsの完成形はこのような形になります。

```js:webpack.config.js
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        oneOf: [
          // 静的ファイルとして書き出す場合
          {
            resourceQuery: /^\?staticJson/,
            type: 'asset/resource',
            generator: {
              filename: ({filename}) => {
                return filename.replace(/\.js/, '.json').replace('src/', '');
              },
            },
            use: [
              {loader: 'extract-loader'},
            ],
          },
          // 普通にimportして使用する場合
          // {
          //   use: [
          //     {loader: 'babel-loader'},
          //     ~~~
          //   ],
          // },
        ],
      },
    ],
  },
};
```

index.js側はこのようにします。

```js:index.js
/**
 * 静的JSONとして書き出す
 */
import "./hoge.js?staticJson";

/**
 * 普通にimportして使うこともできる
 */
// import hogehuga from "src/huga.js";
```

---

コアとなっているのは下記の部分です。

```js
{
  resourceQuery: /^\?staticJson/,
  type: 'asset/resource',
  generator: {
    filename: ({filename}) => {
      return filename.replace(/\.js/, '.json').replace('src/', '');
    },
  },
  use: [
    {loader: 'extract-loader'},
  ],
},
```

まずは[extract-loader](https://www.npmjs.com/package/extract-loader)を挟んで、`hoge.js`でreturnされた文字列を受け取っています(※1)。

受け取った文字列を、webpack5の新機能である[Asset Modules](https://webpack.js.org/guides/asset-modules/#root)を使い、静的ファイルとして書き出すようにしています(※2)。

> ※1. hoge.jsで最後に文字列に変換していたのはこの辺りの兼ね合いです。変換せずに渡すと`[object Object]`のようになってしまいます。

> ※2. webpack4以前の場合は、[file-loader](https://www.npmjs.com/package/file-loader)を使用することによって代用できます。

### 「generator」周りの記述について

`generator`周りの処理は書き出し先の設定です。  
初期設定だと `dist/src/hoge.js` のように書き出されてしまうので、 拡張子を.jsから.jsonに置換しているのと、パスを `dist/hoge.js` になるように置換しています(※)。  
今回の場合は `dist/hoge.json` のようなパスで書き出されますが、別のディレクトリに書き出したい場合などは、この辺の記述をいじくることで設定できます。

> ※ 完全に知識不足なのですが、ここはもうちょっと良い書き方あるんだろうなぁとは思います・・・

### 「oneOf」周りの記述について

[oneOf](https://webpack.js.org/configuration/module/#ruleoneof)周りの記述は必須ではないのですが、  
これを使うことにより、普通にimportさせたいものと、静的JSONとして書き出したいものをプロジェクト内で併用できるようにしてます。  
今回の場合、import文の末尾に`?staticJson`がついているもののみを静的JSONとして書き出すように設定しています。

## TypeScriptでも書けるようにする

ちなみに、同じ設定でts-loaderを挟めば、TypeScriptでも書けるようにできます。

``` js diff
    {
+      test: /\.ts$/,
       oneOf: [
          // 静的ファイルとして書き出す場合
         {
           resourceQuery: /^\?staticJson/,
           type: 'asset/resource',
           generator: {
             filename: ({filename}) => {
+              return filename.replace(/\.ts/, '.json').replace('src/', '');
             },
           },
           use: [
             {loader: 'extract-loader'},
+            {loader: 'ts-loader'},
           ],
         },
         // 普通にimportして使用する場合
         // {
         //   use: [
         //     {loader: 'ts-loader'},
         //     ~~~
         //   ],
         // },
       ],
    }
```
