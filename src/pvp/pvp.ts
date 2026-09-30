import { cliExecute, print, pvpAttacksLeft } from "kolmafia";
import { run } from "../lib/cliRun";
import { takeMeteoriteAde } from "./takeMeteoriteAde";

/**
 * Ported from daily-cap.ash's do_pvp(). UberPVPOptimizer and the loot
 * command are other people's scripts the original called unchecked, so
 * they stay best-effort here too.
 */
export function doPvp(): void {
  const sparePvpFights = pvpAttacksLeft() > 0;
  if (sparePvpFights) {
    print("Doin' PVP", "blue");
    run("break_hippy_stone");
    // todo put meteorite-ade back in during a real pvp season
    takeMeteoriteAde();

    cliExecute("UberPVPOptimizer");
    cliExecute("pvp loot Barely Dressed");
  } else {
    print("no PVP fights left, skipping", "red");
  }
}
