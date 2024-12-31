// ./src/TCPForwarder.js
const net = require('net');
const EventEmitter = require('events');

class TCPForwarder extends EventEmitter {
    constructor(caption, listenPort, forwardPort, forwardHost) {
        super();
        this.protocol = 'tcp';
        this.caption = caption;
        this.listenPort = listenPort;
        this.forwardPort = forwardPort;
        this.forwardHost = forwardHost;
        this.server = null;
        this.clientConnections = new Set();
        this.suspended = false;
    }

    async start() {
        return new Promise((resolve, reject) => {
            this.server = net.createServer(async (clientSocket) => {
                console.log(`${this.caption} TCPポート転送 クライアント接続: ${clientSocket.remoteAddress}:${clientSocket.remotePort}`);
                this.clientConnections.add(clientSocket);
                this.emit('connection', this.clientConnections.size);
        
                try {
                    await this.forwardMessage(clientSocket);
                } catch (err) {
                    console.error('${this.caption} TCPポート転送 転送中にエラーが発生しました:', err);
                }
            });
            
            this.server.on('listening', () => {
                console.log(`${this.caption} TCPポート転送が ${this.server.address().address}:${this.listenPort} で起動しました`);
                resolve();
            });

            this.server.on('error', (err) => {
                console.error(`${this.caption} TCPポート転送 サーバーエラー: ${err.stack}`);
                reject(err);
            });

            this.server.listen(this.listenPort,'0.0.0.0');
        });
    }

    async stop() {
        return new Promise((resolve) => {
            for (const socket of this.clientConnections) {
                if (!socket.destroyed) {
                    socket.destroy();
                }
            }
            this.clientConnections.clear();
            this.emit('disconnection', 0);

            if (this.server) {
                this.server.close(() => {
                    console.log(`${this.caption} TCPポート転送が停止しました`);
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    async forwardMessage(clientSocket) {
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

        const forwardSocket = net.createConnection({
            port: this.forwardPort,
            host: this.forwardHost
        }, () => {
            console.log(`${this.caption} TCPポート転送 転送先に接続: ${this.forwardHost}:${this.forwardPort}`);
        });

        clientSocket.on('data', (data) => {
            //console.log(`クライアントからデータ受信: ${data.length} バイト`);
            ////console.log(`C->S HEX  : ${data.toString('hex').substring( 0, 18 )} ${data.length} bytes `);
            if (!forwardSocket.destroyed) {
                forwardSocket.write(data, (err) => {
                    if (err) {
                        console.error(`${this.caption} TCPポート転送 リクエスト転送エラー: ${err}`);
                    }
                });
            }
        });


        clientSocket.on('close', () => {
            console.log(`${this.caption} TCPポート転送 クライアント切断`);
            this.clientConnections.delete(clientSocket);
            this.emit('disconnection', this.clientConnections.size);
            if (!forwardSocket.destroyed) {
                forwardSocket.destroy();
            }
        });

        clientSocket.on('error', (err) => {
            console.error(`${this.caption} TCPポート転送 クライアントエラー: ${err}`);
            this.clientConnections.delete(clientSocket);
            this.emit('disconnection', this.clientConnections.size);
            if (!forwardSocket.destroyed) {
                forwardSocket.destroy();
            }
        });



        forwardSocket.on('data', (data) => {
            //console.log(`転送先からデータ受信: ${data.length} バイト`);
            ////console.log(`S->C HEX  : ${data.toString('hex').substring( 0, 18 )} ${data.length} bytes `);
            if (!clientSocket.destroyed) {
                clientSocket.write(data, (err) => {
                    if (err) {
                        console.error(`${this.caption} TCPポート転送 レスポンス転送エラー: ${err}`);
                    }
                });
            }
        });


        forwardSocket.on('close', () => {
            console.log(`${this.caption} TCPポート転送 転送先切断`);
            if (!clientSocket.destroyed) {
                clientSocket.destroy();
            }
        });

        forwardSocket.on('error', (err) => {
            console.error(`${this.caption} TCPポート転送 転送先エラー: ${err}`);
            if (!clientSocket.destroyed) {
                clientSocket.destroy();
            }
        });
    }

    suspend() {
        this.suspended = true;
    }

    resume() {
        this.suspended = false;
    }
}

module.exports = TCPForwarder;
