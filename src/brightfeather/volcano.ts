import {
  availableAmount,
  buy,
  cliExecute,
  itemAmount,
  myAdventures,
  myHp,
  print,
  runChoice,
  use,
  useSkill,
  visitUrl,
} from "kolmafia";
import { $coinmaster, $item, $skill, get } from "libram";

/**
 * Brightfeather's day, ported line for line from brightfeather-volcano.ash.
 * She's an alt raising funds for giveaways, so this deliberately isn't
 * optimised -- keep it doing exactly what the ASH did.
 */

const VOLCANO_TICKET = $item`one-day ticket to That 70s Volcano`;
const SAFE_HP = 200;
const SAFE_ADVS = 50;

function checkVolcanoTickets(buyTickets: boolean): void {
  print(`You have volcoinos: ${itemAmount($item`Volcoino`)}`);

  if (buyTickets) {
    const availableFunds = availableAmount($item`Volcoino`);
    const ticketsDesired = Math.floor(availableFunds / 3);

    print(`buying ${ticketsDesired} volcano tickets!`);
    buy($coinmaster`Disco GiftCo`, ticketsDesired, VOLCANO_TICKET);
  }
}

export function brightfeatherVolcano(): void {
  print("Brightfeather is on a vulcanous journey", "green");

  cliExecute("CONSUME ALL");

  const ticketCount = availableAmount(VOLCANO_TICKET);
  if (ticketCount < 1) {
    buy(1, VOLCANO_TICKET);
    print("Brightfeather bought a ticket to the volcano", "green");
  } else {
    print(`Brightfeather has ${ticketCount} tickets to the volcano`, "orange");
  }

  const access = get("hotAirportAlways") || get("_hotAirportToday");
  if (!access) {
    print("Brightfeather is redeeming her ticket", "green");
    use(VOLCANO_TICKET);
  } else {
    print("Brightfeather  already has access to the volcano", "orange");
  }

  cliExecute("outfit disco");
  visitUrl("place.php?whichplace=airport_hot&action=airport4_zone1");
  runChoice(7);

  cliExecute("outfit Mining");

  let remainingAdvs = myAdventures();
  print(`Brightfeather is heading into the mine for ${remainingAdvs} turns.`, "purple");
  while (remainingAdvs > 0) {
    if (myHp() < SAFE_HP) {
      print("Brightfeather is healing.", "red");
      useSkill(1, $skill`Cannelloni Cocoon`);
    }

    if (remainingAdvs >= SAFE_ADVS) {
      print(`Shift of ${SAFE_ADVS}`, "green");
      cliExecute(`minevolcano ${SAFE_ADVS}`);
      remainingAdvs = remainingAdvs - SAFE_ADVS;
    } else {
      print(`Shift of ${remainingAdvs}`, "red");
      cliExecute(`minevolcano ${remainingAdvs}`);
      remainingAdvs = 0;
    }
  }

  cliExecute("maximize adventures");

  print("Brightfeather is burnt to a crisp and ready for her nightcap", "green");
  cliExecute("CONSUME NIGHTCAP");

  checkVolcanoTickets(true);
}
