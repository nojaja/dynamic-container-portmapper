const TCPForwarder = require('../TCPForwarder');
const net = require('net');
const { promisify } = require('util');

jest.setTimeout(30000);

describe('TCPForwarder', () => {
    let forwarder;
    let server;
    let client;
    let consoleLogSpy;

    const listenPort = 3000;
    const forwardPort = 4000;
    const forwardHost = '127.0.0.1';

    beforeAll(async () => {
        // Create a mock server to act as the forward destination
        server = net.createServer((socket) => {
            socket.on('data', (data) => {
                socket.write(data); // Echo back the data
            });
        });
        await promisify(server.listen.bind(server))(forwardPort, forwardHost);
    });

    afterAll(async () => {
        server.close();
    });

    beforeEach(() => {
        // console.logのモック化
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
        forwarder = new TCPForwarder(listenPort, forwardPort, forwardHost);
    });

    afterEach(async () => {
        await forwarder.stop();
    });

    test('サーバーが正しいポートでリッスンしていることを確認', async () => {
        await forwarder.start();
        const clientSocket = net.createConnection({ port: listenPort });
        await new Promise((resolve) => clientSocket.on('connect', resolve));
        clientSocket.end();
    });

    test('メッセージを受信して転送することを確認', async () => {
        await forwarder.start();

        const clientSocket = net.createConnection({ port: listenPort });
        const message = 'Hello, World!';

        clientSocket.write(message);

        const data = await new Promise((resolve) => {
            clientSocket.on('data', (data) => resolve(data.toString()));
        });

        expect(data).toBe(message);
        clientSocket.end();
    });

    test('転送先からのレスポンスを元のクライアントに送り返すことを確認', async () => {
        await forwarder.start();

        const clientSocket = net.createConnection({ port: listenPort });
        const message = 'Ping';

        clientSocket.write(message);

        const data = await new Promise((resolve) => {
            clientSocket.on('data', (data) => resolve(data.toString()));
        });

        expect(data).toBe(message);
        clientSocket.end();
    });
});
