import { getProperty, Item, mallPrice } from "kolmafia";
import { $item } from "libram";

/**
 * Prices the realm decisions and ticket buying run on. Each can be pinned with
 * a preference, because mall limits make the live price of these easy to get
 * wildly wrong (one cheap limited listing, or a stale expensive one). Unset or
 * 0 means use the mall price.
 *
 *   set cap_lylecoGuideOverride = 2000000
 */
const OVERRIDE_SETTINGS: [Item, string][] = [
  [$item`PirateRealm guest pass`, "cap_pirateRealmGuestPassOverride"],
  [$item`FantasyRealm guest pass`, "cap_fantasyRealmGuestPassOverride"],
  [$item`LyleCo Contractor's Manual`, "cap_lylecoGuideOverride"],
  [$item`windicle`, "cap_windicleOverride"],
];

/** The override set for this item, if any. */
export function overrideFor(item: Item): number | undefined {
  const setting = OVERRIDE_SETTINGS.find(([it]) => it === item)?.[1];
  const value = setting ? Number(getProperty(setting)) : 0;
  return value > 0 ? value : undefined;
}

/** The override if one is set, otherwise the mall price. */
export function realmPrice(item: Item): number {
  return overrideFor(item) ?? mallPrice(item);
}

/** Every item that can take an override, for the price report. */
export const OVERRIDABLE: Item[] = OVERRIDE_SETTINGS.map(([it]) => it);
