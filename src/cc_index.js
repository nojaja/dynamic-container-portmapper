const ContainerController = require('./ContainerController');

async function main() {
  const controller = new ContainerController();
  const containerId = 'b825f8e6ac0b';

  await controller.listRunningContainers();

  await controller.getContainerStatus(containerId);
  await controller.pauseContainer(containerId);
  
  await controller.getContainerStatus(containerId);
  console.log('5秒間待機します...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  await controller.unpauseContainer(containerId);

  await controller.getContainerStatus(containerId);

}

main().catch(error => console.error('エラーが発生しました:', error.message));
