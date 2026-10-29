import { getProperty } from "kolmafia";

/**
 * Tuning constants, lifted from the top of daily-cap.ash.
 *
 * Every one of these was an `int` in ASH. Where a value is divided anywhere,
 * check the arithmetic when you port the consumer -- ASH truncates int/int and
 * JavaScript does not.
 */

/** A positive number preference, else the fallback. Read once per cap run. */
function numberPref(name: string, fallback: number): number {
  const value = Number(getProperty(name));
  return value > 0 ? value : fallback;
}

/** valueOfAdventure for the first half of the loop. `cap_valueMorning`
 * overrides it, for trying other values (see docs/voa-experiment.md). */
export const VALUE_MORNING = numberPref("cap_valueMorning", 6500);

/** valueOfAdventure for the second half of the loop; `cap_valueEvening`
 * overrides it. */
export const VALUE_EVENING = numberPref("cap_valueEvening", 6000);

/** Can be set separately if we don't just want to base this on tomorrow's turns. */
export const VALUE_OVERDRUNK = VALUE_EVENING;

export const VALUE_NIGHTCAP = VALUE_MORNING;

/**
 * Halfway between the two halves of the loop, for a leg that is neither: the
 * farming that follows a multi-day ascension finishing. It runs in the
 * evening slot, but it's the day's first farming -- that day's morning leg
 * was skipped to resume the ascension -- so its turns are worth more than an
 * evening's and less than a full morning's. See main.ts.
 */
export const VALUE_POST_ASCENSION = Math.round((VALUE_MORNING + VALUE_EVENING) / 2);

export const TURNS_FOR_PIRATEREALM = 20;
export const TURNS_FOR_FANTASYREALM = 45;
export const TURNS_FLEX = 5;

/** When to redo garbo, or else just skip. */
export const WORTHWHILE_ADVS = 7;

/** Held back overnight so the day starts closer to 200 adventures. */
export const TURNS_TO_SAVE_OVERNIGHT = 20;

export const DAY_TOLERANCE = 5;
export const NIGHT_TOLERANCE = TURNS_TO_SAVE_OVERNIGHT + DAY_TOLERANCE;
