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
  spleenLimit,
  useFamiliar,
} from "kolmafia";
import { $coinmaster, $familiar, $location, get, questStep } from "libram";
import { TURNS_FLEX, TURNS_FOR_FANTASYREALM, TURNS_FOR_PIRATEREALM, WORTHWHILE_ADVS } from "../lib/constants";
import { ensureAdventuresForPirateRealm } from "../realms/pirateRealmTurns";
import { goToFantasyRealm, goToPirateRealm } from "../realms/realms";

/**
 * Garbo sets up and runs the PirateRealm cockroach leg itself when its target
 * is cockroach (voyage start, Trash Island, the giant giant crab), so there's
 * no pre-garbo PirateRealm_cap trashonly run any more -- we just dive in.
 *
 * The voyage resets at rollover *and* on ascension (QuestDatabase.resetQuests
 * puts _questPirateRealm back to unstarted), so both legs get one.
 * _lastPirateRealmIsland is NOT reset on ascension, though, so it only means
 * anything once the quest has reached an island (step 4, "Land Ho").
 */
const ISLAND_REACHED_STEP = 4;

/** True once today's voyage has gone past Trash Island, or ended. */
function pastTrashIsland(): boolean {
  const step = questStep("_questPirateRealm");
  if (step < ISLAND_REACHED_STEP) return false;
  return step === 999 || get("_lastPirateRealmIsland") !== $location`Trash Island`;
}

/**
 * The target arg for a daytime garbo run. Not yet at Trash Island: cockroach,
 * or throw if we can't get there -- garbo would otherwise quietly swap to
 * another target (its 40-adventure failsafe). Past it there's no going back,
 * so warn and let garbo pick.
 */
export function garboTarget(): string {
  if (pastTrashIsland()) {
    print("Already past Trash Island today; garbo runs without target=cockroach", "orange");
    return "";
  }
  // Our own eat-to-40 workaround, kept until garbo's PirateRealm handling has
  // proven itself: garbo only diets *after* the voyage starts.
  if (questStep("_questPirateRealm") < 1 && !ensureAdventuresForPirateRealm()) {
    throw new Error("Can't reach Trash Island today (not enough adventures to sail)");
  }
  return "target=cockroach ";
}

/** After a cockroach garbo run: it must actually have reached Trash Island. */
export function assertReachedTrashIsland(target: string): void {
  if (target && questStep("_questPirateRealm") < ISLAND_REACHED_STEP) {
    throw new Error("Garbo was told target=cockroach but never reached Trash Island");
  }
}

/** Only spend a Dinsey ticket on garbo if there's enough day left to use it. */
export function checkWorthGarboing(): void {
  const alreadyHaveAccess = isAccessible($coinmaster`The Dinsey Company Store`);
  const haveTurns = myAdventures() > 50;
  const guessAtLimit = 9;
  const spareInebriety = inebrietyLimit() - myInebriety();
  const spareFullness = fullnessLimit() - myFullness();
  const spareSpleen = spleenLimit() - mySpleenUse();
  const enoughOrgans = spareInebriety + spareFullness + spareSpleen > guessAtLimit;

  if (!(alreadyHaveAccess || haveTurns || enoughOrgans)) {
    throw new Error("Not worth using a ticket; burn turns elsewhere");
  }
}

/**
 * Ported from daily-cap.ash's safe_garbo(). `_lastPirateRealmIsland` comes
 * back from libram as a real Location (not a string) -- it's typed that
 * way in libram's property tables -- so it's compared with $location, not
 * string equality. `_frHoursLeft` is the opposite surprise: it's typed as
 * a string, and "" (not entered yet today) is different from "0".
 *
 * `doRealms` false (`cap realms=false`, or `set cap_realms = false`) skips
 * the other realms entirely: no turns held back for them, and no
 * PirateRealm/FantasyRealm visit after garbo.
 */
export function safeGarbo(turnsToSave: number, doRealms: boolean): void {
  checkWorthGarboing();

  // Skip fancy stuff if overdrunk
  if (myInebriety() <= inebrietyLimit()) {
    const prQuestFinished = get("_questPirateRealm") === "finished";
    // _frHoursLeft is "" from rollover until FantasyRealm is first entered
    // (usually garbo's dailies, taking the hat), so "" means a full day is
    // still to come, not "none left". Only "0" means today's hours are spent.
    const frHoursLeft = get("_frHoursLeft");
    const frAvailable = (get("frAlways") || get("_frToday")) && (frHoursLeft === "" || Number(frHoursLeft) > 0);

    // Short-circuit so the price checks (and their output) only run when
    // realms are on at all.
    const doPirateRealm = doRealms && !prQuestFinished && goToPirateRealm();
    const doFantasyRealm = doRealms && frAvailable && goToFantasyRealm();
    if (!doRealms) print("Other realms are switched off; garbo gets every turn", "blue");

    outfit("birthday suit");

    const expectedGarboTurns =
      -1 *
      ((doPirateRealm ? TURNS_FOR_PIRATEREALM : 0) +
        (doFantasyRealm ? TURNS_FOR_FANTASYREALM : 0) +
        turnsToSave +
        TURNS_FLEX);

    if (expectedGarboTurns * -1 <= myAdventures()) {
      const target = garboTarget();
      const garboCommand = `garbo ${target}turns=${expectedGarboTurns}`;
      print(`Current garbo command: ${garboCommand}`);
      print("Diving into garbo!", "green");
      cliExecute(garboCommand);
      assertReachedTrashIsland(target);
    } else {
      print("Below garbo turns threshold", "purple");
    }

    // Attempt to leave as few turns as possible
    print(`Turns after garbo finished: ${myAdventures()}`);

    // TURNS_FOR_PIRATEREALM only covers finishing a voyage garbo started on
    // Trash Island. If garbo couldn't start one (its 40-adventure failsafe
    // swaps the target instead), a whole fresh voyage won't fit, so leave it.
    if (doPirateRealm) {
      if (get("_lastPirateRealmIsland") !== $location`Trash Island`) {
        print("Garbo didn't start a PirateRealm voyage today; skipping the rest of it", "purple");
      } else if (get("_questPirateRealm") !== "finished") {
        // Always Storm Island: windicles are most of what finishing a voyage
        // is worth (see realms.ts), and the mall price says what they're worth.
        useFamiliar($familiar`Jill-of-All-Trades`);
        cliExecute("PirateRealm_cap storm");
      }
    }
    outfit("birthday suit");

    if (doFantasyRealm) {
      print("Actually want to go to FR");
      cliExecute("FantasyRealm gem");
    }
    outfit("birthday suit");
  }

  // Attempt to leave as few turns as possible
  print(`Turns after realms finished: ${myAdventures()}`);

  if (myAdventures() > WORTHWHILE_ADVS + turnsToSave) {
    // If we have a worthwhile amount of adventures post-realms, keep going
    const target = garboTarget();
    cliExecute(`garbo ${target}`.trim());
    assertReachedTrashIsland(target);
  }
}
