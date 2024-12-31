// ./src/__tests__/UDPForwarder.test.js

const dgram = require('dgram');
const UDPForwarder = require('../UDPForwarder');

describe('UDPForwarder', () => {
  const listenPort = 8000;
  const forwardPort = 9000;
  const forwardHost = 'localhost';
  let forwarder;
  let mockDestinationServer;

  beforeEach((done) => {
    forwarder = new UDPForwarder(listenPort, forwardPort, forwardHost);
    forwarder.start();

    mockDestinationServer = dgram.createSocket('udp4');
    mockDestinationServer.bind(forwardPort, () => {
      done();
    });
  });

  afterEach(() => {
    forwarder.stop();
    mockDestinationServer.close();
  });

  test('サーバーが正しいポートでリッスンしていることを確認', (done) => {
    const client = dgram.createSocket('udp4');
    client.send('テストメッセージ', listenPort, 'localhost', (err) => {
      if (err) {
        done(err);
      } else {
        client.close();
        done();
      }
    });
  });

  test('メッセージを受信して転送することを確認', (done) => {
    const testMessage = 'こんにちは、世界！';

    mockDestinationServer.on('message', (msg, rinfo) => {
      expect(msg.toString()).toBe(testMessage);
      done();
    });

    const client = dgram.createSocket('udp4');
    client.send(testMessage, listenPort, 'localhost', (err) => {
      if (err) {
        done(err);
      }
      client.close();
    });
  });

  test('転送先からのレスポンスを元のクライアントに送り返すことを確認', (done) => {
    const testMessage = 'こんにちは';
    const responseMessage = 'さようなら';

    mockDestinationServer.on('message', (msg, rinfo) => {
      mockDestinationServer.send(responseMessage, rinfo.port, rinfo.address);
    });

    const client = dgram.createSocket('udp4');
    client.on('message', (msg) => {
      expect(msg.toString()).toBe(responseMessage);
      client.close();
      done();
    });

    client.send(testMessage, listenPort, 'localhost', (err) => {
      if (err) {
        done(err);
      }
    });
  });
});
