import { Args } from "grimoire-kolmafia";
import { cliExecute, print, runChoice, visitUrl } from "kolmafia";
import { get } from "libram";
import { DAY_TOLERANCE, NIGHT_TOLERANCE, VALUE_NIGHTCAP } from "./lib/constants";
import { dayAhead } from "./lib/day";

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
  manual: Args.flag({
    help: "Do the prep, then stop before ascending.",
    setting: "",
  }),
});

/** Run a cliExecute step that used to be a direct ASH function call -- an
 * abort() inside it no longer unwinds this whole script the way it did when
 * everything lived in one ASH file, so we have to check and rethrow by hand. */
function run(command: string): void {
  if (!cliExecute(command)) {
    throw new Error(`${command} failed`);
  }
}

/** Ported from daily-cap.ash's trick_or_treat/crimbone/aftercore_actions
 * dispatch, which all return a boolean success flag main() checks. */
function runAftercoreLoop(isMorning: boolean, farmingWeen: boolean, farmingCrimbo: boolean): void {
  const half = isMorning ? "morning" : "evening";
  let succeeded: boolean;
  if (farmingWeen) {
    succeeded = cliExecute(`trick_or_treat ${half}`);
  } else if (farmingCrimbo) {
    succeeded = cliExecute(`crimbone ${half}`);
  } else {
    succeeded = cliExecute(`aftercore_actions ${half}`);
  }

  if (succeeded) {
    print(`Successfully executed aftercore actions (${half})`, "green");
  } else {
    throw new Error(`Failed to perform aftercore actions (${half})`);
  }
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
  if (!ascendedAlready) {
    print("Running first part of loop", "blue");
    run("check_prism");
    run("check_tickets false");

    if (dayAhead(DAY_TOLERANCE)) {
      runAftercoreLoop(true, farmingWeen, farmingCrimbo);
    } else {
      print("No day available", "red");
    }

    run("do_pvp");

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
      triggerAscension = cliExecute(`trigger_standard_ascension ${args.hardcore}`);
    } else {
      // Default to sccs on no-input var
      triggerAscension = cliExecute("trigger_sccs_ascension");
    }

    if (triggerAscension) {
      print("Successfully ascended!", "blue");
    } else {
      throw new Error("Failed to ascend");
    }
  } else {
    print("Running second part of loop", "blue");
  }

  // Lunch
  run("set_sit_course");

  const kingLiberated = get("kingLiberated");
  print(`King state: ${kingLiberated}`);

  if (!kingLiberated) {
    if (runningSccs) {
      run("run_sccs_ascension");
    } else if (runningSmol) {
      // Currently not using forks/mugs
      cliExecute("loopstar path smol goal organ skipfork skipmug");

      // must break prism manually
      visitUrl("place.php?whichplace=nstower&action=ns_11_prism");
      visitUrl("main.php");
    } else if (runningBoris) {
      // Only need to do basic autoscend
      cliExecute("autoscend");

      // ...and break prism
      visitUrl("place.php?whichplace=nstower&action=ns_11_prism");
      visitUrl("main.php");
      runChoice(1); // 1 is SC, 2 is TT, 3 is PM, 4 is SA, 5 is DB, 6 is AT
      visitUrl("main.php");
    } else if (runningStandard) {
      // Only need to do basic autoscend
      cliExecute("autoscend");
    } else {
      run("run_sccs_ascension");
    }
  }

  run("check_prism");
  run("clear_pledge");

  // Evening
  if (dayAhead(NIGHT_TOLERANCE)) {
    runAftercoreLoop(false, farmingWeen, farmingCrimbo);
  } else {
    print("No day available", "red");
  }

  run("do_pvp");

  // Last bits
  //
  // Parens+comma, not space-separated: cliExecute only splits "scriptname
  // arg1 arg2" into multiple arguments when it's wrapped in parens. Bare
  // space-separated args are passed through as a single string, which is
  // why every other call here gets away with one token but this one (the
  // only multi-parameter script we call) needs the explicit form.
  run(`end_of_day(${VALUE_NIGHTCAP}, ${NIGHT_TOLERANCE})`);

  print("taking a daily photo");
  cliExecute("av-snapshot");

  print("storing mall data");
  run("store_mall_data");

  print("one last philter for the day");
  cliExecute("philter");
  run("pvp_safety");

  run("check_mall_prices");
}
