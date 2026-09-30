import {
  fullnessLimit,
  inebrietyLimit,
  myAdventures,
  myFullness,
  myInebriety,
  mySpleenUse,
  print,
  pvpAttacksLeft,
  spleenLimit,
} from "kolmafia";

/**
 * Is there still a day's worth of resources left to spend?
 *
 * Ported from general/day_ahead.ash. Note that spare PVP fights deliberately
 * do not count -- we don't hold the day open for them.
 */
export function dayAhead(adventureTolerance: number): boolean {
  const spareInebriety = myInebriety() < inebrietyLimit();
  const spareFullness = myFullness() < fullnessLimit();
  const spareSpleen = mySpleenUse() < spleenLimit();
  const spareAdventures = myAdventures() > adventureTolerance;
  const sparePvpFights = pvpAttacksLeft() > 0;
  const overdrunk = myInebriety() > inebrietyLimit();

  if (!overdrunk && (spareInebriety || spareFullness || spareSpleen || spareAdventures)) {
    print("Still have turns remaining", "green");
    return true;
  }

  if (sparePvpFights) {
    print("Still have spare PVP fights, but we don't break on that", "red");
    print("Check it's not the first of a new pvp calendar before fretting", "red");
    return false;
  }

  print("Out of time", "red");
  return false;
}
