import { cliExecute, myAdventures, print } from "kolmafia";
import { $location, get, set } from "libram";
import {
  TURNS_TO_SAVE_OVERNIGHT,
  VALUE_EVENING,
  VALUE_MORNING,
  VALUE_OVERDRUNK,
  WORTHWHILE_ADVS,
} from "./constants";
import { safeGarbo } from "./cap_garbo";
import { drinkNightcap } from "./drinkNightcap";
import { genericLoopStuff } from "./loop";
import { stooperDrink } from "./stooperDrink";
import { useCenser } from "./useCenser";

/** Ported from daily-cap.ash's aftercore_actions(). */
export function aftercoreActions(isMorning: boolean): void {
  print("Starting aftercore actions");

  // TODO make this more sensible
  cliExecute("cast generate irony");
  set("_generateIronyUsed", 0);
  cliExecute("cast generate irony");

  let turnsToSave: number;
  if (isMorning) {
    print(`first half of loop; value is: ${VALUE_MORNING}`);
    set("valueOfAdventure", VALUE_MORNING);
    turnsToSave = 0; // use all turns in the first half of loop
  } else {
    print(`second half of loop; value is: ${VALUE_EVENING}`);
    set("valueOfAdventure", VALUE_EVENING);
    turnsToSave = TURNS_TO_SAVE_OVERNIGHT; // save turns overnight to start day closer to 200 advs
  }

  genericLoopStuff();
  safeGarbo(false, turnsToSave);

  if (isMorning) {
    if (myAdventures() > WORTHWHILE_ADVS) {
      print("Trying to overdrink while there's still adventures left", "red");
      throw new Error("shouldn't be drinking here");
    }

    // we only do this in the morning to eke out a few more garbo turns; in
    // the evening we do this as part of the nightcap, since the turns are
    // better spent garbo'ing with a real familiar the next day
    stooperDrink();
    drinkNightcap(VALUE_OVERDRUNK, true);

    cliExecute("garbo ascend");
  }

  useCenser();
}

/**
 * Ported from daily-cap.ash's trick_or_treat(). It uses VALUE_MORNING
 * regardless of isMorning -- that's the original behavior, not a typo.
 */
export function trickOrTreat(isMorning: boolean): void {
  print("starting to knock on doors");
  const loopValue = VALUE_MORNING;
  print(`ween loop; value is: ${loopValue}`);
  set("valueOfAdventure", loopValue);

  genericLoopStuff();

  // Cockroach farm
  safeGarbo(true, 0);
  const garboTarget = get("_lastPirateRealmIsland") === $location`Trash Island` ? "target=cockroach " : "";
  const garboCommand = `garbo ${garboTarget}nobarf`;
  print(`Garbo command: ${garboCommand}`);
  cliExecute(garboCommand);

  // If garbo didn't diet, diy
  cliExecute("CONSUME ALL");

  // trick/treat
  const weenCommand = 'freecandy familiar "Temporal Riftlet"';
  print(`weening: ${weenCommand}`);
  cliExecute(weenCommand);

  // overdrink
  if (isMorning) {
    if (myAdventures() > WORTHWHILE_ADVS) {
      print("Trying to overdrink while there's still adventures left", "red");
      throw new Error("shouldn't be drinking here");
    }

    // we only do this in the morning to eke out a few more WEEN turns; in
    // the evening we do this as part of the nightcap, since the turns are
    // better spent garbo'ing with a real familiar the next day
    stooperDrink();
    drinkNightcap(loopValue, true);

    cliExecute(weenCommand);
  }

  useCenser();
}
