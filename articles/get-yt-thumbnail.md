---
title: "【JS】YouTubeの動画IDからなるべく大きい解像度のサムネイルを取得する方法（API使わずに）"
emoji: "📺"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["javascript", "html", "youtube"]
published: true
---

当記事でまとめている方法をnpmパッケージ化してみました。  
需要あるかどうかはわかりませんが、良かったら使ってください。

[get-yt-thumbnail - npm](https://www.npmjs.com/package/get-yt-thumbnail)

---

## 概要

このURL叩けば拾えるよ！っていう記事はいっぱいあるのですが、ある程度自動でなるべく大きいサイズを取得する方法は無かったので、まとめてみました。

まず、YouTubeのサムネイルは下記の5種類でURLが生成されます。

| 画像サイズ | URL形式 |
| --- | --- |
| 120x90 | `https://img.youtube.com/vi/{videoId}/default.jpg` |
| 320x180 | `https://img.youtube.com/vi/{videoId}/mqdefault.jpg` |
| 480x360 | `https://img.youtube.com/vi/{videoId}/hqdefault.jpg` |
| 640x480 | `https://img.youtube.com/vi/{videoId}/sddefault.jpg` |
| 1280x720 | `https://img.youtube.com/vi/{videoId}/maxresdefault.jpg` |

一番大きいのは1280x720のmaxresdefaultなので、素直にこれを読みたいところではありますが、  
設定したサムネの解像度が（サムネ未設定の場合は動画自体の解像度が）低い場合は、  
高解像度のサムネイルは生成されず、下記のような画像になってしまいます。

![](https://storage.googleapis.com/zenn-user-upload/z98vyzz5rhg21mxjmh1q4f5rkmrc)
*[320x180で動画アップロードした例。maxresdefault.jpgが生成されない。](https://img.youtube.com/vi/eVUGwUOg4Ek/maxresdefault.jpg)*

- ※ 今回の場合は幅320の動画でアップしたのに640のサムネもちゃんと生成されていますが、動画によってはsddefaultとかも生成されない場合もあるので、生成条件はよくわかってません。
- ※ あとは、masresdefaultだけ16:9なので、縦横比によって生成される・されないはあるかも？

そのため、なるべく大きいサムネを取得するためには、大きいサイズのURLから順に、画像が生成されているかどうかを確認していく必要があります。

## コード例

まずはURL形式の一覧を定義しておきます。

```js
const THUMB_TYPES = [
  /** w1280 */
  'maxresdefault.jpg',
  /** w640 */
  'sddefault.jpg',
  /** w480 */
  'hqdefault.jpg',
  /** w320 */
  'mqdefault.jpg',
  /** w120 */
  'default.jpg',
];
```

で、これらを大きい順に1つずつ回して、`new Image()`で定義して、onloadしてサムネがあるか無いかを調べていきます。

本来であったら「もし404だったら存在しない」のような分岐をさせたいのですが、正確には404ではなくダミー画像が生成されるため、onerrorでは認識してくれません。  
そのため、__ダミー画像の場合はURLタイプに関わらず解像度が120x120で生成される仕様を利用して__ 分岐させます。

```js
const getYtThumbnail = async (videoId) => {
  // 画像をロードする処理
  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = (e) => resolve(img);
      img.src = src;
    });
  };

  for (let i = 0; i < THUMB_TYPES.length; i++) {
    const fileName = `https://img.youtube.com/vi/${videoId}/${THUMB_TYPES[i]}`;

    const res = await loadImage(fileName);

    // ダミー画像じゃなかったら（横幅が121px以上だったら）
    // もしくは、これ以上小さい解像度が無かった場合は、このURLで決定
    if (
      !THUMB_TYPES[i + 1]
      || (res).width > 120
    ) {
      return fileName;
    }
  }
};

(async () => {
  const highQuality = await getYtThumbnail('aqz-KE-bpKQ');
  document.getElementById('highQuality').src = highQuality;

  const lowQuality = await getYtThumbnail('eVUGwUOg4Ek');
  document.getElementById('lowQuality').src = lowQuality;
})();
```

@[codepen](https://codepen.io/ttt3pu/pen/xxqqRYX)

問題点として、見つからなかったサムネ分コンソールに404エラーが出ちゃいます。（onerrorでは拾ってくれないのにコンソールには出てしまうという。。）

本来であれば最初から、YouTube側の投稿設定で大きい解像度でサムネを指定しておけば済む話ではありますね😵  
あともしダミー画像の形式が変わったら死ぬとかの問題もあるので、あんまり良い方法では無いかもですが、  
プロジェクト都合上などで、そこまで融通が効かない状況の場合には役に立つと思います。
