import { Item, print } from "kolmafia";
import { $item } from "libram";
import {
  currentGems,
  gemEffect,
  GEMS_SETTING,
  haveCodpiece,
  mismatchedSockets,
  preferredGems,
  resetCodpiece,
  setPreferredGems,
} from "./codpiece/gems";

/** `codpiece` in the gCLI: keep the Eternity Codpiece's gems as preferred.
 * cap also runs the reset during ascension prep. The relay page "Cap
 * Codpiece" edits the preference.
 *   codpiece          put the preferred gems back where they belong
 *   codpiece check    just report, change nothing
 *   codpiece save     make what's socketed now the preferred socketing */
export function main(command = ""): void {
  switch (command.trim().toLowerCase()) {
    case "":
      resetCodpiece();
      return;
    case "check":
      return check();
    case "save":
      return save();
    default:
      print("Usage: codpiece [check | save]", "red");
  }
}

function describe(gem: Item): string {
  return gem === $item.none ? "(empty)" : `${gem.name} -- ${gemEffect(gem)}`;
}

function check(): void {
  if (!haveCodpiece()) {
    print("The Eternity Codpiece isn't in inventory or equipped.", "red");
    return;
  }
  const current = currentGems();
  const preferred = preferredGems();
  const wrong = preferred ? mismatchedSockets(preferred) : [];
  current.forEach((gem, i) => {
    const off = wrong.includes(i);
    const want = off && preferred ? ` (preferred: ${preferred[i] === $item.none ? "empty" : preferred[i].name})` : "";
    const line = `Socket ${i + 1}: ${describe(gem)}${want}`;
    // No colour argument at all for mafia's theme default.
    if (off) print(line, "red");
    else print(line);
  });
  if (!preferred) print(`No preferred socketing set (${GEMS_SETTING}).`, "gray");
  else if (wrong.length === 0) print("All sockets as preferred.", "green");
}

function save(): void {
  if (!haveCodpiece()) {
    print("The Eternity Codpiece isn't in inventory or equipped.", "red");
    return;
  }
  setPreferredGems(currentGems());
  print("Saved the current sockets as the preferred socketing.", "green");
}
