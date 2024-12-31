const ContainerController = require('../ContainerController');

jest.mock('dockerode');

describe('ContainerController', () => {
  let controller;
  let mockContainer;
  let mockDocker;
  let consoleLogSpy;

  beforeEach(() => {
    // console.logのモック化
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    mockContainer = {
      pause: jest.fn().mockResolvedValue(undefined),
      unpause: jest.fn().mockResolvedValue(undefined),
      inspect: jest.fn().mockResolvedValue({ State: { Status: 'running' } }),
    };

    mockDocker = {
      getContainer: jest.fn().mockReturnValue(mockContainer),
      listContainers: jest.fn().mockResolvedValue([
        { Id: 'b825f8e6ac0b', Names: ['/test'], Image: 'nginx', State: 'running', Status: 'Up 2 hours' },
      ]),
    };

    const Docker = require('dockerode');
    Docker.mockImplementation(() => mockDocker);

    controller = new ContainerController();
  });

  test('コンテナ名b825f8e6ac0bが存在していることの確認', async () => {
    await controller.listRunningContainers();
    expect(mockDocker.listContainers).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('b825f8e6ac0b'));
  });

  test('コンテナ名b825f8e6ac0bが停止再開できることの確認', async () => {
    await controller.pauseContainer('b825f8e6ac0b');
    expect(mockContainer.pause).toHaveBeenCalled();

    await controller.unpauseContainer('b825f8e6ac0b');
    expect(mockContainer.unpause).toHaveBeenCalled();
  });

  test('稼働中コンテナ一覧が正しく取得できることの確認', async () => {
    await controller.listRunningContainers();
    expect(mockDocker.listContainers).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('稼働中のコンテナ一覧:'));
  });

});
