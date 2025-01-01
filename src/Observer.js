const EventEmitter = require('events');
const ContainerController = require('./ContainerController');

class Observer extends EventEmitter {
  constructor(config) {
    super();
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
      if(forwarder.toggle=="paused") await this.containerController.unpauseContainer(forwarder.containerId);
      if(forwarder.toggle=="stop") await this.containerController.startContainer(forwarder.containerId);
      this.emit('resume');
    }
  }

  async handleDisconnection(forwarder, connectionCount) {
    console.log(`${forwarder.caption} ${forwarder.protocol} 接続数が変更されました: ${connectionCount}`);
    this.connectionCount--;
    if (this.connectionCount === 0) {
      await new Promise((resolve) => {
        const interval = setInterval(() => {
                clearInterval(interval);
                resolve();
        }, forwarder.wait_period);
      });
      if (this.connectionCount === 0) {
        if(forwarder.toggle=="paused") await this.containerController.pauseContainer(forwarder.containerId);
        if(forwarder.toggle=="stop") await this.containerController.stopContainer(forwarder.containerId);
        this.emit('suspend');
      }
    }
  }
}

module.exports = Observer;
