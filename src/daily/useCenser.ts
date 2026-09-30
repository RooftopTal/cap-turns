import { buy, print } from "kolmafia";
import { $coinmaster, $item, get } from "libram";

/** Ported from general/use_censer.ash. */
export function useCenser(): void {
  const availableEmbers = get("availableSeptEmbers");
  const mouthwashDesired = Math.trunc(availableEmbers / 2);

  // todo see if this is still needed if garbo uses
  print(`buying ${mouthwashDesired} mouthwash!`);
  buy($coinmaster`Sept-Ember Censer`, mouthwashDesired, $item`Mmm-brr! brand mouthwash`);
}
