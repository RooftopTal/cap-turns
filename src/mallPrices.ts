import { print } from "kolmafia";
import { checkMallPrices } from "./mall/checkMallPrices";
import { updateSheet } from "./mall/sheet";
import { addTracked, getTracked, isKind, Kind, KINDS, parseItem, removeTracked } from "./mall/tracked";

/** `mall-prices` in the gCLI: just the price report, without a whole cap day.
 * Not named check_mall_prices -- mafia resolves scripts by filename across the
 * whole scripts tree, and the ASH original still lives in scripts/cap/mall/.
 *
 * Also edits what it tracks (the relay page "Cap Mall Prices" does the same):
 *   mall-prices list
 *   mall-prices add 12391 sell      (item number or name; kind defaults to want)
 *   mall-prices remove 12391 */
export function main(command = ""): void {
  const [verb, ...rest] = command.trim().split(/\s+/);
  switch (verb.toLowerCase()) {
    case "":
      updateSheet(checkMallPrices());
      return;
    case "list":
      return list();
    case "add":
      return add(rest);
    case "remove":
      return remove(rest.join(" "));
    default:
      print(`Usage: mall-prices [list | add <item> [${KINDS.join("|")}] | remove <item>]`, "red");
  }
}

function list(): void {
  for (const { item, kind } of getTracked()) print(`${item.id}  ${item.name}  (${kind})`);
}

function add(words: string[]): void {
  // The kind is optional and last, so item names with spaces still work.
  const last = words[words.length - 1]?.toLowerCase() ?? "";
  const kind: Kind = isKind(last) ? last : "want";
  const item = parseItem((isKind(last) ? words.slice(0, -1) : words).join(" "));
  if (!item) {
    print("Don't know that item.", "red");
    return;
  }
  addTracked(item, kind);
  print(`Tracking ${item.name} (${kind}).`, "green");
}

function remove(text: string): void {
  const item = parseItem(text);
  if (!item) {
    print("Don't know that item.", "red");
  } else if (removeTracked(item)) {
    print(`No longer tracking ${item.name}.`, "green");
  } else {
    print(`${item.name} wasn't tracked.`, "red");
  }
}
