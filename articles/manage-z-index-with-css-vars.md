---
title: "z-indexをCSS VariablesとSassできちんと管理する方法"
emoji: "⏫"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["scss", "css", "sass", "css設計"]
published: true
---

Sass変数を使っている例はよく見かけますが、CSS変数を使ってる例が無かったのでメモです。

雑にz-indexを管理していると、最終的にz-index: 99999とかインフレしていって困ることがあると思います。

それを避けるために、Sassのmap機能を使用して管理します。

- [高機能版（推奨）](#高機能版（推奨）)
- [シンプル版](#シンプル版)
  - [value基準で管理](#value基準で管理)
  - [index基準で管理](#index基準で管理)

## 高機能版（推奨）

- 基本はautoで指定する。index番号を基準に自動でz-indexが設定される。
- 数字を指定すると、最も直近の数字指定されているところを基準にz-indexが設定される。

``` scss
@mixin z-map($z-map) {
  $before-index: -1;

  @each $name, $value in $z-map {
    $result-z: null;

    @if $value == auto {
      $result-z: $before-index + 1;
    } @else {
      $result-z: $value;
    }

    $before-index: $result-z;
    #{$name}: $result-z;
  }
}

:root {
  @include z-map((
    --z-hoge: auto,
    --z-huga: auto,
    --z-foo: 500,
    --z-bar: auto,
  ));
}

.example {
  z-index: var(--z-hoge); // -> z-index: 0;
  z-index: var(--z-huga); // -> z-index: 1;
  z-index: var(--z-foo); // -> z-index: 500;
  z-index: var(--z-bar); // -> z-index: 501;
}
```

## シンプル版

こっちのほうが記述はスッキリします。ただシンプル故にデメリットはあります。

### value基準で管理

```scss
@mixin z-map($z-map) {
  @each $name, $value in $z-map {
    #{$name}: #{$value};
  }
}

:root {
  @include z-map((
  --z-hoge: 0,
  --z-huga: 1,
  --z-foo: 900,
  ));
}

.example {
  z-index: var(--z-hoge); // -> z-index: 0;
  z-index: var(--z-huga); // -> z-index: 1;
  z-index: var(--z-foo); // -> z-index: 900;
}
```

#### メリット | value基準

- 自由に値を決めることができるので柔軟に対応できる

#### デメリット | value基準

- もし後から全部1ずつずらすとかになったときに、1個1個変えなきゃいけないのでめんどくさい

## index基準で管理

```scss
@mixin z-map($z-map) {
  @each $name in $z-map {
    #{$name}: #{index($z-map, $name) - 1};
  }
}

:root {
  @include z-map((
    --z-hoge,
    --z-huga,
    --z-foo,
  ));
}

.example {
  z-index: var(--z-hoge); // -> z-index: 0;
  z-index: var(--z-huga); // -> z-index: 1;
  z-index: var(--z-foo); // -> z-index: 2;
}
```

### メリット | index基準

- 1個1個値を決めないで良いので楽

### デメリット | index基準

- 柔軟に値を変えることができないので、誰かがルール破ったら終わる
