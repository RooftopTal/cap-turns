import { Item, mallPrice, print, toItem, visitUrl } from "kolmafia";
import { $item, $items } from "libram";
import { LYLECO_GUIDE_OVERRIDE } from "./overrides";

/**
 * Ported from mall/check_mall_prices.ash. Purely informational -- prints
 * today's prices for things worth tracking, never buys or sells anything.
 */

// ASH did int/int division here, which truncates; JS needs it spelled out.
function printPrice(it: Item, colour: string): void {
  const price = mallPrice(it);
  if (price > 1_000_000) {
    print(`${it.name} price: ${Math.trunc(price / 1_000_000)}M`, colour);
  } else if (price > 1000) {
    print(`${it.name} price: ${Math.trunc(price / 1000)}k`, colour);
  } else {
    print(`${it.name} price: ${price} meat`, colour);
  }
}

function checkDesirePrices(): void {
  printPrice($item`Mr. Accessory`, "red");
  printPrice($item`Booke of Vampyric Knowledge`, "orange");
  // printPrice($item`moveable feast`, "DAA520");
  printPrice($item`Comprehensive Cartographic Compendium`, "DAA520");
  printPrice($item`Order of the Green Thumb Order Form`, "green");
  printPrice($item`meteorite fragment`, "blue");
  printPrice($item`Pokéfam Guide to Capturing All of Them`, "purple");
  printPrice($item`corked genie bottle`, "4B0082");
}

function checkKeepPrices(): void {
  for (const it of $items`ice sickle, haiku katana`) printPrice(it, "gray");
}

function checkSalesPrices(): void {
  const items = $items`boxed Heartstone, boxed bat wings, assemble-it-yourself Leprecondo, lab-grown blood cubic zirconia, shrink-wrapped Cup of 13s, scabbarded Sword of S Words`;
  for (const it of items) printPrice(it, "black");
}

function checkGarbage(): void {
  const garbagePrice = mallPrice($item`bag of park garbage`);
  print(`Garbage price: ${garbagePrice} meat`, garbagePrice > 200 ? "red" : "gray");
}

function checkFantasyCalibration(): void {
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

export function checkMallPrices(): void {
  print(" ");
  print("=== DESIRE tracker for today ===");
  checkDesirePrices();

  print(" ");
  print("=== SALES tracker for today ===");
  checkKeepPrices();
  checkSalesPrices();
  checkGarbage();
  print("===", "gray");
  checkFantasyCalibration();
  print("===", "black");
  checkKnuckleboneStore();
}
