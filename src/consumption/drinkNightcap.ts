import { cliExecute, myInebriety, print } from "kolmafia";
import { set } from "libram";

/** Ported from general/drink_nightcap.ash. Every call site in this
 * codebase passes firstTry=true, so the recursive relog-and-retry branch
 * is the only way firstTry ever becomes false. */
export function drinkNightcap(valueOfAdventure: number, firstTry: boolean): void {
  print(`Setting valueOfAdventures to ${valueOfAdventure}`);
  set("valueOfAdventure", valueOfAdventure);
  cliExecute("CONSUME NIGHTCAP");

  print("Post nightcap");
  print(`${myInebriety()}`);
  if (!(myInebriety() > 18)) {
    if (firstTry) {
      print("Something went wrong during nightcap; relogging & trying again");
      cliExecute("relog");
      drinkNightcap(valueOfAdventure, false);
    } else {
      throw new Error("something went wrong when overdrinking");
    }
  }
}
