import { getProperty, print } from "kolmafia";

/** Reports the Mysticality we had when InstantSCCS ran the Mysticality test,
 * in gray: nothing acts on it, but a sudden change is worth a look. The values
 * are saved by our InstantSCCS fork in logRelevantStats(). */
export function reportMysTest(): void {
  const base = getProperty("_cap_instantMysticalityTestBase");
  const buffed = getProperty("_cap_instantMysticalityTestBuffed");
  if (base === "") {
    print("No Mysticality test recorded today", "gray");
    return;
  }

  print(`Mysticality test: base Mys ${base}; buffed Mys ${buffed}`, "gray");
}
