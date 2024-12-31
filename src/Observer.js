const EventEmitter = require('events');
const ContainerController = require('./ContainerController');

class Observer extends EventEmitter {
  constructor(rule) {
    super();
    this.caption = rule.caption || ""
    this.containerName = rule.containerName;
    this.triggerRules = rule.forwardRule.filter(rule => rule.isTrigger);
    this.connectionCount = 0;
    this.containerController = new ContainerController();
  }

  addForwarder(forwarder) {
    if(forwarder.isTrigger) {
      forwarder.on('connection', (connectionCount) => this.handleConnection(forwarder,connectionCount));
      forwarder.on('disconnection', (connectionCount) => this.handleDisconnection(forwarder,connectionCount));
    }    
  }

  async handleConnection(forwarder, connectionCount) {
    console.log(`${forwarder.caption} ${forwarder.protocol} 接続数が変更されました: ${connectionCount}`);
    this.connectionCount++;
    if (this.connectionCount === 1) {
      await this.containerController.unpauseContainer(this.containerName);
      this.emit('resume');
    }
  }

  async handleDisconnection(forwarder, connectionCount) {
    console.log(`${forwarder.caption} ${forwarder.protocol} 接続数が変更されました: ${connectionCount}`);
    this.connectionCount--;
    if (this.connectionCount === 0) {
      await this.containerController.pauseContainer(this.containerName);
      this.emit('suspend');
    }
  }
}

module.exports = Observer;
