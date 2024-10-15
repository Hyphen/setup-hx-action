import * as toolCache from '@actions/tool-cache';
import * as core from '@actions/core';
import getToolPathFromCacheOrDownload from '../../src/helpers/downloadTool';
import { userAgentString } from '../../src/constants';

jest.mock('@actions/tool-cache');
jest.mock('@actions/core');

describe('getToolPathFromCacheOrDownload', () => {
  const toolName = 'test-tool';
  const toolVersion = '1.0.0';
  const url = `https://example.com/${toolName}-${toolVersion}.zip`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return cached path if tool is already cached', async () => {
    const cachedPath = '/path/to/cached/tool';
    (toolCache.find as jest.Mock).mockReturnValue(cachedPath);

    const result = await getToolPathFromCacheOrDownload(
      url,
      toolName,
      toolVersion
    );

    expect(toolCache.find).toHaveBeenCalledWith(toolName, toolVersion);
    expect(core.debug).toHaveBeenCalledWith(
      `Tool found in cache: ${cachedPath}`
    );
    expect(result).toBe(cachedPath);
  });

  it('should download and cache the tool if not already cached', async () => {
    const downloadedPath = '/path/to/downloaded/tool';
    const cachedPath = '/path/to/cached/tool';
    (toolCache.find as jest.Mock).mockReturnValue('');
    (toolCache.downloadTool as jest.Mock).mockResolvedValue(downloadedPath);
    (toolCache.cacheFile as jest.Mock).mockResolvedValue(cachedPath);

    const result = await getToolPathFromCacheOrDownload(
      url,
      toolName,
      toolVersion
    );

    expect(toolCache.find).toHaveBeenCalledWith(toolName, toolVersion);
    expect(core.debug).toHaveBeenCalledWith(
      `Downloading ${toolName} from: ${url}`
    );
    expect(toolCache.downloadTool).toHaveBeenCalledWith(
      url,
      undefined,
      undefined,
      {
        'User-Agent': userAgentString
      }
    );
    expect(toolCache.cacheFile).toHaveBeenCalledWith(
      downloadedPath,
      toolName,
      toolName,
      toolVersion
    );
    expect(result).toBe(cachedPath);
  });
});
