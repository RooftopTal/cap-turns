import { cliExecute, myInebriety, print, useFamiliar } from "kolmafia";
import { $familiar } from "libram";

/** Ported from general/stooper_drink.ash. */
export function stooperDrink(): void {
  if (myInebriety() > 15) {
    print("we may have overdrunk with stooper already?");
    return;
  }

  useFamiliar($familiar`Stooper`);
  cliExecute("drink stillsuit distillate");
}
