import {
  closetAmount,
  equippedAmount,
  Item,
  itemAmount,
  mallPrice,
  myMeat,
  print,
  storageAmount,
  toItem,
  visitUrl,
} from "kolmafia";
import { $item } from "libram";
import { LYLECO_GUIDE_OVERRIDE } from "./overrides";
import { Kind, TRACKED } from "./tracked";

/**
 * Ported from mall/check_mall_prices.ash. Purely informational -- prints
 * today's prices for things worth tracking, never buys or sells anything.
 */

/** One tracked item's numbers, for the sheet. */
export type PriceRow = { name: string; kind: Kind; have: number; price: number };

/** Wanted items cycle through these, in list order. */
const RAINBOW = ["red", "orange", "DAA520", "green", "blue", "purple", "4B0082"];

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

/** Anywhere a sellable copy could be sitting. Not the display case. */
function owned(it: Item): number {
  return itemAmount(it) + closetAmount(it) + storageAmount(it) + equippedAmount(it);
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

/** Prices that only matter if they cross a line -- red means go change something. */
function checkReminders(): void {
  const garbagePrice = mallPrice($item`bag of park garbage`);
  print(`Garbage price: ${garbagePrice} meat`, garbagePrice > 200 ? "red" : "gray");

  const guide = $item`LyleCo Contractor's Manual`;
  const guideTolerance = 500_000;
  printPrice(guide, mallPrice(guide) > LYLECO_GUIDE_OVERRIDE + guideTolerance ? "red" : "gray");

  // Not currently calibrating fantasyrealm tix, may change in future
  printPrice($item`FantasyRealm guest pass`, "gray");
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
  print("===");
  checkKnuckleboneStore();
  print("===");
  // Rhino's toLocaleString can't be trusted to add separators, so do it by hand.
  print(`Meat: ${myMeat().toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`);
  return rows;
}
