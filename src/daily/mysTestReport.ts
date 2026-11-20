import { getProperty, print } from "kolmafia";

/** Base Mysticality above this means the leveling is overshooting and the
 * InstantSCCS settings want changing. */
const BASE_MYS_LIMIT = 200;

/** Reports the Mysticality we had when InstantSCCS ran the Mysticality test.
 * The values are saved by our InstantSCCS fork in logRelevantStats(). */
export function reportMysTest(): void {
  const base = getProperty("_cap_instantMysticalityTestBase");
  const buffed = getProperty("_cap_instantMysticalityTestBuffed");
  if (base === "") {
    print("No Mysticality test recorded today", "gray");
    return;
  }

  const message = `Mysticality test: base Mys ${base}; buffed Mys ${buffed}`;
  if (Number(base) > BASE_MYS_LIMIT) {
    print(`<b>${message} -- over ${BASE_MYS_LIMIT}, change it!</b>`, "red");
  } else {
    print(message, "blue");
  }
}
