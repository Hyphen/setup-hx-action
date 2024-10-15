import * as os from 'os';

export default function getPackageOs(): string {
  switch (os.type()) {
    case 'Linux':
      return 'linux';
    case 'Windows_NT':
      return 'windows';
    case 'Darwin':
      return os.arch() === 'arm64' ? 'macos-arm' : 'macos';
    default:
      throw new Error(`Unsupported OS found: ${os.type()}`);
  }
}
