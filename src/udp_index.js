const UDPForwarder = require('./UDPForwarder');

// UDPForwarder のインスタンスを作成
const listenPort = 19136;////7773;//7778;//  // 待ち受けポート
const forwardPort = 19135;////7772;//7777;// // 転送先ポート
const forwardHost = 'localhost';  // 転送先のアドレス

const forwarder = new UDPForwarder(listenPort, forwardPort, forwardHost);

forwarder.on('connection', (connectionCount) => {
  console.log(`接続数が変更されました: ${connectionCount}`);
});
forwarder.on('disconnection', (connectionCount) => {
  console.log(`接続数が変更されました: ${connectionCount}`);
});

// UDPForwarder を起動
forwarder.start()
.catch((err) => {
    console.error('UDPフォワーダーの起動中にエラーが発生しました:', err);
});

console.log(`UDP転送サーバーを起動しました。`);
console.log(`リッスンポート: ${listenPort}`);
console.log(`転送先: ${forwardHost}:${forwardPort}`);

// プロセス終了時の処理
process.on('SIGINT', async () => {
  console.log('プロセス終了シグナルを受信しました。サーバーを停止します。');
  await forwarder.stop();
  process.exit();
});
