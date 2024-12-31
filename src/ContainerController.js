const Docker = require('dockerode');

class ContainerController {
  constructor(conf) {
    // Dockerクライアントの初期化
    this.docker = new Docker(conf);
  }

  async pauseContainer(containerId) {
    try {
      const container = this.docker.getContainer(containerId);
      const status = await this.getContainerStatus(containerId);
      const containerName = await this.getContainerName(containerId);
      if (status !== 'running') {
        throw new Error(`コンテナ${containerName}(${containerId})は一時停止可能な状態ではありません`);
      }
      await container.pause();
      console.log(`コンテナ${containerName}(${containerId})を一時停止しました。`);
    } catch (error) {
      console.error(`コンテナ${containerId}の一時停止に失敗しました: ${error.message}`);
    }
  }

  async unpauseContainer(containerId) {
    try {
      const container = this.docker.getContainer(containerId);
      const status = await this.getContainerStatus(containerId);
      const containerName = await this.getContainerName(containerId);
      if (status !== 'paused') {
        throw new Error(`コンテナ${containerName}(${containerId})は再開可能な状態ではありません`);
      }
      await container.unpause();
      console.log(`コンテナ${containerName}(${containerId})を再開しました。`);
    } catch (error) {
      console.error(`コンテナ${containerId}の再開に失敗しました: ${error.message}`);
    }
  }

  async listRunningContainers() {
    try {
      const containers = await this.docker.listContainers();
      console.log('稼働中のコンテナ一覧:');
      containers.forEach(container => {
        console.log(`ID: ${container.Id.substring(0, 12)}, 名前: ${container.Names[0]}, イメージ: ${container.Image}, 状態: ${container.State}, ステータス: ${container.Status}`);
      });
    } catch (error) {
      console.error(`コンテナ一覧の取得に失敗しました: ${error.message}`);
    }
  }

  async getContainerStatus(containerId) {
    try {
      const container = this.docker.getContainer(containerId);
      const info = await container.inspect();
      //console.log(`コンテナ ${containerId} の状態: ${info.State.Status}`);
      return info.State.Status;
    } catch (error) {
      console.error(`コンテナ ${containerId} の状態取得に失敗しました: ${error.message}`);
      return null;
    }
  }

  async getContainerName(containerId) {
    try {
      const container = this.docker.getContainer(containerId);
      const info = await container.inspect();
      return info.Name;
    } catch (error) {
      console.error(`コンテナ ${containerId} の名称取得に失敗しました: ${error.message}`);
      return '';
    }
  }
}

module.exports = ContainerController;
