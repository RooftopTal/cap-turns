import { cliExecute, create, haveSkill, itemAmount } from "kolmafia";
import { $item, $skill, get, withChoice } from "libram";

/**
 * Ported from general/pick_lock.ash. Uses withChoice instead of the
 * original's manual save/set/restore of choiceAdventure1414 -- the ASH
 * version had a real bug here (restored the value to choiceAdventure1494
 * instead, clobbering the S.I.T. course setting every day), already fixed
 * by hand in daily-cap.ash. withChoice removes the whole class of error:
 * it restores the original value on the way out, including if the
 * callback throws.
 */
export function pickLock(): void {
  if (haveSkill($skill`Lock Picking`) && !get("lockPicked")) {
    const keyChoice = 1 + Math.floor(Math.random() * 3);
    withChoice(1414, keyChoice, () => cliExecute("cast lock picking"));
  }
  if (itemAmount($item`Boris's key`) > 0) {
    create($item`Boris's key lime pie`);
  }
  if (itemAmount($item`Jarlsberg's key`) > 0) {
    create($item`Jarlsberg's key lime pie`);
  }
  if (itemAmount($item`Sneaky Pete's key`) > 0) {
    create($item`Sneaky Pete's key lime pie`);
  }
}
