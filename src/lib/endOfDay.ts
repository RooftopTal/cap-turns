import { buy, cliExecute, create, itemAmount, mallPrice, print, use } from "kolmafia";
import { $item } from "libram";
import { dayAhead } from "./day";
import { drinkNightcap } from "./drinkNightcap";
import { openBeach } from "./openBeach";
import { stooperDrink } from "./stooperDrink";
import { checkTickets } from "./tickets";

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

function joinRaffle(): void {
  openBeach();
  cliExecute("raffle 1");
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
