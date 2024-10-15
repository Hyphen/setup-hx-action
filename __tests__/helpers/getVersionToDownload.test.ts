/* eslint-disable  @typescript-eslint/no-explicit-any */
import { HttpClient } from '@actions/http-client';
import * as core from '@actions/core';
import getVersionToDownload from '../../src/helpers/getVersionToDownload';

jest.mock('@actions/core');
jest.mock('@actions/http-client');

describe('getVersionToDownload', () => {
  const coreMock = core as jest.Mocked<typeof core>;
  const HttpClientMock = HttpClient as jest.MockedClass<typeof HttpClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the desired version if provided', async () => {
    coreMock.getInput.mockReturnValue('1.0.0');
    const version = await getVersionToDownload();
    expect(version).toBe('1.0.0');
  });

  it('fetches the latest version from the API if no desired version is provided', async () => {
    coreMock.getInput.mockReturnValue('');
    const mockResponse = {
      readBody: jest.fn().mockResolvedValue(
        JSON.stringify({
          data: [
            {
              packageName: 'hyphen-cli',
              version: '1.1.0',
              latest: true,
              published: '2023-01-01'
            }
          ]
        })
      ),
      message: {
        statusCode: 200
      }
    };
    HttpClientMock.prototype.get.mockResolvedValue(mockResponse as any);

    const version = await getVersionToDownload();
    expect(version).toBe('1.1.0');
  });

  it('throws an error if the API response status code is >= 400', async () => {
    coreMock.getInput.mockReturnValue('');
    const mockResponse = {
      readBody: jest.fn().mockResolvedValue('Error message'),
      message: {
        statusCode: 500
      }
    };
    HttpClientMock.prototype.get.mockResolvedValue(mockResponse as any);

    await expect(getVersionToDownload()).rejects.toThrow('(500) Error message');
  });

  it('throws an error if the API response status code is missing', async () => {
    coreMock.getInput.mockReturnValue('');
    const mockResponse = {
      readBody: jest.fn().mockResolvedValue('Error message'),
      message: {}
    };
    HttpClientMock.prototype.get.mockResolvedValue(mockResponse as any);

    await expect(getVersionToDownload()).rejects.toThrow('(500) Error message');
  });
});
