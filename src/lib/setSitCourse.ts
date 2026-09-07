import { use } from "kolmafia";
import { $item, withChoice } from "libram";

/**
 * Ported from general/set_sit_course.ash. withChoice instead of manual
 * save/set/restore of choiceAdventure1494 -- same reasoning as pickLock.
 */
export function setSitCourse(): void {
  const insectologyPreset = 2;
  withChoice(1494, insectologyPreset, () => use($item`S.I.T. Course Completion Certificate`));
}
