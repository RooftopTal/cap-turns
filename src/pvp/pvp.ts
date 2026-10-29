import { cliExecute, hippyStoneBroken, print, pvpAttacksLeft, visitUrl } from "kolmafia";
import { get } from "libram";
import { run } from "../lib/cliRun";
import { takeMeteoriteAde } from "./takeMeteoriteAde";

/** `set _capSkipPvp = true` skips PvP for the rest of today (the leading
 * underscore makes mafia clear it at rollover). */
const SKIP_SETTING = "_capSkipPvp";

/**
 * At the start of a season the stone can't be smashed, and fights can't
 * start, until you've pledged allegiance to a clan for the season -- which
 * is a choice for a human. KoL's wording (mafia's PeeVPeeRequest matches
 * "Before entering combat, you must pledge your allegiance to a clan for the
 * season"); the fight page is checked before anything gets spent.
 */
function seasonNeedsSetup(): boolean {
  // Visit first: mafia only learns the stone's state from this page, not at
  // login, so hippyStoneBroken() can be stale before it.
  const page = visitUrl("peevpee.php?place=fight");
  return !hippyStoneBroken() || /pledge your allegiance|Before entering combat/i.test(page);
}

/**
 * Ported from daily-cap.ash's do_pvp(). UberPVPOptimizer and the loot
 * command are other people's scripts the original called unchecked, so
 * they stay best-effort here too.
 */
export function doPvp(): void {
  if (get(SKIP_SETTING, false)) {
    print(`Skipping PvP today (${SKIP_SETTING} is set)`, "orange");
    return;
  }

  const sparePvpFights = pvpAttacksLeft() > 0;
  if (sparePvpFights) {
    print("Doin' PVP", "blue");
    run("break_hippy_stone");
    // Before the Meteorite-Ade: at a season start it would be bought and
    // drunk for fights that can't happen.
    if (seasonNeedsSetup()) {
      throw new Error(
        "PvP isn't ready -- probably a new season: pledge a clan alignment at the Colosseum " +
          `(peevpee.php), then run cap again. Or \`set ${SKIP_SETTING} = true\` to skip PvP today.`,
      );
    }
    takeMeteoriteAde();

    cliExecute("UberPVPOptimizer");
    cliExecute("pvp loot Barely Dressed");
  } else {
    print("no PVP fights left, skipping", "red");
  }
}
