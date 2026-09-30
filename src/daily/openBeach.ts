import { create, itemAmount } from "kolmafia";
import { $item } from "libram";

/** Ported from general/open_beach.ash. */
export function openBeach(): void {
  // Get access to the beach if we don't have it
  if (itemAmount($item`bitchin' meatcar`) === 0) {
    create($item`bitchin' meatcar`);
  }
}
