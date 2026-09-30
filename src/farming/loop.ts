import { cliExecute, print } from "kolmafia";
import { run } from "../lib/cliRun";
import { openBeach } from "../daily/openBeach";
import { pickLock } from "../daily/pickLock";

/**
 * Ported from general/generic_loop_stuff.ash. break_hippy_stone, psychic
 * and clan_peridot stay ASH for now. "pull all", "breakfast" and
 * "clanhop old cw" are built-in mafia commands the original left
 * unchecked, so they stay best-effort here too.
 */
export function genericLoopStuff(): void {
  print("pulling from hangks");
  cliExecute("pull all");
  run("break_hippy_stone");
  openBeach();

  cliExecute("breakfast");
  pickLock();

  run("psychic");
  cliExecute("clanhop old cw");
  run("clan_peridot");
}
