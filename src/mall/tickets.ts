import { availableAmount, buy, closetAmount, itemAmount, mallPrice, print, takeCloset } from "kolmafia";
import { $coinmaster, $item, get } from "libram";
import { LYLECO_GUIDE_OVERRIDE } from "./overrides";

// The ASH source writes these item names with the HTML entity "&trade;"
// ($item[Rubee&trade;]) -- libram's $item wants the real Unicode ™
// character instead; the entity spelling would silently resolve to no item.

function checkDinseyTickets(buyTickets: boolean): void {
  print(`You have funfunds: ${itemAmount($item`FunFunds™`)}`);

  if (buyTickets) {
    const availableFunds = availableAmount($item`FunFunds™`);
    const ticketsDesired = Math.trunc(availableFunds / 20);

    print(`buying ${ticketsDesired} dinseyland tickets!`);
    buy($coinmaster`The Dinsey Company Store`, ticketsDesired, $item`one-day ticket to Dinseylandfill`);
  }
}

function checkPirateTickets(buyTickets: boolean): void {
  print(`You have fun: ${get("availableFunPoints")}`);
  const gotLog = itemAmount($item`PirateRealm fun-a-log`) > 0;

  if (gotLog && buyTickets) {
    const availableFun = get("availableFunPoints");
    const piratesDesired = Math.trunc(availableFun / 600);

    print(`buying ${piratesDesired} piraterealm tickets!`);
    buy($coinmaster`PirateRealm Fun-a-Log`, piratesDesired, $item`PirateRealm guest pass`);
  }
}

/** Ported int/int truncation and all -- ASH's lyleco_price/lyleco_rubee_price
 * and tix_price/tix_rubee_price are both int/int, same as the equivalent
 * calculation in realms.ts's goToFantasyRealm. */
function buyLylecoGuideOverTix(): boolean {
  const lylecoRubeePrice = 3000;
  const lylecoEfficiency = Math.trunc(LYLECO_GUIDE_OVERRIDE / lylecoRubeePrice);

  const tixPrice = mallPrice($item`FantasyRealm guest pass`);
  const tixRubeePrice = 350;
  const tixEfficiency = Math.trunc(tixPrice / tixRubeePrice);

  if (lylecoEfficiency > tixEfficiency) {
    print("lyleco guide is more efficient", "blue");
    return true;
  }
  print("tix are more efficient", "blue");
  return false;
}

function checkFantasyTickets(buyTickets: boolean): void {
  takeCloset(closetAmount($item`Rubee™`), $item`Rubee™`);
  print(`You have rubees: ${itemAmount($item`Rubee™`)}`);

  if (buyTickets) {
    const availableRubees = availableAmount($item`Rubee™`);

    if (buyLylecoGuideOverTix()) {
      const guidesDesired = Math.trunc(availableRubees / 3000);
      print(`buying ${guidesDesired} lyleco guides!`);
      buy($coinmaster`FantasyRealm Rubee™ Store`, guidesDesired, $item`LyleCo Contractor's Manual`);
    } else {
      const fantasiesDesired = Math.trunc(availableRubees / 350);
      print(`buying ${fantasiesDesired} fantasyrealm tickets!`);
      buy($coinmaster`FantasyRealm Rubee™ Store`, fantasiesDesired, $item`FantasyRealm guest pass`);
    }
  }
}

/** Ported from mall/check_tickets.ash. */
export function checkTickets(buyTickets: boolean): void {
  checkDinseyTickets(buyTickets);
  checkPirateTickets(buyTickets);
  checkFantasyTickets(buyTickets);
}
