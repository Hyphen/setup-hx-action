import * as core from '@actions/core';
import * as path from 'path';
import { exec } from '@actions/exec';
import getVersionToDownload from '../src/helpers/getVersionToDownload';
import getPackageOs from '../src/helpers/getPackageOs';
import downloadTool from '../src/helpers/downloadTool';
import getCLIName from '../src/helpers/getCliName';
import makeExecutable from '../src/helpers/makeExecutable';
import { run } from '../src/main';

jest.mock('@actions/core');
jest.mock('@actions/tool-cache');
jest.mock('@actions/exec');
jest.mock('path');
jest.mock('../src/helpers/getVersionToDownload');
jest.mock('../src/helpers/getPackageOs');
jest.mock('../src/helpers/downloadTool');
jest.mock('../src/helpers/getCliName');
jest.mock('../src/helpers/makeExecutable');

describe('run', () => {
  const coreMock = core as jest.Mocked<typeof core>;
  const execMock = exec as jest.MockedFunction<typeof exec>;
  const getVersionToDownloadMock = getVersionToDownload as jest.MockedFunction<
    typeof getVersionToDownload
  >;
  const getPackageOsMock = getPackageOs as jest.MockedFunction<
    typeof getPackageOs
  >;
  const downloadToolMock = downloadTool as jest.MockedFunction<
    typeof downloadTool
  >;
  const getCLINameMock = getCLIName as jest.MockedFunction<typeof getCLIName>;
  const makeExecutableMock = makeExecutable as jest.MockedFunction<
    typeof makeExecutable
  >;
  const pathMock = path as jest.Mocked<typeof path>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('runs successfully with valid inputs', async () => {
    coreMock.getInput.mockReturnValue('test-api-key');
    getVersionToDownloadMock.mockResolvedValue('1.0.0');
    getPackageOsMock.mockReturnValue('linux');
    downloadToolMock.mockResolvedValue('/path/to/downloaded/tool');
    getCLINameMock.mockReturnValue('hx');
    pathMock.parse.mockReturnValue({
      dir: '/path/to',
      base: 'tool',
      ext: '',
      name: 'tool',
      root: '/'
    });
    coreMock.toPlatformPath.mockReturnValue('/path/to/hx');
    makeExecutableMock.mockResolvedValue(0);
    coreMock.getBooleanInput.mockReturnValue(false);
    execMock.mockResolvedValue(0);

    await run();

    expect(coreMock.getInput).toHaveBeenCalledWith('apiKey');
    expect(getVersionToDownloadMock).toHaveBeenCalled();
    expect(getPackageOsMock).toHaveBeenCalled();
    expect(downloadToolMock).toHaveBeenCalledWith(
      'https://api.hyphen.ai/api/downloads/hyphen-cli/1.0.0?os=linux',
      'hx',
      '1.0.0'
    );

    expect(makeExecutableMock).toHaveBeenCalledWith('/path/to/hx');
    expect(coreMock.addPath).toHaveBeenCalledWith('/path/to/downloaded/tool');
    expect(execMock).toHaveBeenCalledWith('hx auth --set-api-key test-api-key');
  });

  it('sets HYPHEN_DEV environment variable if hyphen-dev input is true', async () => {
    coreMock.getInput.mockReturnValue('test-api-key');
    getVersionToDownloadMock.mockResolvedValue('1.0.0');
    getPackageOsMock.mockReturnValue('linux');
    downloadToolMock.mockResolvedValue('/path/to/downloaded/tool');
    getCLINameMock.mockReturnValue('hx');
    pathMock.parse.mockReturnValue({
      dir: '/path/to',
      base: 'tool',
      ext: '',
      name: 'tool',
      root: '/'
    });
    coreMock.toPlatformPath.mockReturnValue('/path/to/hx');
    makeExecutableMock.mockResolvedValue(0);
    coreMock.getBooleanInput.mockReturnValue(true);
    execMock.mockResolvedValue(0);

    await run();

    expect(coreMock.exportVariable).toHaveBeenCalledWith('HYPHEN_DEV', 'true');
  });

  it('fails the workflow if an error occurs', async () => {
    const errorMessage = 'An error occurred';
    coreMock.getInput.mockImplementation(() => {
      throw new Error(errorMessage);
    });

    await run();

    expect(coreMock.setFailed).toHaveBeenCalledWith(errorMessage);
  });
});
