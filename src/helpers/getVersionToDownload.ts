import { HttpClient } from '@actions/http-client';
import * as core from '@actions/core';
import { userAgentString } from '../constants';

export default async function getVersionToDownload(): Promise<string> {
  // use the version they provided if they have a preference
  const desiredVersion: string = core.getInput('version');
  if (desiredVersion) return desiredVersion;

  // Call the API to get the latest version
  const api_url =
    'https://api.hyphen.ai/api/downloads/hyphen-cli/versions?latest=true';

  const http = new HttpClient(userAgentString, undefined, {
    allowRetries: true,
    maxRetries: 3
  });
  const res = await http.get(api_url);
  const body = await res.readBody();
  const statusCode = res.message.statusCode || 500;
  if (statusCode >= 400) {
    throw new Error(`(${statusCode}) ${body}`);
  }
  const versions = JSON.parse(body) as {
    data: {
      packageName: string;
      version: string;
      latest: boolean;
      published: string;
    }[];
  };
  const latest = versions.data[0];
  const version = latest.version;
  return version;
}
