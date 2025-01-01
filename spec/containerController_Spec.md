Node.jsを使用してDockerコンテナの操作を行うプログラムを作成してください。以下の要件を満たすようにしてください：

## 技術要件

- Node.js バージョン: v11.13.0
- Webpack バージョン: v5.74 (バンドル化に使用)
- Jest バージョン: v26.6.3
- dockerode バージョン: v4.0.2

## 前提条件

- Dockerデーモンが実行中で、適切な権限がある
- Node.jsがインストール済である
- Docker APIと通信するためのライブラリとしてdockerodeを利用する

## ファイル構成

- 実行サンプル: `./src/cc_index.js`
- 処理本体(class): `./src/ContainerController.js`
- テストコード配置パス: `./src/__tests__/`
- Webpack設定: `./webpack.config.js`
- README: `./README.md`
- その他のファイルはファイルパスをヘッダに明記すること

## 主な機能

1. コンテナの一時停止（pauseContainer）
2. コンテナの再開（unpauseContainer）
3. コンテナの停止（stopContainer）
4. コンテナの開始（startContainer）
5. 稼働中コンテナ一覧の表示(listRunningContainers)
6. コンテナの状態表示(getContainerStatus)
7. コンテナの名称表示(getContainerName)
8. 実行サンプル用のプログラム（一時停止、待機、再開、一覧表示のシーケンスを実行）

## 実装すべき関数

ContainerController クラス内に以下の関数を実装してください：

- `constructor(conf)`: Dockerクライアントの初期化
- `pauseContainer(containerId)`: 指定されたコンテナを一時停止する
  - 一時停止可能かgetContainerStatusでチェックすること
- `unpauseContainer(containerId)`: 一時停止されたコンテナを再開する
  - 再開可能かgetContainerStatusでチェックすること
- `stopContainer(containerId)`: 指定されたコンテナを停止する
  - 停止可能かgetContainerStatusでチェックすること
- `startContainer(containerId)`: 停止されたコンテナを開始する
  - 開始可能かgetContainerStatusでチェックすること
- `listRunningContainers()`: 稼働中のコンテナ一覧を表示する
- `getContainerStatus(containerId)`: containerIdの状態を取得する
- `getContainerName(containerId)`: containerIdの名称を取得する

## 実装の詳細

1. エラーハンドリング:
   - try-catchを使用して、各操作でエラーが発生した場合にエラーメッセージを表示する

2. 非同期処理:
   - 非同期関数を使用（async/await）
   - Promise.allを使用せず、逐次的に処理を行う

3. コンテナ一覧表示:
   - 表示する情報: ID（短縮形）、名前、イメージ、状態、ステータス

4. 出力:
   - 各操作の成功時にコンソールにメッセージを表示（日本語）
   - エラー発生時にエラーメッセージをコンソールに表示（日本語）

5. コードの構造:
   - コードにコメントを追加して、各部分の説明を行う
   - コンテナ名は変数として定義し、簡単に変更できるようにする

## テストコード要件

1. Jestを使用してテストコードを作成
2. 以下のテストケースを最低限含める：
   - コンテナ名`b825f8e6ac0b`が存在していることの確認
   - コンテナ名`b825f8e6ac0b`が停止再開できることの確認
   - 稼働中コンテナ一覧が正しく取得できることの確認
   - console.logのモック化

## その他の要件

1. ContainerControllerクラスを利用するサンプルプログラムを作成
2. npm run buildコマンドでWebpackを使用してバンドル化できるようにする
3. git公開用のREADME.mdを作成

## 注意点

- コンテナの一時停止はプロセスを凍結するが、メモリ内の状態は保持される
- システム再起動後の状態保持には別の方法が必要

## 期待する出力結果

1. プログラムのソースコード
2. Jestを使用したテストコード
3. git公開用のreadme.md
4. 各種設定手順
5. ContainerControllerクラスの使い方を開発用LLMに伝えるためのプロンプト

プログラム、テストコード、README.mdは可読性が高く、適切にコメントされたものにしてください。また、エラーハンドリングも考慮に入れてください。
