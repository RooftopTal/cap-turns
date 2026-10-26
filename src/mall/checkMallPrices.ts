import {
  closetAmount,
  equippedAmount,
  Item,
  itemAmount,
  mallPrice,
  myMeat,
  print,
  shopAmount,
  storageAmount,
  toItem,
  visitUrl,
} from "kolmafia";
import { $item, get } from "libram";
import { fantasyRealmEstimate, pirateRealmEstimate } from "../realms/realms";
import { OVERRIDABLE, overrideFor } from "./prices";
import { Kind, TRACKED } from "./tracked";

/**
 * Ported from mall/check_mall_prices.ash. Purely informational -- prints
 * today's prices for things worth tracking, never buys or sells anything.
 */

/** One tracked item's numbers, for the sheet. */
export type PriceRow = { name: string; kind: Kind; have: number; price: number };

/** Wanted items cycle through these, in list order. Mid-brightness so they
 * read on the dark gCLI theme as well as the light one, and in hue order so
 * the wrap from pink back to red is just another step round the wheel. */
const RAINBOW = [
  "E06666", // red
  "F09A4A", // orange
  "D4AC2B", // gold
  "8BC34A", // green
  "26A69A", // teal
  "4FA3E0", // blue
  "8C9EFF", // periwinkle
  "B388EB", // violet
  "E57BC4", // pink
];

// ASH did int/int division here, which truncates; JS needs it spelled out.
function formatPrice(price: number): string {
  if (price > 1_000_000) return `${Math.trunc(price / 1_000_000)}M`;
  if (price > 1000) return `${Math.trunc(price / 1000)}k`;
  return `${price} meat`;
}

function printLine(text: string, colour?: string): void {
  // No colour means mafia's default, which follows the light/dark theme.
  if (colour) print(text, colour);
  else print(text);
}

function printPrice(it: Item, colour?: string): void {
  printLine(`${it.name} price: ${formatPrice(mallPrice(it))}`, colour);
}

/** Anywhere a sellable copy could be sitting, including already listed in
 * the mall store (shopAmount loads the store listing on first use). Not the
 * display case. */
function owned(it: Item): number {
  return (
    itemAmount(it) + closetAmount(it) + storageAmount(it) + equippedAmount(it) + shopAmount(it)
  );
}

const SECTIONS: { kind: Kind; title: string }[] = [
  { kind: "currency", title: "CURRENCY" },
  { kind: "want", title: "WANTED" },
  { kind: "sell", title: "FOR SALE" },
  { kind: "keep", title: "MIGHT SELL" },
];

function checkTracked(): PriceRow[] {
  const rows: PriceRow[] = [];
  for (const { kind, title } of SECTIONS) {
    print(" ");
    print(`=== ${title} ===`);
    TRACKED.filter((t) => t.kind === kind).forEach(({ item }, i) => {
      const row = { name: item.name, kind, have: owned(item), price: mallPrice(item) };
      rows.push(row);
      const have = kind !== "want" && row.have > 0 ? ` (have ${row.have})` : "";
      const colour = kind === "want" ? RAINBOW[i % RAINBOW.length] : kind === "keep" ? "gray" : undefined;
      printLine(`${item.name} price: ${formatPrice(row.price)}${have}`, colour);
    });
  }
  return rows;
}

/** How far an override can drift from the mall before it's flagged red. */
const OVERRIDE_DRIFT = 0.25;

/** Prices that only matter if they cross a line -- red means go change something. */
function checkReminders(): void {
  const garbagePrice = mallPrice($item`bag of park garbage`);
  print(`Garbage price: ${garbagePrice} meat`, garbagePrice > 200 ? "red" : "gray");

  // The realm prices. Red when an override has drifted well away from the
  // mall: either the override is stale, or the mall is being silly -- worth a look.
  for (const it of OVERRIDABLE) {
    const mall = mallPrice(it);
    const override = overrideFor(it);
    const note = override === undefined ? "" : ` (override ${formatPrice(override)})`;
    const drifted = override !== undefined && Math.abs(mall - override) > override * OVERRIDE_DRIFT;
    printLine(`${it.name} price: ${formatPrice(mall)}${note}`, drifted ? "red" : "gray");
  }
}

/** Today's realm estimates, at the same prices cap will decide with. */
function checkRealms(): void {
  const voa = get("valueOfAdventure");
  for (const [name, est] of [
    ["PirateRealm", pirateRealmEstimate()],
    ["FantasyRealm", fantasyRealmEstimate()],
  ] as const) {
    printLine(`${name}: ~${est.perTurn} meat/turn vs ${voa} (${est.breakdown})`, est.perTurn >= voa ? "green" : "gray");
  }
}

function checkKnuckleboneStore(): void {
  const shopText = visitUrl("main.php?pwd&talktosocp=1", false, true);
  const special = shopText.match(/value="Daily Special: ([^<]+)"/);
  if (special) {
    print(`Skeleton special: ${special[1]}`, "green");
    printPrice(toItem(special[1]), "green");
  } else {
    print("Couldn't find skellie special!", "red");
  }
}

export function checkMallPrices(): PriceRow[] {
  const rows = checkTracked();

  print(" ");
  print("=== REMINDERS ===");
  checkReminders();
  print(" ");
  print("=== REALMS ===");
  checkRealms();
  print("===");
  checkKnuckleboneStore();
  print("===");
  // Rhino's toLocaleString can't be trusted to add separators, so do it by hand.
  print(`Meat: ${myMeat().toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`);
  return rows;
}
