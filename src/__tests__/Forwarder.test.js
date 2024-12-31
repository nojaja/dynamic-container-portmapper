const Forwarder = require('../Forwarder');
const TCPForwarder = require('../TCPForwarder');
const UDPForwarder = require('../UDPForwarder');

jest.mock('../TCPForwarder');
jest.mock('../UDPForwarder');

describe('Forwarder', () => {
  let forwarder;
  const mockRule = [
    { Protocol: 'tcp', listenPort: 8080, forwardPort: 80, forwardHost: 'example.com' },
    { Protocol: 'udp', listenPort: 5353, forwardPort: 53 }
  ];

  beforeEach(() => {
    TCPForwarder.mockClear();
    UDPForwarder.mockClear();
    forwarder = new Forwarder(mockRule);
  });

  test('constructor creates correct forwarders', () => {
    expect(TCPForwarder).toHaveBeenCalledWith(8080, 80, 'example.com');
    expect(UDPForwarder).toHaveBeenCalledWith(5353, 53, 'localhost');
  });

  test('start method calls start on all forwarders', async () => {
    await forwarder.start();
    expect(TCPForwarder.mock.instances[0].start).toHaveBeenCalled();
    expect(UDPForwarder.mock.instances[0].start).toHaveBeenCalled();
  });

  test('stop method calls stop on all forwarders', async () => {
    await forwarder.stop();
    expect(TCPForwarder.mock.instances[0].stop).toHaveBeenCalled();
    expect(UDPForwarder.mock.instances[0].stop).toHaveBeenCalled();
  });

  test('suspend method calls suspend on all forwarders', () => {
    forwarder.suspend();
    expect(TCPForwarder.mock.instances[0].suspend).toHaveBeenCalled();
    expect(UDPForwarder.mock.instances[0].suspend).toHaveBeenCalled();
  });

  test('resume method calls resume on all forwarders', () => {
    forwarder.resume();
    expect(TCPForwarder.mock.instances[0].resume).toHaveBeenCalled();
    expect(UDPForwarder.mock.instances[0].resume).toHaveBeenCalled();
  });
});
