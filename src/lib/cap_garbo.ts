import {
  cliExecute,
  fullnessLimit,
  inebrietyLimit,
  isAccessible,
  myAdventures,
  myFullness,
  myInebriety,
  mySpleenUse,
  outfit,
  print,
  shopAmount,
  spleenLimit,
  useFamiliar,
} from "kolmafia";
import { $coinmaster, $familiar, $item, $location, get } from "libram";
import { TURNS_FLEX, TURNS_FOR_FANTASYREALM, TURNS_FOR_PIRATEREALM, WORTHWHILE_ADVS } from "./constants";
import { goToFantasyRealm, goToPirateRealm } from "./realms";

/**
 * Ported from daily-cap.ash's safe_garbo(). `_lastPirateRealmIsland` comes
 * back from libram as a real Location (not a string) -- it's typed that
 * way in libram's property tables -- so it's compared with $location, not
 * string equality. `_frHoursLeft` is the opposite surprise: it's typed as
 * a string, so it needs a Number() conversion before the `!== 0` check.
 */
export function safeGarbo(stopAfterRoach: boolean, turnsToSave: number): void {
  const alreadyHaveAccess = isAccessible($coinmaster`The Dinsey Company Store`);
  const haveTurns = myAdventures() > 50;
  const guessAtLimit = 9;
  const spareInebriety = inebrietyLimit() - myInebriety();
  const spareFullness = fullnessLimit() - myFullness();
  const spareSpleen = spleenLimit() - mySpleenUse();
  const enoughOrgans = spareInebriety + spareFullness + spareSpleen > guessAtLimit;

  const shouldGoPirateRealm = goToPirateRealm();
  const shouldGoFantasyRealm = goToFantasyRealm();

  // Only garbo if we got enough turns to make it worthwhile
  if (!(alreadyHaveAccess || haveTurns || enoughOrgans)) {
    throw new Error("Not worth using a ticket; burn turns elsewhere");
  }

  // Skip fancy stuff if overdrunk
  if (myInebriety() <= inebrietyLimit()) {
    const onTrashIsland = get("_lastPirateRealmIsland") === $location`Trash Island`;
    const prQuestFinished = get("_questPirateRealm") === "finished";

    // Farm realm tickets
    if (!onTrashIsland && !prQuestFinished) {
      useFamiliar($familiar`Cookbookbat`);
      cliExecute("PirateRealm_cap crab trashonly");
      if (get("_lastPirateRealmIsland") !== $location`Trash Island`) {
        throw new Error("Trash failed somehow?");
      }
      // Clear any effects that reduce our strength before garbo/other
      cliExecute("hottub");
    }
    outfit("birthday suit");

    if (stopAfterRoach) {
      return;
    }

    const frHoursLeft = Number(get("_frHoursLeft"));
    const expectedGarboTurns =
      -1 *
      ((shouldGoPirateRealm && !prQuestFinished ? TURNS_FOR_PIRATEREALM : 0) +
        (shouldGoFantasyRealm && frHoursLeft !== 0 ? TURNS_FOR_FANTASYREALM : 0) +
        turnsToSave +
        TURNS_FLEX);

    const garboTarget = get("_lastPirateRealmIsland") === $location`Trash Island` ? "target=cockroach " : "";
    const garboCommand = `garbo ${garboTarget}turns=${expectedGarboTurns}`;
    print(`Current garbo command: ${garboCommand}`);
    if (expectedGarboTurns * -1 <= myAdventures()) {
      print("Diving into garbo!", "green");
      cliExecute(garboCommand);
    } else {
      print("Below garbo turns threshold", "purple");
    }

    // Attempt to leave as few turns as possible
    print(`Turns after garbo finished: ${myAdventures()}`);

    if (shouldGoPirateRealm && !prQuestFinished) {
      useFamiliar($familiar`Jill-of-All-Trades`);
      if (shopAmount($item`windicle`) < 100) {
        print("Need to restock windicles!");
        cliExecute("PirateRealm_cap storm");
      } else {
        print("Go to whatever island, we're well stocked on windicles");
        cliExecute("PirateRealm_cap any");
      }
    }
    outfit("birthday suit");

    if (shouldGoFantasyRealm && frHoursLeft !== 0) {
      print("Actually want to go to FR");
      cliExecute("FantasyRealm gem");
    }
    outfit("birthday suit");
  }

  // Attempt to leave as few turns as possible
  print(`Turns after realms finished: ${myAdventures()}`);

  if (myAdventures() > WORTHWHILE_ADVS + turnsToSave) {
    // If we have a worthwhile amount of adventures post-realms, keep going
    cliExecute("garbo");
  }
}
