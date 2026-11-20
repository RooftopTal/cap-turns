import { closetAmount, formFields, Item, itemAmount, storageAmount, toItem, write } from "kolmafia";
import { $item } from "libram";
import {
  codpieceGems,
  currentGems,
  gemEffect,
  haveCodpiece,
  preferredGems,
  resetCodpiece,
  setPreferredGems,
  SOCKETS,
} from "../codpiece/gems";
import { escape } from "./html";

/**
 * "Cap Codpiece" in mafia's relay-browser script dropdown: choose the
 * Eternity Codpiece's preferred gem per socket, and put them back. Built as
 * relay/relay_Cap_Codpiece.js. The same preference drives `codpiece` in the
 * gCLI and cap's ascension prep.
 */
const SELF = "relay_Cap_Codpiece.js?relay=true";

type Message = { text: string; ok: boolean };

/** The five choices from the form, or null if any is missing or not a gem. */
function chosenGems(fields: { [key: string]: string }): Item[] | null {
  const gems = SOCKETS.map((_, i) => {
    const id = Number(fields[`gem${i + 1}`] ?? "");
    return id > 0 ? toItem(id) : $item.none;
  });
  const valid = gems.every((gem) => gem === $item.none || codpieceGems().includes(gem));
  return valid ? gems : null;
}

function handle(fields: { [key: string]: string }): Message | null {
  switch (fields.action) {
    case "save":
    case "apply": {
      const gems = chosenGems(fields);
      if (!gems) return { text: "That isn't a socketable gem.", ok: false };
      setPreferredGems(gems);
      if (fields.action === "save") return { text: "Saved.", ok: true };
      const wrong = resetCodpiece();
      return wrong.length === 0
        ? { text: "Saved, and the codpiece now matches.", ok: true }
        : {
            text: `Saved, but socket${wrong.length > 1 ? "s" : ""} ${wrong.map((i) => i + 1).join(", ")} couldn't be set -- see the gCLI.`,
            ok: false,
          };
    }
    case "current":
      setPreferredGems(currentGems());
      return { text: "Preferred socketing set to what's in the codpiece now.", ok: true };
    default:
      return null;
  }
}

function owned(gem: Item): number {
  return itemAmount(gem) + closetAmount(gem) + storageAmount(gem);
}

function describe(gem: Item): string {
  return gem === $item.none
    ? `<span class="muted">(empty)</span>`
    : `${escape(gem.name)}<div class="effect">${escape(gemEffect(gem))}</div>`;
}

function gemSelect(socket: number, selected: Item): string {
  const options = [$item.none, ...codpieceGems()].map((gem) => {
    const label =
      gem === $item.none ? "(empty)" : `${gem.name} -- ${gemEffect(gem)} (have ${owned(gem)})`;
    return `<option value="${gem === $item.none ? 0 : gem.id}"${gem === selected ? " selected" : ""}>${escape(label)}</option>`;
  });
  return `<select name="gem${socket + 1}">${options.join("")}</select>`;
}

function sockets(): string {
  const current = currentGems();
  const preferred = preferredGems();
  const rows = SOCKETS.map((_, i) => {
    const want = preferred ? preferred[i] : current[i];
    const off = preferred !== null && preferred[i] !== current[i];
    return `
    <tr${off ? ` class="off"` : ""}>
      <td class="n">${i + 1}</td>
      <td>${describe(current[i])}</td>
      <td>${gemSelect(i, want)}</td>
    </tr>`;
  }).join("");
  return `
<form method="post" action="${SELF}">
  <table>
    <tr><th></th><th>In the codpiece now</th><th>Preferred</th></tr>${rows}
  </table>
  <div class="buttons">
    <button type="submit" name="action" value="save">Save</button>
    <button type="submit" name="action" value="apply">Save and socket now</button>
    <button type="submit" name="action" value="current"
      onclick="return confirm('Replace the preferred socketing with what is in the codpiece now?')">Use what's socketed now</button>
  </div>
</form>
${preferred ? "" : `<p class="muted">No preferred socketing saved yet; the choices above are what's socketed now.</p>`}`;
}

export function main(): void {
  const message = haveCodpiece() ? handle(formFields()) : null;
  write(`<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Cap Codpiece</title>
<style>
  body { font-family: Arial, Helvetica, sans-serif; font-size: 14px; margin: 16px; max-width: 900px; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .intro, .muted { color: #666; }
  .intro { margin: 0 0 12px; }
  table { border-collapse: collapse; width: 100%; }
  th { text-align: left; font-size: 12px; color: #444; padding: 3px 6px; border-bottom: 1px solid #ccc; }
  td { padding: 5px 6px; border-bottom: 1px solid #eee; vertical-align: top; }
  td.n { color: #888; width: 1%; }
  tr.off td { background: #fdf0e0; }
  .effect { color: #777; font-size: 12px; }
  select { font-size: 13px; padding: 2px 4px; max-width: 100%; }
  button { font-size: 14px; padding: 3px 8px; }
  .buttons { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
  .message { margin: 12px 0; padding: 6px 8px; border-radius: 3px; }
  .ok { background: #e6f4e6; color: #225522; }
  .error { background: #f8e3e3; color: #882222; }
</style>
</head>
<body>
<h1>Cap Codpiece</h1>
<p class="intro">The Eternity Codpiece's preferred gems. <code>codpiece</code> in the gCLI and cap's ascension prep put these back; highlighted sockets don't match.</p>
${message ? `<p class="message ${message.ok ? "ok" : "error"}">${escape(message.text)}</p>` : ""}
${haveCodpiece() ? sockets() : `<p class="message error">The Eternity Codpiece isn't in inventory or equipped.</p>`}
</body>
</html>`);
}
