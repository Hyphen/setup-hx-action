import * as core from '@actions/core';
import { exec } from '@actions/exec';
import getPackageOs from './helpers/getPackageOs';
import getVersionToDownload from './helpers/getVersionToDownload';
import getToolPathFromCacheOrDownload from './helpers/downloadTool';
import getCLIName from './helpers/getCliName';
import makeExecutable from './helpers/makeExecutable';
import path from 'path';

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const apiKey: string = core.getInput('apiKey');
    const verbose: boolean = core.getBooleanInput('verbose');
    const toolName = getCLIName();

    // Get the version to download
    const version = await getVersionToDownload();

    // Get From the Cache or Download the CLI
    const download_url = `https://api.hyphen.ai/api/downloads/hyphen-cli/${version}?os=${getPackageOs()}`;
    const toolPath = await getToolPathFromCacheOrDownload(
      download_url,
      toolName,
      version
    );

    // make the tool executable
    const pathWithExecutable = core.toPlatformPath(
      path.join(toolPath, toolName)
    );
    await makeExecutable(pathWithExecutable);

    // Make sure the CLI is in the Path
    core.addPath(toolPath);

    // support using this in dev, we just wont document this :)
    if (core.getBooleanInput('hyphen-dev')) {
      core.exportVariable('HYPHEN_DEV', 'true');
    }

    // Authenticate with the CLI
    let command = `hx auth --set-api-key ${apiKey}`;
    if (verbose) {
      command += ' --verbose';
    }
    await exec(command);
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message);
  }
}
