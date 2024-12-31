Node.jsを使用してTCPポート転送プログラムを作成し、それに対応するJestテストコードを生成してください。
以下の要件と条件を満たすようにしてください：

## プログラムの要件

- 特定のTCPポートで待ち受けを行う
- アクセスが来たら他のポートに転送する
- 複数のアクセス元からの接続を処理できる
- 転送元の接続はserverとする
- 転送先の接続はforwardSocketとする
- 新規接続処理はforwardMessageメソッドを作成して処理する
- 転送先からの複数回のレスポンスを受け取り、アクセス元に返却する
- プログラムとテストコードは、可読性が高く、適切にコメントされたものにしてください。
- エラーハンドリングも考慮に入れてください。
- アクセス元からの接続数が増加するとconnectionイベント、減少するとdisconnectionイベントを発行し、onメソッドでハンドリングが出来るようにする、イベントの引数は接続数(clientConnections.size)とする
- 一時停止機能(suspend)を実装してください
  - forwardMessageは非同期で動作して、100ms毎に一時停止が解除されたか確認を行い、解除されるのを待ってforwardSocketを作成するようにしてください。
  - 一時停止中もアクセス元からのデータは受け取り続けるようにしてください
  - forwardMessageが非同期なのを活用して、一時停止が解除されたときに受け取っていたデータが欠損なく送信されるようにしてください

## TCPForwarderクラスのメソッド要件

- constructor(listenPort, forwardPort, forwardHost) 
- async start()
  - 非同期でPromiseを返す
  - createServerでserver作成
  - log出力`クライアント接続: ${clientSocket.remoteAddress}:${clientSocket.remotePort}
  - serverのconnectionListener処理をforwardMessageに実装
  - serverのlisteningイベントをハンドリング
    - log出力`TCPポート転送サーバーが起動しました。ポート: ${this.listenPort}`
  - serverのerrorイベントをハンドリング
- async stop()
  - 非同期でPromiseを返す
  - clientConnectionsに登録されているすべての接続を切断
  - clientConnections.clear
  - `disconnection`イベント発火
- async forwardMessage(clientSocket)
  - log出力`クライアント接続: ${clientSocket.remoteAddress}:${clientSocket.remotePort}`
  - createConnectionでforwardSocket作成
    - log出力`転送先に接続: ${this.forwardHost}:${this.forwardPort}`
  - clientSocketのdataイベントでforwardSocketに転送
    - Socketにwriteするとき、既に切断されている場合を考慮してdestroyedをチェックすること
    - writeのエラーハンドリング
  - clientSocketの`close`イベントのハンドリング
    - log出力`クライアント接続終了`
    - forwardSocket接続終了処理(forwardSocket.end())
    - 既に切断されている場合を考慮してdestroyedをチェックすること
  - clientSocketのerrorイベントで「エラー処理」のハンドリング
    - errorlog出力`クライアントエラー:${err}`
    - forwardSocket接続終了処理
    - 既に切断されている場合を考慮してdestroyedをチェックすること
  - forwardSocketのdataイベントでclientSocketに転送
    - Socketにwriteするとき、既に切断されている場合を考慮してdestroyedをチェックすること
    - writeのエラーハンドリング
  - forwardSocketの`close`イベントのハンドリング
    - log出力`転送先接続終了`
    - clientSocket接続終了処理
    - 既に切断されている場合を考慮してdestroyedをチェックすること
  - forwardSocketのerrorイベントで「エラー処理」のハンドリング
    - errorlog出力`転送先エラー:${err}`
    - clientSocket接続終了処理
    - 既に切断されている場合を考慮してdestroyedをチェックすること
- suspend() 
- resume() 


## 技術的な条件

- Node.js バージョン: v11.13.0
- Webpack バージョン: v5.74 (バンドル化に使用)
- Jest バージョン: v26.6.3
- ログメッセージ: 日本語で表記

## ファイル構成

- メインプログラム: ./src/tcp_index.js
- 処理本体(class): ./src/TCPForwarder.js
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

1. TCPポート転送プログラムのソースコードを作成
2. Jestを使用したテストコードを作成
3. テストコードの配置パスとファイル名を指定
4. git公開用のreadme.md
5. TCPForwarderクラスの使い方を開発用LLMに伝えるためのプロンプト

プログラムとテストコードは、可読性が高く、適切にコメントされたものにしてください。
また、エラーハンドリングも考慮に入れてください。

