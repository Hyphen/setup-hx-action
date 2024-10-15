import { exec } from '@actions/exec';
import isWindows from '../../src/helpers/isWindows';
import makeExecutable from '../../src/helpers/makeExecutable';

jest.mock('@actions/exec');
jest.mock('../../src/helpers/isWindows');

describe('makeExecutable', () => {
  const execMock = exec as jest.MockedFunction<typeof exec>;
  const isWindowsMock = isWindows as jest.MockedFunction<typeof isWindows>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('executes icacls command on Windows', async () => {
    isWindowsMock.mockReturnValue(true);
    const path = 'C:\\path\\to\\file';
    execMock.mockResolvedValue(0);

    const result = await makeExecutable(path);

    expect(execMock).toHaveBeenCalledWith(
      `icacls ${path} /grant Everyone:F /T /C /Q`
    );
    expect(result).toBe(0);
  });

  it('executes chmod command on non-Windows', async () => {
    isWindowsMock.mockReturnValue(false);
    const path = '/path/to/file';
    execMock.mockResolvedValue(0);

    const result = await makeExecutable(path);

    expect(execMock).toHaveBeenCalledWith(`chmod +x ${path}`);
    expect(result).toBe(0);
  });

  it('throws an error if exec fails on Windows', async () => {
    isWindowsMock.mockReturnValue(true);
    const path = 'C:\\path\\to\\file';
    const errorMessage = 'Command failed';
    execMock.mockRejectedValue(new Error(errorMessage));

    await expect(makeExecutable(path)).rejects.toThrow(errorMessage);
  });

  it('throws an error if exec fails on non-Windows', async () => {
    isWindowsMock.mockReturnValue(false);
    const path = '/path/to/file';
    const errorMessage = 'Command failed';
    execMock.mockRejectedValue(new Error(errorMessage));

    await expect(makeExecutable(path)).rejects.toThrow(errorMessage);
  });
});
