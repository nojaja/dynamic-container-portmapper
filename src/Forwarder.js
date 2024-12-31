const TCPForwarder = require('./TCPForwarder');
const UDPForwarder = require('./UDPForwarder');

class Forwarder {
  constructor(rule) {
    this.caption = rule.caption || ""
    this.forwarders = rule.forwardRule.map(forwardRule => {
      const ForwarderClass = forwardRule.Protocol.toLowerCase() === 'udp' ? UDPForwarder : TCPForwarder;
      const forwarderClass = new ForwarderClass(this.caption, forwardRule.listenPort, forwardRule.forwardPort, forwardRule.forwardHost || 'localhost');
      forwarderClass.isTrigger = forwardRule.isTrigger;
      forwarderClass.toggle = rule.toggle || "stop";
      forwarderClass.wait_period = rule.wait_period || 1000;
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
