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

export const TURNS_FOR_PIRATEREALM = 20;
export const TURNS_FOR_FANTASYREALM = 44;
export const TURNS_FLEX = 5;

/** When to redo garbo, or else just skip. */
export const WORTHWHILE_ADVS = 7;

/** Held back overnight so the day starts closer to 200 adventures. */
export const TURNS_TO_SAVE_OVERNIGHT = 20;

export const DAY_TOLERANCE = 5;
export const NIGHT_TOLERANCE = TURNS_TO_SAVE_OVERNIGHT + DAY_TOLERANCE;

/** From mall_overrides.ash. A fixed ceiling rather than the live mall
 * price, which go_to_fantasyrealm/check_tickets deliberately don't trust. */
export const LYLECO_GUIDE_OVERRIDE = 2_000_000;
