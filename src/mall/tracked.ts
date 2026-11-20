import { getProperty, Item, propertyExists, setProperty, toItem } from "kolmafia";
import { $item } from "libram";

/**
 * Everything mall-prices tracks, and the source of truth for the sheet's
 * "Purchasing power (auto)" tab. One entry per real item.
 *
 * - currency: what IotMs get bought with, valued but not a goal.
 * - want: things to buy. Listed in priority order -- the sheet's "next
 *   purchase" is the first one.
 * - sell: held only to sell later.
 * - keep: could sell, probably won't.
 *
 * The list lives in the cap_mallTracked preference as comma-separated
 * itemId:kind pairs, in order, e.g. "12391:sell,9529:want". Edit it from the
 * "Cap Mall Prices" relay page or `mall-prices add|remove|list` in the gCLI.
 * The first time it's read, it's seeded from DEFAULT_TRACKED below.
 */
export type Kind = "currency" | "want" | "sell" | "keep";

export const KINDS: Kind[] = ["currency", "want", "sell", "keep"];

export type Tracked = { item: Item; kind: Kind };

export const TRACKED_SETTING = "cap_mallTracked";

/** What the preference starts out as. Edits go through the preference, not here. */
const DEFAULT_TRACKED: Tracked[] = [
  { item: $item`Mr. Accessory`, kind: "currency" },
  { item: $item`Uncle Buck`, kind: "currency" },

  { item: $item`Comprehensive Cartographic Compendium`, kind: "want" },
  { item: $item`kneecapping contract`, kind: "want" },
  { item: $item`Old Country cookbook`, kind: "want" },
  { item: $item`Pokéfam Guide to Capturing All of Them`, kind: "want" },
  { item: $item`box o' ghosts`, kind: "want" },
  { item: $item`meteorite fragment`, kind: "want" },
  { item: $item`Order of the Green Thumb Order Form`, kind: "want" },
  { item: $item`Booke of Vampyric Knowledge`, kind: "want" },

  { item: $item`boxed Heartstone`, kind: "sell" },
  { item: $item`boxed bat wings`, kind: "sell" },
  { item: $item`assemble-it-yourself Leprecondo`, kind: "sell" },
  { item: $item`lab-grown blood cubic zirconia`, kind: "sell" },
  { item: $item`shrink-wrapped Cup of 13s`, kind: "sell" },
  { item: $item`scabbarded Sword of S Words`, kind: "sell" },
  { item: $item`Meat shield toddler`, kind: "sell" },
  { item: $item`black rosebud`, kind: "sell" },
  { item: $item`unopened legendary acorndion`, kind: "sell" },

  { item: $item`ice sickle`, kind: "keep" },
  { item: $item`haiku katana`, kind: "keep" },
  { item: $item`Too Cold to Hold: How to Be Cool - A Memoir`, kind: "keep" },
];

export function isKind(value: string): value is Kind {
  return (KINDS as string[]).includes(value);
}

/** An item from a number or a name; null if mafia doesn't know it. */
export function parseItem(value: string): Item | null {
  const text = value.trim();
  if (!text) return null;
  const item = /^\d+$/.test(text) ? toItem(Number(text)) : toItem(text);
  return item === $item.none ? null : item;
}

function serialise(list: Tracked[]): string {
  return list.map(({ item, kind }) => `${item.id}:${kind}`).join(",");
}

/** The tracked list, in order. Entries mafia can't resolve are skipped. */
export function getTracked(): Tracked[] {
  if (!propertyExists(TRACKED_SETTING)) {
    setProperty(TRACKED_SETTING, serialise(DEFAULT_TRACKED));
  }
  const list: Tracked[] = [];
  for (const entry of getProperty(TRACKED_SETTING).split(",")) {
    const [id, kind] = entry.trim().split(":");
    const item = parseItem(id ?? "");
    if (item && kind && isKind(kind) && !list.some((t) => t.item === item)) {
      list.push({ item, kind });
    }
  }
  return list;
}

function save(list: Tracked[]): void {
  setProperty(TRACKED_SETTING, serialise(list));
}

/**
 * Tracks an item, at the end of its kind's section (so a new want goes last
 * in the priority order). An item already tracked just has its kind changed.
 */
export function addTracked(item: Item, kind: Kind): void {
  const list = getTracked().filter((t) => t.item !== item);
  let at = list.length;
  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i].kind === kind) {
      at = i + 1;
      break;
    }
  }
  list.splice(at, 0, { item, kind });
  save(list);
}

/** Stops tracking an item. False if it wasn't tracked. */
export function removeTracked(item: Item): boolean {
  const list = getTracked();
  const kept = list.filter((t) => t.item !== item);
  if (kept.length === list.length) return false;
  save(kept);
  return true;
}
