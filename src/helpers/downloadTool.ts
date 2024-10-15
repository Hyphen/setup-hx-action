import * as toolCache from '@actions/tool-cache';
import * as core from '@actions/core';
import { userAgentString } from '../constants';

export default async function getToolPathFromCacheOrDownload(
  url: string,
  toolName: string,
  toolVersion: string
): Promise<string> {
  // Check if the tool is already cached
  let cachedPath = toolCache.find(toolName, toolVersion);

  if (!cachedPath) {
    core.debug(`Downloading ${toolName} from: ${url}`);

    // If not cached, download the tool
    cachedPath = await toolCache.downloadTool(url, undefined, undefined, {
      'User-Agent': userAgentString
    });

    // Cache the downloaded tool
    cachedPath = await toolCache.cacheFile(
      cachedPath,
      toolName,
      toolName,
      toolVersion
    );
  } else {
    core.debug(`Tool found in cache: ${cachedPath}`);
  }

  return cachedPath;
}
