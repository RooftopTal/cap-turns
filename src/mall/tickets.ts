import { availableAmount, buy, closetAmount, itemAmount, print, takeCloset } from "kolmafia";
import { $coinmaster, $item, get } from "libram";
import { realmPrice } from "./prices";

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

/** Which Rubee buy is worth more per Rubee, at the same prices (overrides
 * included) that goToFantasyRealm values the run with. */
function buyLylecoGuideOverTix(): boolean {
  const lylecoEfficiency = realmPrice($item`LyleCo Contractor's Manual`) / 3000;
  const tixEfficiency = realmPrice($item`FantasyRealm guest pass`) / 350;

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
