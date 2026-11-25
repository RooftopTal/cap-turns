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

/*
 * Defaults come from the Oct-Nov 2026 experiment (docs/voa-experiment.md):
 * roughly what the last Barf Mountain adventures of each leg earn. Each has
 * a preference to override it.
 */

/** valueOfAdventure for the first half of the loop; `cap_valueMorning`. */
export const VALUE_MORNING = numberPref("cap_valueMorning", 6500);

/** valueOfAdventure for the second half of the loop; `cap_valueEvening`. */
export const VALUE_EVENING = numberPref("cap_valueEvening", 6500);

/** valueOfAdventure for the overdrunk `garbo ascend` run, which earns ~500
 * less a turn than a sober one; `cap_valueOverdrunk`. */
export const VALUE_OVERDRUNK = numberPref("cap_valueOverdrunk", 6000);

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

/**
 * Adventures the evening leg holds back for tomorrow. This was 20, on the
 * idea that the morning's turns were worth more, but the VoA experiment
 * found the last adventures of each leg earn about the same, so there's
 * nothing to gain by moving them. Rollover lands well under the 200 cap
 * either way (~160-170 with none held back).
 */
export const TURNS_TO_SAVE_OVERNIGHT = 0;

export const DAY_TOLERANCE = 5;
/** A leg can end with up to WORTHWHILE_ADVS left, since fewer aren't worth
 * another garbo call; the end-of-day check has to allow for that. */
export const NIGHT_TOLERANCE = TURNS_TO_SAVE_OVERNIGHT + WORTHWHILE_ADVS;
