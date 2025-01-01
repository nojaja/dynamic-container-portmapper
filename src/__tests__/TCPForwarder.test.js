const net = require('net');
const TCPForwarder = require('../TCPForwarder');

describe('TCPForwarder', () => {
  let server, client;

  beforeAll(() => {
    server = net.createServer((socket) => socket.pipe(socket));
    server.listen(4000, '127.0.0.1');
  });

  afterAll(() => server.close());

  test('サーバーが正しいポートでリッスンしていることを確認', async () => {
    const forwarder = new TCPForwarder('テストラベル', 3001, 4000, '127.0.0.1');
    
    await forwarder.start();
    
    const clientTest = net.createConnection({ port: 3001 }, () => clientTest.end());
    
    clientTest.on('connect', async () => {
      expect(forwarder.server.listening).toBe(true);
      await forwarder.stop();
    });
  });

  test('メッセージを受信して転送することを確認', async (done) => {
    const forwarder = new TCPForwarder('テストラベル', 3002, 4000, '127.0.0.1');
    
    await forwarder.start();

    const testClient = net.createConnection({ port: 3002 }, () => testClient.write('Hello'));
    
    testClient.on('data', (data) => {
      expect(data.toString()).toBe('Hello');
      
      testClient.end();
      
      forwarder.stop().then(done);
    });
  });
});
