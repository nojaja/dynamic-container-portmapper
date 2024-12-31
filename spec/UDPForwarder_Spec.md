Node.jsを使用してUDPポート転送プログラムを作成し、それに対応するJestテストコードを生成してください。
以下の要件と条件を満たすようにしてください：

## プログラムの要件

- 特定のUDPポートで待ち受けを行う
- アクセスが来たら他のポートに転送する
- 複数のアクセス元からの接続を処理できる
- 転送元の接続はserverとする
- 転送先の接続はforwardSocketとする
- messageイベントの処理はforwardMessageメソッドを作成して処理する
- アクセス元の特定情報は`${rinfo.address}:${rinfo.port}`としてclientKeyに格納する
- clientConnectionsにclientKeyをkeyにsocketとrinfoを保存する
- アクセス元がclientConnectionsに存在している場合はsocketを使い回す
- clientConnectionsに登録されている情報は最後に取得した時間から2分経過参照がなかったら削除する
- 転送先からの複数回のレスポンスを受け取り、アクセス元に返却する
- プログラムとテストコードは、可読性が高く、適切にコメントされたものにしてください。
- エラーハンドリングも考慮に入れてください。
- アクセス元からの接続数が増加するとconnectionイベント、減少するとdisconnectionイベントを発行し、onメソッドでハンドリングが出来るようにする、イベントの引数は接続数とする
- clientConnections.clear()時もdisconnectionイベントを発行する
- 一時停止機能(suspend)を実装してください
  - forwardMessageは非同期で動作して、一時停止が解除されるのを待って動作するようにしてください。
  - 一時停止中もアクセス元からのデータは受け取り続けるようにしてください
  - forwardMessageが非同期なのを活用して、一時停止が解除されたときに受け取っていたデータが欠損なく送信されるようにしてください

## UDPForwarderクラスのメソッド要件

- constructor(listenPort, forwardPort, forwardHost) 
- async start()
  - 非同期でPromiseを返す
  - serverのerrorイベントをハンドリング
  - serverのmessageイベントをforwardMessageに渡す
  - serverのlisteningイベントをハンドリング
- async stop()
  - 非同期でPromiseを返す
  - clientConnectionsに登録されているすべての接続を切断
- async forwardMessage(msg, rinfo)
  - 非同期でPromiseを返す
  - 新規アクセスの場合はforwardSocket作成
  - クライアント情報の保存処理
  - forwardSocketのmessageイベントで「転送先からのレスポンスの処理」
  - forwardSocketのerrorイベントで「エラー処理」
  - 最終アクセス時間の更新
  - メッセージの転送
- startCleanupInterval()
- stopCleanupInterval() 
- suspend() 
- resume() 


## 技術的な条件

- Node.js バージョン: v11.13.0
- Webpack バージョン: v5.74 (バンドル化に使用)
- Jest バージョン: v26.6.3
- ログメッセージ: 日本語で表記

## ファイル構成

- メインプログラム: ./src/udp_index.js
- 処理本体(class): ./src/UDPForwarder.js
- テストコード配置パス: ./src/__tests__/
- 指示の無いファイルはファイルパスを表記

## テストコード要件

1. Jestを使用してテストコードを作成
2. 以下のテストケースを最低限含める：
   - サーバーが正しいポートでリッスンしていることを確認
   - メッセージを受信して転送することを確認
   - 転送先からのレスポンスを元のクライアントに送り返すことを確認

## その他の要件

   - プログラムがクラスの場合、それを利用するサンプルプログラムも作成
   - npm run buildコマンドでWebpackを使用してバンドル化できるようにする

## 出力

1. UDPポート転送プログラムのソースコードを作成
2. Jestを使用したテストコードを作成
3. テストコードの配置パスとファイル名を指定
4. git公開用のreadme.md
5. UDPForwarderクラスの使い方を開発用LLMに伝えるためのプロンプト

プログラムとテストコードは、可読性が高く、適切にコメントされたものにしてください。
また、エラーハンドリングも考慮に入れてください。
