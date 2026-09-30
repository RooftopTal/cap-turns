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
import { TURNS_FLEX, TURNS_FOR_FANTASYREALM, TURNS_FOR_PIRATEREALM, WORTHWHILE_ADVS } from "../lib/constants";
import { ensureAdventuresForPirateRealm } from "../realms/pirateRealmTurns";
import { goToFantasyRealm, goToPirateRealm } from "../realms/realms";

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

    // Set when we can't start a voyage at all today (see
    // ensureAdventuresForPirateRealm): PirateRealm is then off entirely --
    // no Trash Island run, no turns reserved for it, no second visit later.
    let pirateRealmBlocked = false;

    // Farm realm tickets
    if (!onTrashIsland && !prQuestFinished) {
      // Starting a voyage needs 40 adventures, which we may not have coming
      // straight out of an ascension. Top up the diet early if that'll do
      // it; otherwise give PirateRealm a miss for the day.
      if (ensureAdventuresForPirateRealm()) {
        useFamiliar($familiar`Cookbookbat`);
        cliExecute("PirateRealm_cap crab trashonly");
        if (get("_lastPirateRealmIsland") !== $location`Trash Island`) {
          throw new Error("Trash failed somehow?");
        }
        // Clear any effects that reduce our strength before garbo/other
        cliExecute("hottub");
      } else {
        pirateRealmBlocked = true;
      }
    }
    outfit("birthday suit");

    if (stopAfterRoach) {
      return;
    }

    const frHoursLeft = Number(get("_frHoursLeft"));
    const doPirateRealm = shouldGoPirateRealm && !prQuestFinished && !pirateRealmBlocked;
    const expectedGarboTurns =
      -1 *
      ((doPirateRealm ? TURNS_FOR_PIRATEREALM : 0) +
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

    if (doPirateRealm) {
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
