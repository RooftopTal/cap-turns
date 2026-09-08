import { Args } from "grimoire-kolmafia";
import { cliExecute, myPath, print, runChoice, userConfirm, visitUrl } from "kolmafia";
import { $path, get } from "libram";
import { aftercoreActions, trickOrTreat } from "./lib/aftercore";
import { clearPledge } from "./lib/clearPledge";
import { run } from "./lib/cliRun";
import { DAY_TOLERANCE, NIGHT_TOLERANCE, VALUE_NIGHTCAP } from "./lib/constants";
import { dayAhead } from "./lib/day";
import { endOfDay } from "./lib/endOfDay";
import { doPvp } from "./lib/pvp";
import { setSitCourse } from "./lib/setSitCourse";
import { checkTickets } from "./lib/tickets";
import { triggerStandardAscension } from "./lib/triggerStandardAscension";

export const args = Args.create("cap", "Captain Yaksworth's daily turns.", {
  path: Args.string({
    help: "Which ascension path to run.",
    options: [
      ["sccs", "Community Service"],
      ["boris", "Avatar of Boris"],
      ["smol", "A Shrunken Adventurer am I"],
      ["standard", "Standard"],
    ],
    default: "sccs",
  }),
  farm: Args.string({
    help: "Seasonal farming mode instead of the usual aftercore day.",
    options: [
      ["none", "Normal garbo day"],
      ["ween", "Trick-or-treating"],
      ["crimbo", "Crimbo"],
    ],
    default: "none",
  }),
  hardcore: Args.flag({
    help: "Ascend into hardcore.",
    setting: "",
  }),
  // Keys here must match STANDARD_CLASS_IDS in lib/triggerStandardAscension.ts.
  class: Args.string({
    help: "Which class to ascend as. Only used for --path standard.",
    options: [
      ["seal-clubber", "Seal Clubber"],
      ["turtle-tamer", "Turtle Tamer"],
      ["pastamancer", "Pastamancer"],
      ["sauceror", "Sauceror"],
      ["disco-bandit", "Disco Bandit"],
      ["accordion-thief", "Accordion Thief"],
    ],
    default: "seal-clubber",
  }),
  manual: Args.flag({
    help: "Do the prep, then stop before ascending.",
    setting: "",
  }),
});

/** Ported from daily-cap.ash's trick_or_treat/crimbone/aftercore_actions
 * dispatch. crimbone is still ASH -- there's no real logic in it to port,
 * the actual crimbo behavior is commented out in the source. */
function runAftercoreLoop(isMorning: boolean, farmingWeen: boolean, farmingCrimbo: boolean): void {
  const half = isMorning ? "morning" : "evening";
  if (farmingWeen) {
    trickOrTreat(isMorning);
  } else if (farmingCrimbo) {
    if (!cliExecute(`crimbone ${half}`)) {
      throw new Error(`Failed to perform aftercore actions (${half})`);
    }
  } else {
    aftercoreActions(isMorning);
  }
  print(`Successfully executed aftercore actions (${half})`, "green");
}

export function main(command?: string): void {
  Args.fill(args, command);
  if (args.help) {
    Args.showHelp(args);
    return;
  }

  run("check_mall_prices");
  run("store_mall_data");

  const runningSccs = args.path === "sccs";
  const runningBoris = args.path === "boris";
  const runningSmol = args.path === "smol";
  const runningStandard = args.path === "standard";
  const farmingWeen = args.farm === "ween";
  const farmingCrimbo = args.farm === "crimbo";

  print("Running Captain Yaksworth's daily turns", "green");

  const ascendedAlready = get("ascensionsToday") > 0;
  // kingLiberated is false while an ascension is in progress (it flips true
  // when the prism breaks, right at the end of a run) -- so "not ascended
  // yet, and not liberated" means an ascension is already under way from a
  // previous day, not that today hasn't started one yet.
  const ascensionInProgress = !ascendedAlready && !get("kingLiberated");

  // Effective path flags for everything past this point. Normally these
  // just mirror args.path, but get overridden below when resuming: myPath()
  // reflects the ascension actually in progress, which might not match
  // whatever --path was passed (or defaulted to) today.
  let effectiveBoris = runningBoris;
  let effectiveStandard = runningStandard;
  let resumingAscension = false;

  if (ascensionInProgress) {
    const currentPath = myPath();
    const isBorisPath = currentPath === $path`Avatar of Boris`;
    const isStandardPath = currentPath === $path`Standard`;

    // autoscend (boris/standard) breaks cleanly on turn-exhaustion and
    // routinely spans multiple days, so it's worth auto-resuming -- but
    // only once a human's confirmed it, since we're trusting myPath() over
    // whatever --path says. sccs/smol are expected to always finish
    // same-day; if one's mid-run here, that's a bug worth surfacing loudly
    // via check_prism's abort below, not silently working around, so no
    // prompt for those -- resumingAscension just stays false and the
    // normal flow below runs check_prism() into its usual abort.
    if (isBorisPath || isStandardPath) {
      const confirmed = userConfirm(
        `cap detected an ascension already in progress: ${currentPath.name}. Resume it automatically?`,
      );
      if (!confirmed) {
        throw new Error(`Declined to auto-resume detected ascension (${currentPath.name}) -- resolve manually`);
      }
      resumingAscension = true;
      effectiveBoris = isBorisPath;
      effectiveStandard = isStandardPath;
    }
  }

  if (!ascendedAlready) {
    if (resumingAscension) {
      print("Ascension already in progress from a previous day; resuming it", "blue");
    } else {
      print("Running first part of loop", "blue");
      run("check_prism");
      checkTickets(false);

      if (dayAhead(DAY_TOLERANCE)) {
        runAftercoreLoop(true, farmingWeen, farmingCrimbo);
      } else {
        print("No day available", "red");
      }

      doPvp();

      // smol has no specific prep yet, so it just grabs the same food as sccs;
      // boris and standard need no prep at all.
      if (!(runningBoris || runningStandard)) {
        run("sccs_preparation");
      }

      if (args.manual) {
        throw new Error("Manual ascension requested");
      }

      if (dayAhead(DAY_TOLERANCE)) {
        throw new Error("There's still time in the day");
      }

      let triggerAscension: boolean;
      if (runningSccs) {
        triggerAscension = cliExecute("trigger_sccs_ascension");
      } else if (runningBoris) {
        triggerAscension = cliExecute("trigger_boris_ascension");
      } else if (runningSmol) {
        triggerAscension = cliExecute("trigger_smol_ascension");
      } else if (runningStandard) {
        triggerAscension = triggerStandardAscension(Boolean(args.hardcore), args.class);
      } else {
        // Default to sccs on no-input var
        triggerAscension = cliExecute("trigger_sccs_ascension");
      }

      if (triggerAscension) {
        print("Successfully ascended!", "blue");
      } else {
        throw new Error("Failed to ascend");
      }
    }
  } else {
    print("Running second part of loop", "blue");
  }

  // Lunch -- skipped on a resumed ascension, since S.I.T. course is an
  // aftercore-only mechanic and we're still mid-run.
  if (!resumingAscension) {
    setSitCourse();
  }

  const kingLiberated = get("kingLiberated");
  print(`King state: ${kingLiberated}`);

  if (!kingLiberated) {
    // effectiveBoris/effectiveStandard checked first: on a resumed
    // ascension these reflect myPath(), not args.path, and must win over
    // runningSccs/runningSmol (which may just be whatever --path defaulted
    // to and could be wrong).
    if (effectiveBoris) {
      // Only need to do basic autoscend
      cliExecute("autoscend");

      // ...and break prism
      visitUrl("place.php?whichplace=nstower&action=ns_11_prism");
      visitUrl("main.php");
      runChoice(1); // 1 is SC, 2 is TT, 3 is PM, 4 is SA, 5 is DB, 6 is AT
      visitUrl("main.php");
    } else if (effectiveStandard) {
      // Only need to do basic autoscend
      cliExecute("autoscend");
    } else if (runningSccs) {
      run("run_sccs_ascension");
    } else if (runningSmol) {
      // Currently not using forks/mugs
      cliExecute("loopstar path smol goal organ skipfork skipmug");

      // must break prism manually
      visitUrl("place.php?whichplace=nstower&action=ns_11_prism");
      visitUrl("main.php");
    } else {
      run("run_sccs_ascension");
    }
  }

  // For autoscend paths, not finishing today is normal (it can span
  // multiple days) rather than a bug -- stop cleanly as a rest day instead
  // of letting check_prism's assertion below abort. Everything past this
  // point (S.I.T. course, aftercore, do_pvp, end_of_day, ...) assumes a
  // fully-built aftercore character, which we don't have mid-ascension.
  if ((effectiveBoris || effectiveStandard) && get("ascensionsToday") === 0) {
    print("Ascension still in progress; resting for today", "purple");
    print("storing mall data");
    run("store_mall_data");
    run("check_mall_prices");
    return;
  }

  run("check_prism");
  clearPledge();

  // Evening
  if (dayAhead(NIGHT_TOLERANCE)) {
    runAftercoreLoop(false, farmingWeen, farmingCrimbo);
  } else {
    print("No day available", "red");
  }

  doPvp();

  // Last bits
  endOfDay(VALUE_NIGHTCAP, NIGHT_TOLERANCE);

  print("taking a daily photo");
  cliExecute("av-snapshot");

  print("storing mall data");
  run("store_mall_data");

  print("one last philter for the day");
  cliExecute("philter");
  run("pvp-safety");

  run("check_mall_prices");
}
