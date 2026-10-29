import { print } from "kolmafia";
import { $item, get } from "libram";
import { realmPrice } from "../mall/prices";

/**
 * Whether the realms are worth their turns: estimate the meat a realm turn
 * makes, and go if it beats valueOfAdventure (what garbo would make instead).
 *
 * Yields are measured, not guessed -- from captain_yaksworth's October 2026
 * session logs. Re-measure if the routes or scripts change.
 */

/**
 * The part of a PirateRealm voyage this decides on: finishing it after garbo's
 * cockroach leg (Trash Island and the giant giant crab). Always via Storm
 * Island, for windicles. 8 such legs measured, ~17 turns each; the fun rate
 * barely changes by island (5.0-5.3 a turn).
 */
const PR_LEG = { turns: 17, fun: 85, windicles: 6.1, meat: 1900 };
const PR_PASS_FUN = 600;

/** Three runs measured (`FantasyRealm gem`, 2026-10-28 evening, 2026-10-29
 * both halves): 45 turns every time, 315/323/344 rubees net of the lucky gold
 * ring's (which garbo would have found anyway), ~9.1k meat. Two big drops at
 * the end (91-108 and 43-59) were in every run, so they're not luck. */
const FR_RUN = { turns: 45, rubees: 327, meat: 9100 };
const FR_PASS_RUBEES = 350;
const LYLECO_RUBEES = 3000;

export type RealmEstimate = { perTurn: number; breakdown: string };

function k(meat: number): string {
  return `${Math.round(meat / 1000)}k`;
}

export function pirateRealmEstimate(): RealmEstimate {
  const meatPerFun = realmPrice($item`PirateRealm guest pass`) / PR_PASS_FUN;
  const fun = PR_LEG.fun * meatPerFun;
  const windicles = PR_LEG.windicles * realmPrice($item`windicle`);
  const total = fun + windicles + PR_LEG.meat;
  return {
    perTurn: Math.round(total / PR_LEG.turns),
    breakdown: `fun ${k(fun)} + windicles ${k(windicles)} + meat ${k(PR_LEG.meat)} over ${PR_LEG.turns} turns`,
  };
}

export function fantasyRealmEstimate(): RealmEstimate {
  const viaPass = realmPrice($item`FantasyRealm guest pass`) / FR_PASS_RUBEES;
  const viaGuide = realmPrice($item`LyleCo Contractor's Manual`) / LYLECO_RUBEES;
  const meatPerRubee = Math.max(viaPass, viaGuide);
  const via = viaGuide > viaPass ? "LyleCo" : "guest pass";
  const rubees = FR_RUN.rubees * meatPerRubee;
  return {
    perTurn: Math.round((rubees + FR_RUN.meat) / FR_RUN.turns),
    breakdown: `${FR_RUN.rubees} rubees at ${Math.round(meatPerRubee)} (${via}) + meat ${k(FR_RUN.meat)} over ${FR_RUN.turns} turns`,
  };
}

function report(name: string, est: RealmEstimate, voa: number): void {
  print(`${name}: ${est.breakdown}`);
  print(`${name}: ~${est.perTurn} meat/turn vs valueOfAdventure ${voa}`, "blue");
}

export function goToPirateRealm(): boolean {
  const voa = get("valueOfAdventure");
  const est = pirateRealmEstimate();
  report("PirateRealm", est, voa);

  // To avoid breaking the "buy pass" code, if we're close enough to a ticket
  // we complete a run anyway so we have fun-a-log access.
  const fun = get("availableFunPoints");
  print(`proximity to ticket: ${fun}/${PR_PASS_FUN}`);
  const closeToTicket = fun >= 500;

  if (est.perTurn >= voa || closeToTicket) {
    print("avast, me hearties", "green");
    return true;
  }
  print("you're the worst pirate i've ever heard of", "red");
  return false;
}

/** No extra tolerance: a FantasyRealm run that turns out rough breaks the
 * garbo chain. */
export function goToFantasyRealm(): boolean {
  const voa = get("valueOfAdventure");
  const est = fantasyRealmEstimate();
  report("FantasyRealm", est, voa);

  if (est.perTurn >= voa) {
    print("i put on my robe and wizard hat", "green");
    return true;
  }
  print("fantasy is dead", "red");
  return false;
}
