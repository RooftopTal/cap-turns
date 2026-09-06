import { cliExecute } from "kolmafia";

/**
 * Run a cliExecute step that used to be a direct ASH function call -- an
 * abort() inside it no longer unwinds the calling script the way it did
 * when everything lived in one ASH file, so we have to check and rethrow
 * by hand.
 */
export function run(command: string): void {
  if (!cliExecute(command)) {
    throw new Error(`${command} failed`);
  }
}
