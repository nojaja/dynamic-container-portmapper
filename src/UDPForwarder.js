// ./src/UDPForwarder.js
const dgram = require('dgram');
const EventEmitter = require('events');

class UDPForwarder extends EventEmitter {
    constructor(caption, listenPort, forwardPort, forwardHost) {
        super();
        this.protocol = 'udp';
        this.caption = caption;
        this.listenPort = listenPort;
        this.forwardPort = forwardPort;
        this.forwardHost = forwardHost;
        this.server = dgram.createSocket('udp4');
        this.clientConnections = new Map();
        this.cleanupInterval = null;
        this.suspended = false;
    }

    async start() {
        return new Promise((resolve, reject) => {
            this.server.on('error', (err) => {
                console.error(`${this.caption} UDPポート転送 サーバーエラー:${err.stack}`);
                this.server.close();
                reject(err);
            });

            this.server.on('message', (msg, rinfo) => {
                //console.log(`${rinfo.address}:${rinfo.port} から ${msg.length} bytes メッセージを受信`);
                //console.log(`C->S HEX  : ${msg.toString('hex').substring(0, 18)} ${msg.length} bytes `);
                //console.log(`  ASCII: ${msg}`);
                this.forwardMessage(msg, rinfo);
            });

            this.server.on('listening', () => {
                const address = this.server.address();
                console.log(`${this.caption} UDPポート転送が ${address.address}:${address.port} で起動しました`);
                this.startCleanupInterval();
                resolve();
            });

            // 指定されたポートでの待ち受け開始
            this.server.bind(this.listenPort);
        });
    }

    async stop() {
        return new Promise((resolve) => {
            this.stopCleanupInterval();
            for (const client of this.clientConnections.values()) {
                client.socket.close();
            }
            this.clientConnections.clear();
            this.emit('disconnection', this.clientConnections.size);
            this.server.close(() => {
                console.log(`${this.caption} UDPポート転送が停止しました`);
                resolve();
            });
        });
    }

    async forwardMessage(msg, rinfo) {
        if (this.suspended) {
            await new Promise((resolve) => {
                const interval = setInterval(() => {
                    if (!this.suspended) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 100);
            });
        }
        
        const clientKey = `${rinfo.address}:${rinfo.port}`;
        let clientConnection = this.clientConnections.get(clientKey);

        if (!clientConnection) {
            const forwardSocket = dgram.createSocket('udp4');
            // クライアント情報の保存
            clientConnection =  { socket: forwardSocket, rinfo: rinfo, lastAccessed: Date.now() };
            this.clientConnections.set(clientKey, clientConnection);
            this.emit('connection', this.clientConnections.size);
            
            // 転送先からのレスポンスの処理
            forwardSocket.on('message', (response) => {
                //console.log(`転送先からレスポンスを受信: ${response}`);
                // 元のクライアントにレスポンスを送信
                this.server.send(response, rinfo.port, rinfo.address, (err) => {
                    if (err) {
                        console.error(`${this.caption} UDPポート転送 レスポンス転送エラー: ${err}`);
                    } else {
                        //console.log(`Sent response back to ${rinfo.address}:${rinfo.port}へ ${response.length} bytes メッセージを受信`);
                        ////console.log(`S:${forwardSocket.address()}->C:${rinfo.port} HEX  : ${response.toString('hex').substring(0, 18)} ${response.length} bytes `);
                        //console.log(`  ASCII: ${response}`);
                    }
                });
            });
            // エラー処理
            forwardSocket.on('error', (err) => {
                console.error(`${this.caption} UDPポート転送 転送エラー:${clientKey}: ${err}`);
                forwardSocket.close();
                this.clientConnections.delete(clientKey);
                this.emit('disconnection', this.clientConnections.size);
            });
        }
        // 最終アクセス時間の更新
        clientConnection.lastAccessed = Date.now();
        // メッセージの転送
        clientConnection.socket.send(msg, this.forwardPort, this.forwardHost, (err) => {
            if (err) {
                console.error(`${this.caption} UDPポート転送 転送エラー: ${err}`);
                forwardSocket.close();
                this.clientConnections.delete(clientKey);
                this.emit('disconnection', this.clientConnections.size);
                return;
            }
            //console.log(`メッセージを ${this.forwardHost}:${this.forwardPort} に転送`);
            //console.log(`${rinfo.address}:${rinfo.port} から ${msg.length} bytes メッセージを受信`);
            ////console.log(`C:${this.listenPort}->S:${this.forwardPort} HEX  : ${msg.toString('hex').substring(0, 18)} ${msg.length} bytes `);
            //console.log(`  ASCII: ${msg}`);
        });

    }

    startCleanupInterval() {
        this.cleanupInterval = setInterval(() => {
            const now = Date.now();
            for (const [clientKey, { lastAccessed }] of this.clientConnections) {
                if (now - lastAccessed > 5 * 60 * 1000) {
                    this.clientConnections.delete(clientKey);
                    this.emit('disconnection', this.clientConnections.size);
                }
            }
        }, 60 * 1000);
    }

    stopCleanupInterval() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }

    suspend() {
        this.suspended = true;
    }

    resume() {
        this.suspended = false;
    }
}

module.exports = UDPForwarder;
