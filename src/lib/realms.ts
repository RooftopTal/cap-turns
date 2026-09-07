import { mallPrice, print } from "kolmafia";
import { $item, get } from "libram";
import { LYLECO_GUIDE_OVERRIDE } from "./constants";

/**
 * Ported from realms/go_to_piraterealm.ash. The two `Math.trunc` calls
 * reproduce ASH's int/int truncation -- both operands are ints there, so
 * 170/28 is 6, not 6.07, and the threshold below depends on that.
 */
export function goToPirateRealm(): boolean {
  const expectedFunPerRun = 170;
  // should be 4*3 + 5*2 + 10 = 32, minus windcicle (3), minus storms (0-2?)
  // so we guess 28, which seems about right based on experiment
  const expectedPrTurns = 28;
  const funPerAdv = Math.trunc(expectedFunPerRun / expectedPrTurns);

  print(`fun_per_adv: ${funPerAdv}`);

  const tixFunPrice = 600;
  const tixMallPrice = mallPrice($item`PirateRealm guest pass`);
  const tixMeatPerFun = Math.trunc(tixMallPrice / tixFunPrice);
  const tixMeatPerAdventure = tixMeatPerFun * funPerAdv;

  const voa = get("valueOfAdventure");
  // We have a way more tolerance for PR, due to allowed familiars & cockroaches
  const expectedCockroachPerAdv = 250;
  const expectedWindicleProfit = 4000;
  const voaTolerance = voa - (expectedCockroachPerAdv + expectedWindicleProfit);

  print(`pr tix price: ${tixMallPrice}`);
  print(`meat_per_fun (tix): ${tixMeatPerFun}`);
  print(`expected value of PR adv (tix): ${tixMeatPerAdventure}/${voaTolerance}`, "blue");

  // To avoid breaking the "buy pass" code, if we're close enough to a ticket
  // we complete a run anyway so we have fun-a-log access
  const totalFunPoints = get("availableFunPoints");
  print(`proximity to ticket: ${totalFunPoints}/600`);
  const closeToTicket = totalFunPoints >= 500;

  if (tixMeatPerAdventure >= voaTolerance || closeToTicket) {
    print("avast, me hearties", "green");
    return true;
  }

  print("you're the worst pirate i've ever heard of", "red");
  return false;
}

/**
 * Ported from realms/go_to_fantasyrealm.ash. Same int/int truncation
 * caveat as goToPirateRealm -- see the Math.trunc calls below.
 */
export function goToFantasyRealm(): boolean {
  const expectedRubeesPerRun = 346;
  const expectedFrTurns = 44;
  const rubeesPerAdv = Math.trunc(expectedRubeesPerRun / expectedFrTurns);

  print(`rubees_per_adv: ${rubeesPerAdv}`);

  const tixRubeePrice = 350;
  const tixMallPrice = mallPrice($item`FantasyRealm guest pass`);
  const tixMeatPerRubee = Math.trunc(tixMallPrice / tixRubeePrice);
  const tixMeatPerAdventure = tixMeatPerRubee * rubeesPerAdv;

  const voa = get("valueOfAdventure");
  // We have no real tolerance for FR being rough, as it breaks the garbo chain
  const voaTolerance = voa;

  print(`fr tix price: ${tixMallPrice}`);
  print(`meat_per_rubee (tix): ${tixMeatPerRubee}`);
  print(`expected value of FR adv (tix): ${tixMeatPerAdventure}/${voaTolerance}`, "blue");

  const lylecoRubeePrice = 3000;
  const lylecoMeatPerRubee = Math.trunc(LYLECO_GUIDE_OVERRIDE / lylecoRubeePrice);
  const lylecoMeatPerAdventure = lylecoMeatPerRubee * rubeesPerAdv;

  const lylecoActualPrice = mallPrice($item`LyleCo Contractor's Manual`);
  print(`lyleco guide price: ${LYLECO_GUIDE_OVERRIDE} (Actual: ${lylecoActualPrice})`);
  print(`meat_per_rubee (lyleco): ${lylecoMeatPerRubee}`);
  print(`expected value of FR adv (lyleco): ${lylecoMeatPerAdventure}/${voaTolerance}`, "blue");

  if (tixMeatPerAdventure >= voaTolerance || lylecoMeatPerAdventure >= voaTolerance) {
    print("i put on my robe and wizard hat", "green");
    return true;
  }

  print("fantasy is dead", "red");
  return false;
}
