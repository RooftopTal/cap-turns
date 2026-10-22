import { Item } from "kolmafia";
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
 */
export type Kind = "currency" | "want" | "sell" | "keep";

export type Tracked = { item: Item; kind: Kind };

export const TRACKED: Tracked[] = [
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

  { item: $item`ice sickle`, kind: "keep" },
  { item: $item`haiku katana`, kind: "keep" },
  { item: $item`Too Cold to Hold: How to Be Cool - A Memoir`, kind: "keep" },
];
