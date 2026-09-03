import { Args } from "grimoire-kolmafia";
import { myAdventures, myInebriety, print } from "kolmafia";
import { get } from "libram";
import { DAY_TOLERANCE, NIGHT_TOLERANCE, VALUE_EVENING, VALUE_MORNING } from "./lib/constants";
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

export function main(command?: string): void {
  Args.fill(args, command);
  if (args.help) {
    Args.showHelp(args);
    return;
  }

  print("Captain Yaksworth's daily turns", "green");
  print(`  path      ${args.path}`);
  print(`  farm      ${args.farm}`);
  print(`  hardcore  ${args.hardcore}`);
  print(`  manual    ${args.manual}`);

  const ascendedAlready = get("ascensionsToday") > 0;
  const half = ascendedAlready ? "second" : "first";
  const tolerance = ascendedAlready ? NIGHT_TOLERANCE : DAY_TOLERANCE;
  const voa = ascendedAlready ? VALUE_EVENING : VALUE_MORNING;

  print("");
  print(`Would run the ${half} half of the loop`, "blue");
  print(`  valueOfAdventure  ${voa}`);
  print(`  adventures        ${myAdventures()}`);
  print(`  inebriety         ${myInebriety()}`);
  print(`  king liberated    ${get("kingLiberated")}`);
  print(`  day ahead         ${dayAhead(tolerance)} (tolerance ${tolerance})`);

  print("");
  print("Scaffold only -- the day itself is still daily-cap.ash.", "purple");
  print("Run `daily-cap` for a real day; port phase 2 to change that.", "purple");
}
