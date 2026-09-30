import { buy, cliExecute, create, itemAmount, mallPrice, print, use, visitUrl } from "kolmafia";
import { $item } from "libram";
import { dayAhead } from "./day";
import { drinkNightcap } from "../consumption/drinkNightcap";
import { openBeach } from "./openBeach";
import { stooperDrink } from "../consumption/stooperDrink";
import { checkTickets } from "../realms/tickets";

function buyMeatGolem(): void {
  const golemMax = 15000;
  if (mallPrice($item`Meat Golem`) <= golemMax) {
    if (itemAmount($item`Meat Golem`) === 0) {
      if (create($item`Meat Golem`)) {
        print("crafted meat golem");
      } else {
        buy($item`Meat Golem`, 1);
        print("bought meat golem");
      }
    }
    use($item`Meat Golem`, 1);
  } else {
    print("golem is too expensive atm");
  }
}

function raffleTicketsToBuy(): number {
  const page = visitUrl("raffle.php");

  // The page also lists yesterday's winners below, whose prize names would
  // otherwise false-positive today's check -- restrict to the section that
  // actually names today's prizes.
  const start = page.indexOf("Today's Raffle Prize:");
  const end = page.indexOf("Winners of Yesterday's Raffle:");
  if (start === -1 || end === -1 || end <= start) {
    print("couldn't find today's raffle prize on the page, buying 1 ticket");
    return 1;
  }
  const todaySection = page.slice(start, end);

  if (todaySection.includes("kneecapping contract") || todaySection.includes("Old Country cookbook")) {
    print("raffle second prize is worth it, buying 11 tickets");
    return 11;
  }
  print("raffle second prize isn't worth it, buying 1 ticket");
  return 1;
}

function joinRaffle(): void {
  openBeach();
  cliExecute(`raffle ${raffleTicketsToBuy()}`);
}

/** Ported from general/end_of_day.ash. */
export function endOfDay(valueOfAdventure: number, adventureTolerance: number): void {
  if (dayAhead(adventureTolerance)) {
    throw new Error("tried to end day with advs/organs/fites remaining");
  }

  // todo if we ever gen >200 adventures a rollover, may need to shift this
  stooperDrink();
  drinkNightcap(valueOfAdventure, true);

  buyMeatGolem();
  joinRaffle();
  cliExecute("maximize 5 adventures, 1 pvp fights");
  cliExecute("clanhop old cw");

  checkTickets(true);
}
