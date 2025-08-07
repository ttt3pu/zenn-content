---
title: "Renovateのgroup機能でPR管理を効率化しよう"
emoji: "📚"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["renovate"]
published: true
publication_name: arm_techblog
---

弊社ではライブラリの更新管理に[Renovate](https://www.mend.io/renovate/)を使用しています。  
設定項目が豊富でカスタマイズし放題なため、チームの要件に合わせた柔軟な設定が可能で重宝しています。

当記事ではRenovateの**グループ化機能**について紹介します。  
これを活用することで、Pull Request（以下PRと略します）の管理を効率化することができます。

## Renovateのグループ化機能とは

グループ化機能は、複数のライブラリ更新を1つのPRにまとめる機能です。  
これにより、PRの数を削減し、関連するライブラリを効率的に管理できます。

### 設定例

`renovate.json` の `packageRules` に `groupName` を設定することで有効になります。

```json
{
  "packageRules": [
    {
      "description": "Tailwind関連のライブラリは1つのPRにまとめる",
      "groupName": "Tailwind packages",
      "matchManagers": ["npm"],
      "matchPackageNames": [
        "@nuxtjs/tailwindcss",
        "tailwindcss"
      ]
    },
    {
      "description": "JavaScriptランタイム関連は1つのPRにまとめる",
      "groupName": "JavaScript runtimes",
      "matchPackageNames": [
        "pnpm",
        "node"
      ]
    }
  ]
}
```

### 設定項目の詳細

| 項目名 | 役割 |
|--------|------|
| `description` | コメント。Renovateの動作には影響なし |
| `groupName` | グループの一意識別子。PRのタイトルとしても反映される |
| `matchManagers` | パッケージマネージャーで絞り込みしたい場合は指定する |
| `matchPackageNames` | グループ化したいライブラリ名の配列 |

## グループ化機能のメリット

実際の業務でRenovateを使用しているのですが、弊社では以下のような問題が発生していました。

### 問題点: **PRの作成キューが滞留する**

Renovateが一度に作成できるPR数は、トークン制限などの都合により限られているため、  
使用しているライブラリやリポジトリ数が多い場合、大量にPR作成待ちが生まれてしまうという問題が起きます。

単純な解決策としては、「定期的に[Dependency Dashboard](https://docs.renovatebot.com/key-concepts/dashboard/)を見に行き、手動でチェックを入れてPRを作成する」という方法がありますが、  
これだと以下の問題点が発生します。

- 確認しに行く手間がかかってしまう
- 一気にPRを作成してしまうと、GitHub Actionsのキューが溜まってしまい、消化が追いつかなくなる
  - キュー待ちの対象はOrganization内のActionsすべてとなるため、業務にも支障が出る可能性があり意外と危険

### 解決策: **グループ化を活用し、作成されるPR数を減らす**

根本的な解決策を考えた結果、「**作成されるPR数を減らしていく**」ことを目指すことにしました。  
そこでグループ化の機能が活躍します。  

例えば「**テスト観点が同じもの**」を重点にグループ化を行うことができます。
いくつか設定例をご紹介します。

#### 例1. 依存関係のあるライブラリをグループ化

[tailwind本体](https://tailwindcss.com/) と [Nuxtのtailwindモジュール](https://tailwindcss.nuxtjs.org/) をグループ化しました。  
このライブラリ2点の動作テストの観点は同じなため、PRをグループ化することでマージまでのフローを効率化できます。

```json
{
  "description": "Tailwind関連のライブラリは1つのPRにまとめる",
  "groupName": "Tailwind packages",
  "matchManagers": ["npm"],
  "matchPackageNames": [
    "@nuxtjs/tailwindcss",
    "tailwindcss"
  ]
}
```

#### 例2. 開発・テストツール系をグループ化

[Eslint](https://eslint.org/)、 [Prettier](https://prettier.io/) 、[Vitest](https://vitest.dev/)などの、開発支援・テストツール系のライブラリをグループ化します。  
これらのライブラリのテスト観点は、どれも「**CIが通っていればOK**」な類のため、1つにまとめることで効率化できます。

```json
{
  "description": "開発・テストツール",
  "groupName": "Development tools",
  "matchPackageNames": [
    "eslint",
    "prettier",
    "vitest"
  ]
}
```

## まとめ

Renovateのグループ化機能を活用することで、PR管理の効率化に繋げることができます。

- **PR数の削減**による管理負荷の軽減
- **関連ライブラリのグループ化**によるテスト効率の向上

## 参考リンク

- [Renovate Documentation - Grouping](https://docs.renovatebot.com/configuration-options/#group)
- [Renovate Configuration Examples](https://docs.renovatebot.com/examples/)
