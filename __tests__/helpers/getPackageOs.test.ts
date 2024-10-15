import getPackageOs from '../../src/helpers/getPackageOs';
import * as os from 'os';

jest.mock('os');

describe('getPackageOs', () => {
  const osMock = os as jest.Mocked<typeof os>;

  it('returns "linux" when os.type() is "Linux"', () => {
    osMock.type.mockReturnValue('Linux');
    expect(getPackageOs()).toBe('linux');
  });

  it('returns "windows" when os.type() is "Windows_NT"', () => {
    osMock.type.mockReturnValue('Windows_NT');
    expect(getPackageOs()).toBe('windows');
  });

  it('returns "macos" when os.type() is "Darwin" and os.arch() is not "arm64"', () => {
    osMock.type.mockReturnValue('Darwin');
    osMock.arch.mockReturnValue('x64');
    expect(getPackageOs()).toBe('macos');
  });

  it('returns "macos-arm" when os.type() is "Darwin" and os.arch() is "arm64"', () => {
    osMock.type.mockReturnValue('Darwin');
    osMock.arch.mockReturnValue('arm64');
    expect(getPackageOs()).toBe('macos-arm');
  });

  it('throws an error when os.type() is unsupported', () => {
    osMock.type.mockReturnValue('Unknown');
    expect(() => getPackageOs()).toThrow('Unsupported OS found: Unknown');
  });

  it('throws an error when os.type() is an empty string', () => {
    osMock.type.mockReturnValue('');
    expect(() => getPackageOs()).toThrow('Unsupported OS found: ');
  });
});
