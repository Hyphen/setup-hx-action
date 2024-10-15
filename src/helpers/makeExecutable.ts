import { exec } from '@actions/exec';
import isWindows from './isWindows';

export default async function makeExecutable(path: string): Promise<number> {
  if (isWindows()) {
    return exec(`icacls ${path} /grant Everyone:F /T /C /Q`);
  }
  return exec(`chmod +x ${path}`);
}
