// ./src/tcp_index.js

const TCPForwarder = require('./TCPForwarder');

// TCPForwarder のインスタンスを作成
const caption = 'ラベルA'
const listenPort = 7773;//7778;// 待ち受けポート
const forwardPort = 7772;//7777;// 転送先ポート
const forwardHost = 'localhost';// 転送先のアドレス

const forwarder = new TCPForwarder(caption, listenPort, forwardPort, forwardHost);

forwarder.on('connection', (connectionCount) => {
    console.log(`接続数が変更されました: ${connectionCount}`);
});
forwarder.on('disconnection', (connectionCount) => {
    console.log(`接続数が変更されました: ${connectionCount}`);
});

forwarder.start()
    .catch((err) => {
        console.error('TCPフォワーダーの起動中にエラーが発生しました:', err);
    });

console.log(`TCP転送サーバーを起動しました。`);
console.log(`リッスンポート: ${listenPort}`);
console.log(`転送先: ${forwardHost}:${forwardPort}`);

// プロセス終了時の処理
process.on('SIGINT', async () => {
    console.log('プロセス終了シグナルを受信しました。サーバーを停止します。');
    await forwarder.stop();
    process.exit();
});
