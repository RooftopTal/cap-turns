import {
  eat,
  fullnessLimit,
  Item,
  itemAmount,
  mallPrice,
  myAdventures,
  myFullness,
  print,
  retrieveItem,
  use,
} from "kolmafia";
import { $item, get, getAverageAdventures } from "libram";

/**
 * PirateRealm refuses to start a voyage below this many adventures --
 * PirateRealm_cap.ash's run loop prints "You'll need forty adventures to
 * start" and *returns silently* rather than failing, so a short character
 * looks like a successful run that never left port.
 */
export const PIRATEREALM_MIN_ADVENTURES = 40;

/**
 * Foods the top-up is allowed to eat, best first. Both are 2 fullness for
 * 15-17 adventures and both turn up in this character's real CONSUME diets
 * (focaccia after an ascension, casserole in the morning), so we try them in
 * order and take the first that's available at a sane price.
 *
 * Deliberately NOT CONSUME: its ORGANS argument is a *starting* budget, not
 * a cap -- get_diet() is handed the real organ limits as its max and the
 * expander/cleaner passes (sweet tooth, distention pill, mojo filter, spice
 * melange, Sweat Out Some Booze...) grow the request up to them. Asking it
 * for `ORGANS 9 0 10` on 2026-09-09 ate 15 fullness, 7 liver and 13 spleen
 * -- the whole day's diet -- which is precisely what we're trying not to do
 * to garbo.
 */
const TOP_UP_FOODS = [$item`roasted vegetable focaccia`, $item`baked veggie ricotta casserole`];

/** Used once before each food: worth +1 adventure per point of fullness. */
const TOP_UP_HELPER = $item`mini kiwi aioli`;

function spareFullness(): number {
  return fullnessLimit() - myFullness();
}

// Strictly more than 40: garbo starts the voyage now, and its "40 Adventure
// Failsafe" (tasks/cockroach/prep.ts) swaps the copy target away from
// cockroach at myAdventures() <= 40.
function enoughToSail(): boolean {
  return myAdventures() > PIRATEREALM_MIN_ADVENTURES;
}

/**
 * Cheapest food we're willing to eat right now: it has to fit in what's left
 * of the stomach, and the adventures it buys have to be worth more than it
 * and its aioli cost.
 */
function nextTopUpFood(): Item | null {
  const voa = get("valueOfAdventure");

  for (const food of TOP_UP_FOODS) {
    if (food.fullness > spareFullness()) {
      continue;
    }

    const worth = getAverageAdventures(food) * voa;
    const cost = mallPrice(food) + mallPrice(TOP_UP_HELPER);
    if (cost > worth) {
      print(`${food} costs ${cost} for ~${worth} of adventures; not worth it`, "purple");
      continue;
    }

    return food;
  }

  return null;
}

/** One aioli, one food. Returns false if anything didn't actually happen. */
function eatOne(food: Item): boolean {
  if (retrieveItem(TOP_UP_HELPER) && itemAmount(TOP_UP_HELPER) > 0) {
    use(TOP_UP_HELPER, 1);
  } else {
    print(`Couldn't get a ${TOP_UP_HELPER}; eating ${food} without it`, "purple");
  }

  if (!retrieveItem(food)) {
    print(`Couldn't get a ${food}`, "purple");
    return false;
  }

  return eat(food, 1);
}

/**
 * Make sure we can actually start a PirateRealm voyage, topping up the diet
 * if we're short.
 *
 * The case this exists for: coming out of an ascension into aftercore with
 * fewer than 40 adventures. safe_garbo does the Trash Island run *before*
 * garbo, so no diet has happened yet -- but the answer is to eat as little
 * as gets us to sea, leaving garbo's own diet (and the good consumables it
 * wants for its early, high-value turns) alone.
 *
 * Returns true if we're clear to sail, false if PirateRealm should be
 * skipped entirely for the day.
 */
export function ensureAdventuresForPirateRealm(): boolean {
  if (enoughToSail()) {
    return true;
  }

  print(
    `Only ${myAdventures()} adventures; PirateRealm needs ${PIRATEREALM_MIN_ADVENTURES} to set sail`,
    "blue",
  );

  while (!enoughToSail()) {
    const food = nextTopUpFood();
    if (!food) {
      print("Nothing worth eating to make up the difference", "red");
      break;
    }

    const before = myAdventures();
    if (!eatOne(food)) {
      print(`Failed to eat ${food}`, "red");
      break;
    }

    print(`Ate ${food}: ${before} -> ${myAdventures()} adventures`);
    if (myAdventures() <= before) {
      // Belt and braces: an eat that reports success but yields nothing
      // would otherwise loop until the stomach filled up.
      print("That didn't gain any adventures; stopping", "red");
      break;
    }
  }

  if (enoughToSail()) {
    return true;
  }

  print(
    `Can't reach ${PIRATEREALM_MIN_ADVENTURES} adventures (${myAdventures()}); skipping PirateRealm today`,
    "red",
  );
  return false;
}
