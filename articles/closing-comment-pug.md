---
title: "PugでレンダリングしたHTMLに閉じタグコメントを付ける方法"
emoji: "🐶"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["pug", "html"]
published: true
---

業務上、PugでレンダリングしたHTMLをバックエンドに渡して、テンプレートエンジンに組み込んでもらうことがあるのですが、  
入れ子が深めだったり、閉じタグまでが遠いコンポーネントとかの場合、コピペミスが発生することが多いので、閉じタグコメントが欲しくなるときがあります。  
完成形はこういうやつです↓

```html
<div class="hoge">
  <div class="hoge__inner">
    <div class="hoge__inner-inner">
      <p>
        ほげ<br>
        ふが<br>
        ほげ<br>
        ふが
      </p>
    </div><!-- /hoge__inner-inner -->
  </div><!-- /hoge__inner -->
</div><!-- /hoge -->
```

## 実装方法

下記のような記法をすることで閉じコメントをつけることができます。

```pug
.hoge
  .hoge__inner
    .hoge__inner-inner
      p ほげ<br>ふが<br>ほげ<br>ふが
    <!-- /hoge__inner-inner -->
  <!-- /hoge__inner -->
<!-- /hoge -->
```

## なぜ素のHTMLのコメント記法を使う必要があるか

素のHTMLとPugが入り乱れてる感じがして、Pugソース側の見通しとしては微妙ではありますが・・・  
これには理由があって、Pugの標準のコメント記法を使うと、下記のように改行されてしまうためです。

```pug
.hoge
  .hoge__inner
    .hoge__inner-inner
      .hoge__inner-inner-inner
        p ほげ<br>ふが<br>ほげ<br>ふが
      // /hoge__inner-inner
  // /hoge__inner
// /hoge
```

```html
<div class="hoge">
  <div class="hoge__inner">
    <div class="hoge__inner-inner">
      <p>
        ほげ<br>
        ふが<br>
        ほげ<br>
        ふが
      </p>
    </div>
    <!-- /hoge__inner-inner -->
  </div>
  <!-- /hoge__inner -->
</div>
<!-- /hoge -->
```
