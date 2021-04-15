---
title: "Swiper.jsでswiper-slideを複製させずに（loop: trueを使わずに）ループを実装する"
emoji: "🔁"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["javascript", "swiper"]
published: true
---

Swiperに備え付けの機能である「loop: true」を使わずにループさせる方法です。

## そもそもなんで素直にloop機能を使わないのか

状況によっては、loop機能を使用することによって不具合が発生する場合があります。  
たぶんSwiper愛用していてこの問題に遭遇したことがある方は多いのではないかと思います。。😫  
下記がその例です。

@[codepen](https://codepen.io/ttt3pu/pen/wvgjVGv)

スライド内の画像を押したときに、スライド番号をアラートで表示するような実装をしようとしています。

```js
document.querySelectorAll('.swiper-slide img').forEach((el, i) => {
  el.addEventListener('click', () => {
    alert(i + 1);
  });
});
```

最初の状態から、6のスライドに戻すと、アラートがなぜか出たり出なかったりすることを確認できると思います。これはloop機能を使っているのが原因です。  
loop機能は、見た目上足りない分のswiper-slideを複製することによって、自然なスライドのアニメーションを実現させています。  
そのため、複製されたスライドにはeventListener等が引き継がれないので、動かなくなってしまいます。  
特にVueとかReactとかを挟んで色々処理するときは、この問題が顕著に出てきてしまいます。

## 実装例

loop機能使ったときとは違うアニメーションにはなってしまいますが、ちゃんとループしているのが確認できると思います。

@[codepen](https://codepen.io/ttt3pu/pen/jOyxjwj)

## 実装例のコード解説

### navigation（アロー）の実装

普通は[公式ドキュメント](https://swiperjs.com/swiper-api#navigation)に従ってnavigationオプションを設定すれば良いのですが、これを素直に使ってしまうと、下記の例のように端まで来たときに非活性になってしまいます。

@[codesandbox](https://codesandbox.io/embed/swiper-navigation-gwvly?fontsize=14&hidenavigation=1&theme=dark)

そのため、navigationオプションは使わずに、自前でアロークリック時の処理を作成しています。

下記のSwiperのAPIを組み合わせて実装しています。

props

- `swiper.slides`: swiper-slidesのDOMが配列で返却される。これのlengthを取ることでスライド総数が取れる
- `swiper.isBeginning`: 現在のスライドが左端のときはtrueが返ってくる
- `swiper.isEnd`: 現在のスライドが右端のときはtrueが返ってくる

methods

- `swiper.slideTo(飛び先のスライド番号)`: 任意の位置までスライドさせる

```js
// スライド総数
const totalSlidesLen = swiper.slides.length;

/**
  * 戻るボタンクリック時の処理
  */
swiper.el.querySelector('.swiper-button-prev').addEventListener('click', () => {
  if (swiper.isBeginning) {
    swiper.slideTo(totalSlidesLen - 1);
  } else {
    swiper.slideTo(swiper.realIndex - 1);
  }
});
/**
  * 進むボタンクリック時の処理
  */
swiper.el.querySelector('.swiper-button-next').addEventListener('click', () => {
  if (swiper.isEnd) {
    swiper.slideTo(0);
  } else {
    swiper.slideTo(swiper.realIndex + 1);
  }
});
```

### スワイプ時の挙動の修正

SwiperのAPIである `touchStart` と `touchEnd` を使用することによって、Swiper上でタッチされたときとタッチが離れたときを監視して処理を行うことができます。  
これを利用して、端でスワイプされたときに逆側にスライドさせる処理を実装しています。

```js
/**
  * Swiper上でドラッグされ始めたときの処理
  */
touchStart(swiper, e) {
  /**
    * タッチされたX座標を保存
    * タッチ時とクリック時でイベントの返り値が変わるため処理を分岐
    */
  if (e.type === 'touchstart') {
    swiperTouchStartX = e.touches[0].clientX;
  } else {
    swiperTouchStartX = e.clientX;
  }
},
/**
  * Swiper上でドラッグし終わったときの処理
  */
touchEnd(swiper, e) {
  // スワイプ判定のしきい値
  const tolerance = 150;
  // スライド総数
  const totalSlidesLen = swiper.slides.length;

  // 左にスワイプしたか右にスワイプしたかを判定
  const diff = (() => {
    if (e.type === 'touchend') {
      return e.changedTouches[0].clientX - swiperTouchStartX;
    } else {
      return e.clientX - swiperTouchStartX;
    }
  })();

  /**
    * タッチ開始時と、タッチ終了時のカーソルの座標を比較し、下記のどちらかに分岐させる。
    */
  // 最初のスライド上で左にスワイプされたときは最後のスライドに飛ばす
  if (swiper.isBeginning && diff >= tolerance) {
    swiper.slideTo(totalSlidesLen - 1);
  // 最後のスライド上で右にスワイプさせたときは最初のスライドに飛ばす
  } else if (swiper.isEnd && diff <= -tolerance) {
    // 一瞬待ってから最初のスライドに飛ばす
    // （少し遅らせないと、最初のスライドに戻った後に右スワイプ判定が走って2番目のスライドに飛ばされてしまうため）
    setTimeout(() => {
      swiper.slideTo(0);
    }, 1);
  }
},
```
