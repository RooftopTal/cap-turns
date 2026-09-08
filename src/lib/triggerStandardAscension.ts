import { containsText, visitUrl } from "kolmafia";

// Keys here must match the `class` Args option in main.ts.
const STANDARD_CLASS_IDS: Record<string, number> = {
  "seal-clubber": 1,
  "turtle-tamer": 2,
  pastamancer: 3,
  sauceror: 4,
  "disco-bandit": 5,
  "accordion-thief": 6,
};

/** Ported from paths/standard/trigger_standard_ascension.ash. */
export function triggerStandardAscension(isHardcore: boolean, standardClass: string): boolean {
  const classNum = STANDARD_CLASS_IDS[standardClass];
  if (classNum === undefined) {
    throw new Error(`Unknown standard class: ${standardClass}`);
  }

  const ascType = isHardcore ? 3 : 2;

  visitUrl("ascend.php?pwd=&confirm=on&confirm2=on&action=ascend&submit=Ascend", true);
  visitUrl("afterlife.php?action=pearlygates");
  visitUrl("afterlife.php?action=buydeli&whichitem=5046", true);

  visitUrl("afterlife.php?place=armory");
  // belt is often useful
  visitUrl("afterlife.php?action=buyarmory&whichitem=5042", true);
  const reincarnatePage = visitUrl("afterlife.php?place=reincarnate");
  const gender = containsText(reincarnatePage, "option selected value=2>Female") ? 2 : 1;

  const signNum = 5;

  visitUrl(
    `afterlife.php?action=ascend&asctype=${ascType}&whichclass=${classNum}&gender=${gender}&whichpath=22&whichsign=${signNum}`,
    true,
  );
  visitUrl(
    `afterlife.php?action=ascend&confirmascend=1&asctype=${ascType}&whichclass=${classNum}&gender=${gender}&whichpath=22&whichsign=${signNum}&nopetok=1&noskillsok=1&lamesignok=1`,
    true,
  );

  return true;
}
