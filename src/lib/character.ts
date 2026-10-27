import { myName } from "kolmafia";

/** myName() comes back however the name was typed at login, so compare lowercased. */
export function isCharacter(name: string): boolean {
  return myName().toLowerCase() === name.toLowerCase();
}
