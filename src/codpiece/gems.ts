import {
  canInteract,
  closetAmount,
  equip,
  equippedAmount,
  equippedItem,
  getProperty,
  Item,
  itemAmount,
  print,
  setProperty,
  Slot,
  storageAmount,
  stringModifier,
  takeCloset,
  takeStorage,
  toItem,
} from "kolmafia";
import { $item, $slots } from "libram";

/**
 * The Eternity Codpiece's five gem sockets, which mafia treats as equipment
 * slots codpiece1..codpiece5.
 *
 * The preferred socketing lives in cap_codpieceGems: five comma-separated item
 * ids, one per socket, blank for a socket that should stay empty -- e.g.
 * "11979,,11979,11982,11979". Unset means no preference, so nothing is reset.
 * Set it from the "Cap Codpiece" relay page or `codpiece save` in the gCLI.
 */
export const CODPIECE = $item`The Eternity Codpiece`;
export const SOCKETS: Slot[] = $slots`codpiece1, codpiece2, codpiece3, codpiece4, codpiece5`;
export const GEMS_SETTING = "cap_codpieceGems";

/** What a gem does in the codpiece, e.g. "Spell Damage Percent: +10". */
export function gemEffect(gem: Item): string {
  return gem === $item.none ? "" : stringModifier(`EternityCodpiece:${gem.name}`, "Modifiers");
}

let allGems: Item[] | undefined;
/** Every item that can go in a socket, by name. */
export function codpieceGems(): Item[] {
  allGems ??= Item.all()
    .filter((it) => gemEffect(it).length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
  return allGems;
}

export function haveCodpiece(): boolean {
  return itemAmount(CODPIECE) + equippedAmount(CODPIECE) > 0;
}

/** What's in each socket now. */
export function currentGems(): Item[] {
  return SOCKETS.map((slot) => equippedItem(slot));
}

/** The preferred gem per socket, or null if none has been set. */
export function preferredGems(): Item[] | null {
  const value = getProperty(GEMS_SETTING);
  if (!value) return null;
  const ids = value.split(",");
  return SOCKETS.map((_, i) => {
    const id = Number(ids[i] ?? "");
    return id > 0 ? toItem(id) : $item.none;
  });
}

export function setPreferredGems(gems: Item[]): void {
  setProperty(GEMS_SETTING, gems.map((gem) => (gem === $item.none ? "" : `${gem.id}`)).join(","));
}

/** Sockets (0-based) whose gem isn't the preferred one. */
export function mismatchedSockets(preferred: Item[]): number[] {
  const current = currentGems();
  return SOCKETS.map((_, i) => i).filter((i) => current[i] !== preferred[i]);
}

/** Gets one of a gem into inventory, from the closet or (out of ronin)
 * Hagnk's. Never buys. */
function fetchGem(gem: Item): boolean {
  if (itemAmount(gem) > 0) return true;
  if (closetAmount(gem) > 0 && takeCloset(1, gem)) return true;
  if (canInteract() && storageAmount(gem) > 0 && takeStorage(1, gem)) return true;
  return false;
}

/**
 * Puts the preferred gems back. Empties the wrong sockets first, so a gem
 * that's in the wrong socket comes back to inventory and can go in the right
 * one. Returns the sockets still wrong afterwards (empty means all good).
 */
export function resetCodpiece(): number[] {
  const preferred = preferredGems();
  if (!preferred) {
    print(`No preferred codpiece socketing set (${GEMS_SETTING}); leaving it alone.`, "gray");
    return [];
  }
  if (!haveCodpiece()) {
    print("The Eternity Codpiece isn't in inventory or equipped; can't check its sockets.", "red");
    return [];
  }

  const wrong = mismatchedSockets(preferred);
  if (wrong.length === 0) {
    print("Codpiece sockets are as preferred.", "gray");
    return [];
  }

  for (const i of wrong) {
    if (equippedItem(SOCKETS[i]) !== $item.none) equip(SOCKETS[i], $item.none);
  }
  for (const i of wrong) {
    const gem = preferred[i];
    if (gem === $item.none) continue;
    if (!fetchGem(gem)) {
      print(`No ${gem.name} to put in socket ${i + 1} (checked inventory, closet and Hagnk's).`, "red");
      continue;
    }
    print(`Socketing ${gem.name} in codpiece socket ${i + 1}.`, "blue");
    equip(SOCKETS[i], gem);
  }

  const stillWrong = mismatchedSockets(preferred);
  for (const i of stillWrong) {
    const want = preferred[i] === $item.none ? "empty" : preferred[i].name;
    const have = equippedItem(SOCKETS[i]);
    print(`Codpiece socket ${i + 1} should be ${want} but is ${have === $item.none ? "empty" : have.name}.`, "red");
  }
  if (stillWrong.length === 0) print("Codpiece sockets reset.", "green");
  return stillWrong;
}
