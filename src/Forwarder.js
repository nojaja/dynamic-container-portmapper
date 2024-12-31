const TCPForwarder = require('./TCPForwarder');
const UDPForwarder = require('./UDPForwarder');

class Forwarder {
  constructor(rule) {
    this.caption = rule.caption || ""
    this.forwarders = rule.forwardRule.map(rule => {
      const ForwarderClass = rule.Protocol.toLowerCase() === 'udp' ? UDPForwarder : TCPForwarder;
      const forwarderClass = new ForwarderClass(this.caption, rule.listenPort, rule.forwardPort, rule.forwardHost || 'localhost');
      forwarderClass.isTrigger = rule.isTrigger;
      return forwarderClass
    });
  }

  async start() {
    await Promise.all(this.forwarders.map(forwarder => forwarder.start()));
  }

  async stop() {
    await Promise.all(this.forwarders.map(forwarder => forwarder.stop()));
  }

  suspend() {
    this.forwarders.forEach(forwarder => forwarder.suspend());
  }

  resume() {
    this.forwarders.forEach(forwarder => forwarder.resume());
  }
}

module.exports = Forwarder;
