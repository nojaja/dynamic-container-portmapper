Node.jsを使用してTCPポート転送プログラムを作成し、それに対応するJestテストコードを生成してください。
以下の要件と条件を満たすようにしてください：

## プログラムの要件

- 特定のTCPポートで待ち受けを行う
- アクセスが来たら他のポートに転送する
- 複数のアクセス元からの接続を処理できる
- 転送元の接続はserverとする
- 転送先の接続はforwardSocketとする
- 新規接続処理は`forwardMessage(clientSocket) `メソッド内で実装
- 転送先からの複数回のレスポンスを受け取り、アクセス元に返却する
- 以下のイベント機能を実装してください：
  - connection: 新しい接続確立時に発火。引数として現在のアクティブ接続数（例: clientConnections.size）を渡します。
  - disconnection: 接続終了時に発火。引数として現在のアクティブ接続数（例: clientConnections.size）を渡します。
- 一時停止機能（suspend()）と再開機能（resume()）：
  - 一時停止中もアクセス元からデータは受け取ります。ただしforwardSocketを作成処理は保留します。
  - forwardMessageは非同期で動作して、100ms毎に一時停止`this.isSuspended`が解除されたか確認を行い、解除されるのを待ってforwardSocketを作成するようにしてください。
  - forwardMessageが非同期なのを活用して、一時停止が解除されたときに受け取っていたデータが欠損なく送信されるようにしてください
- コンストラクタに'caption'パラメータを追加し、ログメッセージの先頭に付加するラベルとして使用する
- プロトコル識別子'tcp'をthis.protocolとしてコンストラクタに追加
- サーバーのリッスンアドレスを'0.0.0.0'に設定
- プログラムとテストコードは、可読性が高く、適切にコメントされたものにしてください。
- エラーハンドリングも考慮に入れてください。
  - ソケットエラーや転送エラー時には適切なログ出力とリソース解放処理（例: destroy()）を行ってください。
- ログメッセージにはコンストラクタで指定された識別子（例: caption）を付加してください。
- サーバー停止時には全ての接続リソース（例: クライアントソケット）を解放し、残り接続数0として disconnection イベントを発火してください。


## TCPForwarderクラスのメソッド要件

- constructor(caption, listenPort, forwardPort, forwardHost) 
  - caption: ログメッセージに使用される識別子
  - listenPort: リッスンするポート
  - forwardPort: 転送先のポート
  - forwardHost: 転送先のホスト
  - `this.protocol`プロパティを追加、'tcp'に設定
  - `this.isSuspended`プロパティを追加、'false'に設定
- async start()
  - 非同期でPromiseを返す
  - createServerでthis.server作成
  - connectionListenerで以下の処理を実装
    - log出力`${this.caption} TCPポート転送 クライアント接続: ${clientSocket.remoteAddress}:${clientSocket.remotePort}`
    - clientConnectionsにclientSocketを追加
    - connectionイベントを発火
    - await this.forwardMessage(clientSocket)の呼び出し
  - serverのlisteningイベントをハンドリング
    - log出力`${this.caption} TCPポート転送が ${this.server.address().address}:${this.listenPort} で起動しました`
  - this.server.listen()メソッドで'0.0.0.0'を指定、すべてのネットワークインターフェースでリッスンするようにする。
  - this.serverのerrorイベントをハンドリング、
    - errorlog出力`${this.caption} TCPポート転送 サーバーエラー: ${err.stack}`
    - reject(err)を返す
- async stop()
  - 非同期でPromiseを返す
  - クライアント接続のクリーンアップ
    - clientConnectionsに登録されているすべての接続を切断
      - 既に切断されている場合を考慮してdestroyedをチェックすること
    - clientConnections.clear
  - `disconnection`イベント発火、引数は0固定
  - サーバーが存在しない場合のチェックを追加
  - this.server.closeを実行
    - close後、log出力`${this.caption} TCPポート転送が停止しました`
- async forwardMessage(clientSocket)
  - log出力`${this.caption} TCPポート転送 クライアント接続: ${clientSocket.remoteAddress}:${clientSocket.remotePort}`
  - createConnectionでforwardSocket作成
    - log出力`${this.caption} TCPポート転送 転送先に接続: ${this.forwardHost}:${this.forwardPort}`
  - clientSocketのdataイベントでforwardSocketに転送
    - forwardSocketにdataの転送
      - forwardSocketにwriteするとき、既に切断されている場合を考慮してdestroyedをチェックすること
      - writeのエラーハンドリング
        - log出力`${this.caption} TCPポート転送 リクエスト転送エラー: ${err.stack}`
  - clientSocketの`close`イベントのハンドリング
    - log出力`${this.caption} TCPポート転送 クライアント切断`
    - clientConnectionsからクライアントソケットを削除
    - disconnectionイベントを発火
    - forwardSocket接続終了処理(forwardSocket.destroy())
      - 既に切断されている場合を考慮してdestroyedをチェックすること
  - clientSocketのerrorイベントで「エラー処理」のハンドリング
    - errorlog出力`${this.caption} TCPポート転送 クライアントエラー: ${err.stack}`
    - clientConnectionsからクライアントソケットを削除(`this.clientConnections.delete(clientSocket)`)
    - disconnectionイベントを発火( `this.emit('disconnection', this.clientConnections.size)`)
    - forwardSocket接続終了処理(forwardSocket.destroy())
      - 既に切断されている場合を考慮してdestroyedをチェックすること
  - forwardSocketのdataイベントでclientSocketに転送
    - clientSocketにdataの転送
      - clientSocketにwriteするとき、既に切断されている場合を考慮してdestroyedをチェックすること
      - writeのエラーハンドリング
        - log出力`${this.caption} TCPポート転送 レスポンス転送エラー: ${err.stack}`
  - forwardSocketの`close`イベントのハンドリング
    - log出力`${this.caption} TCPポート転送 転送先切断`
    - clientSocket接続終了処理(clientSocket.destroy())
      - 既に切断されている場合を考慮してdestroyedをチェックすること
  - forwardSocketのerrorイベントで「エラー処理」のハンドリング
    - errorlog出力`${this.caption} TCPポート転送 転送先エラー: ${err.stack}`
    - clientSocket接続終了処理(clientSocket.destroy())
      - 既に切断されている場合を考慮してdestroyedをチェックすること
- suspend() 
  - 転送を一時停止します。
  - log出力`${this.caption} TCPポート転送 サスペンド`
- resume() 
  - 一時停止した転送を再開します。
  - log出力`${this.caption} TCPポート転送 レジューム`

## TCPForwarderクラスのイベント要件
- 'connection': 新しい接続が確立されたときに発火。引数は現在のアクティブ接続数。
- 'disconnection': 接続が閉じられたときに発火。引数は残りのアクティブ接続数。

## 技術的な条件

- Node.js バージョン: v11.13.0
- Webpack バージョン: v5.74 (バンドル化に使用)
- Jest バージョン: v26.6.3
- ログメッセージ: 日本語で表記

## ファイル構成

- メインプログラム: `./src/tcp_index.js`
- 処理本体(class): `./src/TCPForwarder.js`
- テストコード配置パス: `./src/__tests__/`
- その他のファイルはファイルパスをヘッダに明記すること

## テストコード要件

1. Jestを使用してテストコードを作成
2. 以下のテストケースを最低限含める：
   - サーバーが正しいポートでリッスンしていることを確認
   - メッセージ受信後、正しく転送されること。
   - 転送先から複数回レスポンスデータが返却されること。
   - 一時停止中および再開後もデータ欠損なく転送できること。
   - イベント（connection, disconnection）発火と引数（現在の接続数）が正しいこと。
   - エラーハンドリング動作（例: ソケットエラー発生後も他接続が正常動作すること）。


## その他の要件

   - プログラムがクラスの場合、それを利用するサンプルプログラムも作成
   - npm run buildコマンドでWebpackを使用してバンドル化できるようにする

## 出力

1. TCPポート転送プログラムのソースコードを作成
2. Jestを使用したテストコードを作成
3. TCPForwarderクラスの使い方を開発用LLMに伝えるためのプロンプト

プログラムとテストコードは、可読性が高く、適切にコメントされたものにしてください。
また、エラーハンドリングも考慮に入れてください。

