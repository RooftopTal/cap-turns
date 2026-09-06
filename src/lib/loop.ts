import { cliExecute, print } from "kolmafia";
import { run } from "./cliRun";

/**
 * Ported from general/generic_loop_stuff.ash. The steps it delegates to
 * (break_hippy_stone, open_beach, pick_lock, psychic, clan_peridot) stay
 * ASH for now -- phase 4. "pull all", "breakfast" and "clanhop old cw" are
 * built-in mafia commands the original left unchecked, so they stay
 * best-effort here too.
 */
export function genericLoopStuff(): void {
  print("pulling from hangks");
  cliExecute("pull all");
  run("break_hippy_stone");
  run("open_beach");

  cliExecute("breakfast");
  run("pick_lock");

  run("psychic");
  cliExecute("clanhop old cw");
  run("clan_peridot");
}
