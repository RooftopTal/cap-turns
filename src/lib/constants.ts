/**
 * Tuning constants, lifted from the top of daily-cap.ash.
 *
 * Every one of these was an `int` in ASH. Where a value is divided anywhere,
 * check the arithmetic when you port the consumer -- ASH truncates int/int and
 * JavaScript does not.
 */

/** valueOfAdventure for the first half of the loop. */
export const VALUE_MORNING = 6500;

/** valueOfAdventure for the second half of the loop. */
export const VALUE_EVENING = 6000;

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
export const TURNS_FOR_FANTASYREALM = 44;
export const TURNS_FLEX = 5;

/** When to redo garbo, or else just skip. */
export const WORTHWHILE_ADVS = 7;

/** Held back overnight so the day starts closer to 200 adventures. */
export const TURNS_TO_SAVE_OVERNIGHT = 20;

export const DAY_TOLERANCE = 5;
export const NIGHT_TOLERANCE = TURNS_TO_SAVE_OVERNIGHT + DAY_TOLERANCE;
