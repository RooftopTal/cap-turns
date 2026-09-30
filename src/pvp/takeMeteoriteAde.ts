import { buy, itemAmount, mallPrice, print, use } from "kolmafia";
import { $item } from "libram";

/** Ported from general/take_meteorite_ade.ash. */
export function takeMeteoriteAde(): void {
  const acceptableCost = 25000;
  if (mallPrice($item`Meteorite-Ade`) > acceptableCost) {
    throw new Error("The price of Meteorite-ade is too damn high!");
  }

  if (itemAmount($item`Meteorite-Ade`) < 3) {
    if (buy($item`Meteorite-Ade`, 3)) {
      print("successfully bought Meteorite-Ade");
    } else {
      throw new Error("failed to buy the Meteorite-Ade you asked for");
    }
  }
  use($item`Meteorite-Ade`, 3);
}
