Node.jsを使用して'config.json'で定義された設定を読み込み、TCPとUDPのポート転送を実行するプログラムを作成してください。
以下の要件を満たすようにしてください：

## 主な機能
- TCPとUDPのポート転送
- Dockerコンテナの動的な起動/停止または一時停止/再開
- 設定ファイル（config.json）による柔軟な転送ルール定義
- 接続状態に基づくコンテナ管理
- アプリケーション自体をDockerコンテナとして稼働可能

## 設計概要
### 設定ファイル (config.json)
- JSON形式で、以下の構造を持つ:
  - rules: 以下の構造を持つ:
    - caption: 設定セットの表示名
    - containerId: DockerコンテナId
    - toggleStrategy: Dockerの状態変更を起動/停止にするか一時停止/再開にするか（オプション、デフォルトは`stop`）
    - wait_period: アクセスが0になってから状態変更するまでの待ち時間（オプション、デフォルトは`60000`）
    - forwardRule: 転送ルールの配列
      - protocol: 'tcp' または 'udp'
      - listenPort: 待ち受けポート
      - forwardPort: 転送先ポート
      - forwardHost: 転送先ホスト（オプション、デフォルトは`localhost`）
      - isTrigger: コンテナ制御のトリガーとなるルール（オプション）

### 設定ファイル例
```config.json
{
   conf:{}
   rules:[
   {
      "caption": "nginx",
      "containerId": "81b2989f543e",
      "toggleStrategy": "paused",
      "wait_period": "180000",
      "forwardRule": [
         {"Protocol": "tcp", "listenPort": 7777, "forwardPort": 7777, "forwardHost": "localhost", "isTrigger": true}
      ]
   },
   {
      "caption": "server",
      "containerId": "91b2989f543e",
      "toggleStrategy": "stop",
      "wait_period": "180000",
      "forwardRule": [
         {"Protocol": "udp", "listenPort": 19137, "forwardPort": 19134, "forwardHost": "localhost"},
         {"Protocol": "udp", "listenPort": 19136, "forwardPort": 19135, "forwardHost": "localhost", "isTrigger": true},
         {"Protocol": "tcp", "listenPort": 7777, "forwardPort": 7777, "forwardHost": "localhost"}
      ]
   }
   ]
}
```

## 技術要件

- Node.js バージョン: v11.13.0
- Webpack バージョン: v5.74 (バンドル化に使用)
- Jest バージョン: v26.6.3 (テストフレームワーク)

## 前提条件

- Dockerデーモンが実行中で、適切な権限がある
- Node.jsがインストール済である
- TCPとUDPのポート転送はTCPForwarderとUDPForwarderにて実装済
- TCPForwarderとUDPForwarderの利用方法は下記を参照

## ファイル構成

- 実行サンプル: `./src/index.js`
- 転送抽象化クラス(class): `./src/Forwarder.js`
- 接続数監視クラス(class): `./src/Observer.js`
- TCP転送クラス(TCPForwarder): `./src/TCPForwarder.js`
- UDP転送クラス(UDPForwarder): `./src/UDPForwarder.js`
- Dockerコンテナの操作クラス(ContainerController): `./src/ContainerController.js`
- テストコード配置パス: `./src/__tests__/`
- 設定ファイル: `./config.json`
- Webpack設定: `./webpack.config.js`
- README: `./README.md`
- Dockerfile: `./docker/Dockerfile`
- その他のファイルはファイルパスをヘッダに明記すること

## 主要コンポーネント

- index.js
  - 設定ファイル(config.json)の読み込み
  - Forwarderとobserverの初期化と管理
- Forwarderクラス
  - TCPとUDP転送を抽象化
  - 複数の転送設定（rule）をまとめて管理。
  - TCPForwarderとUDPForwarderの呼び出し:
    - 各ルールに基づき、TCPまたはUDPのポート転送を開始します。
  - サーバーの起動と停止:
    - プログラム起動時にすべての転送を開始し、終了時には停止します。
- Observerクラス
  - Forwarderの接続状態を監視
  - Dockerコンテナの起動/停止もしくは一時停止/再開を制御
  - `isTrigger:true`が付与されている接続先の`connection`と`disconnection`イベントを監視します
  - 接続数がnから0になったらContainerControllerクラスのpauseContainerを使ってコンテナを一時停止します
  - 接続数が0から1になったらContainerControllerクラスのunpauseContainerを使ってコンテナを再開します
  - 対象のコンテナ名は設定ファイルのcontainerNameを利用します
  - 一時停止状態になったらForwarderのsuspend()を実行します
  - 再開状態になったらForwarderのresume()を実行します

## 実装すべき関数

Forwarder クラス内に以下の関数を実装してください：
- ForwarderはTCPまたはUDP転送を抽象化するクラス。
- 複数の転送設定(rule部分)をまとめて実行できる
- `constructor(rule)`: コンストラクタ
  - protocolをtoLowerCaseして'udp'ならUDPForwarder、'tcp'ならTCPForwarderをnewする
- `start()`: newしたUDPForwarderとTCPForwarderのstart()を実行する
- `stop()`: newしたUDPForwarderとTCPForwarderのstop()を実行する
- `suspend()`: newしたUDPForwarderとTCPForwarderのsuspend()を実行する
- `resume()`: newしたUDPForwarderとTCPForwarderのresume()を実行する

Observer クラス内に以下の関数を実装してください：
- Forwarderの接続状態を監視
- コンテナの一時停止/再開を制御
- `constructor(config)`: コンストラクタ
  - containerNameとisTriggerの対象を取得する

## TCPForwarderクラスの使い方

TCPForwarderクラスは、Node.jsを使用してTCPポート転送を実装するためのクラスです。以下にその使用方法と主要な機能を説明します：

1. クラスのインスタンス化:
   const forwarder = new TCPForwarder(caption, listenPort, forwardPort, forwardHost);
   - caption: ログメッセージに使用される識別子
   - listenPort: 待ち受けるポート番号
   - forwardPort: 転送先のポート番号
   - forwardHost: 転送先のホスト名またはIPアドレス
   - `this.protocol`プロパティを追加、'udp'に設定
   - `this.isSuspended`プロパティを追加、'false'に設定

2. サーバーの起動:
   await forwarder.start();
   - 非同期メソッドで、Promiseを返します
   - サーバーが正常に起動するまで待機します

3. サーバーの停止:
   await forwarder.stop();
   - 非同期メソッドで、Promiseを返します
   - すべての接続を閉じ、サーバーを停止します

主な特徴:
- 複数のクライアント接続を同時に処理できます
- エラーハンドリングが実装されています
- 転送先サーバーからの応答を元のクライアントに送り返します

使用例:
```
const TCPForwarder = require('./TCPForwarder');

async function main() {
  const forwarder = new TCPForwarder('サーバ', 8080, 80, 'example.com');
  
  try {
    await forwarder.start();
    console.log('TCPポート転送サーバーが起動しました');
    
    // サーバーを実行したままにする
    process.on('SIGINT', async () => {
      await forwarder.stop();
      console.log('TCPポート転送サーバーを停止しました');
      process.exit(0);
    });
  } catch (error) {
    console.error('サーバーの起動に失敗しました:', error);
  }
}

main();
```

このクラスを使用する際は、適切なエラーハンドリングと非同期処理の管理を行ってください。

## UDPForwarderクラスの使い方

UDPForwarderクラスは、UDPポート転送を実装するNode.jsクラスです。以下の機能と使用方法を理解してください：

1. クラスの初期化:
   ```javascript
   const forwarder = new UDPForwarder(caption, listenPort, forwardPort, forwardHost);
   ```
   - caption: ログメッセージに使用される識別子
   - listenPort: 待ち受けるポート番号
   - forwardPort: 転送先のポート番号
   - forwardHost: 転送先のホスト名またはIPアドレス

2. サーバーの起動:
   ```javascript
   await forwarder.start();
   ```
   - 非同期関数として実装されており、Promiseを返します。

3. サーバーの停止:
   ```javascript
   await forwarder.stop();
   ```
   - 非同期関数として実装されており、Promiseを返します。

4. 一時停止と再開:
   ```javascript
   forwarder.suspend();
   forwarder.resume();
   ```
   - 転送処理を一時的に停止/再開します。

5. イベントハンドリング:
   ```javascript
   forwarder.on('connection', (count) => {
     console.log(`接続数: ${count}`);
   });

   forwarder.on('disconnection', (count) => {
     console.log(`接続数: ${count}`);
   });
   ```
   - 'connection'イベント: 新しい接続が確立されたときに発火
   - 'disconnection'イベント: 接続が切断されたときに発火

6. エラーハンドリング:
   - サーバーの起動時や転送処理中のエラーは適切に処理されます。
   - エラーはコンソールにログ出力されます。

7. 非同期処理:
   - start()、stop()、forwardMessage()メソッドは非同期で動作します。

8. 一時停止中の動作:
   - 一時停止中もデータは受け取り続けますが、転送は再開後まで待機します。

このクラスを使用する際は、適切なエラーハンドリングとリソース管理を行ってください。また、ネットワークセキュリティに関する考慮事項も忘れずに対応してください。

## ContainerControllerクラスの使い方

ContainerControllerクラスは、Node.jsアプリケーションでDockerコンテナを操作するためのクラスです。
以下に、このクラスの基本的な使用方法を示します。

1. クラスのインポートと初期化

```javascript
const conf = {}
const ContainerController = require('./ContainerController');
const controller = new ContainerController(conf);
```

2. コンテナの一時停止

```javascript
await controller.pauseContainer('containerId');
```
   - 指定されたコンテナを一時停止します。
   - コンテナが実行中でない場合はエラーをスローします。

3. コンテナの再開

```javascript
await controller.unpauseContainer('containerId');
```
   - 一時停止されたコンテナを再開します。
   - コンテナが一時停止状態でない場合はエラーをスローします。

4. コンテナの停止

```javascript
await controller.stopContainer('containerId');
```
   - 指定されたコンテナを停止します。
   - コンテナが実行中でない場合はエラーをスローします。

5. コンテナの開始

```javascript
await controller.startContainer('containerId');
```
   - 一時停止されたコンテナを開始します。
   - コンテナが停止状態でない場合はエラーをスローします。


6. 稼働中コンテナ一覧の表示

```javascript
await controller.listRunningContainers();
```
   - 稼働中のコンテナ一覧を表示します。
   - 各コンテナのID、名前、イメージ、状態、ステータスを表示します。

7. コンテナの状態表示

```javascript
await controller.getContainerStatus('containerId');
```
   - 指定されたコンテナの状態を取得します。
   - エラーが発生した場合はnullを返します。

8. コンテナの名称表示

```javascript
await controller.getContainerName('containerId');
```
   - 指定されたコンテナの名称を取得します。
   - エラーが発生した場合は""を返します。

使用例：

```javascript
async function main() {
  const controller = new ContainerController({});
  const containerId = 'your_container_id';

  // コンテナ一覧の表示
  await controller.listRunningContainers();

  // コンテナの状態表示
  await controller.getContainerStatus(containerId);

  // コンテナの一時停止
  await controller.pauseContainer(containerId);

  // 5秒待機
  await new Promise(resolve => setTimeout(resolve, 5000));

  // コンテナの再開
  await controller.unpauseContainer(containerId);

  // コンテナの状態再表示
  await controller.getContainerStatus(containerId);
}

main().catch(error => console.error('エラーが発生しました:', error));
```

注意事項：

1. すべてのメソッドは非同期（async）で、Promiseを返します。使用時は`await`キーワードを使用するか、`.then()`メソッドでチェーンしてください。
2. エラーハンドリングは各メソッド内で行われますが、必要に応じて追加のエラーハンドリングを実装してください。
3. Dockerデーモンが実行中で、適切な権限があることを確認してください。
4. コンテナ名は正確に指定する必要があります。存在しないコンテナ名を指定するとエラーが発生します。

このクラスを使用して、Dockerコンテナの基本的な操作を簡単に行うことができます。



## テストコード要件

1. Jestを使用してテストコードを作成
2. 以下のテストケースを最低限含める：
   - rule.jsonの設定での動作確認

## その他の要件

1. Forwarderクラスを利用するサンプルプログラムを作成
2. npm run buildコマンドでWebpackを使用してバンドル化できるようにする
3. git公開用のREADME.mdを作成

## 期待する出力結果

1. プログラムのソースコード
2. Jestを使用したテストコード
3. git公開用のreadme.md
4. 各種設定手順
5. Forwarderクラスの使い方を開発用LLMに伝えるためのプロンプト
6. Dockerコンテナとして稼働させるためのDockerfile

プログラム、テストコード、README.mdは可読性が高く、適切にコメントされたものにしてください。また、エラーハンドリングも考慮に入れてください。
