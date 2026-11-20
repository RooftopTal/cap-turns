import { formFields, write } from "kolmafia";
import { addTracked, getTracked, isKind, KINDS, parseItem, removeTracked } from "../mall/tracked";
import { escape } from "./html";

/**
 * "Cap Mall Prices" in mafia's relay-browser script dropdown: add and remove
 * the items mall-prices tracks. Built as relay/relay_Cap_Mall_Prices.js --
 * mafia lists any relay/relay_*.js there, underscores shown as spaces.
 *
 * Every button posts back to this same script, which applies the change and
 * redraws the page.
 */
const SELF = "relay_Cap_Mall_Prices.js?relay=true";

const KIND_LABELS: Record<string, string> = {
  currency: "Currency",
  want: "Wanted (priority order)",
  sell: "For sale",
  keep: "Might sell",
};

/** Applies whatever the form asked for; returns a message for the page. */
function handle(fields: { [key: string]: string }): { text: string; ok: boolean } | null {
  if (fields.action === "add") {
    const item = parseItem(fields.item ?? "");
    const kind = fields.kind ?? "";
    if (!item) return { text: `No item ${escape(fields.item ?? "")}.`, ok: false };
    if (!isKind(kind)) return { text: "Pick a kind.", ok: false };
    addTracked(item, kind);
    return { text: `Tracking ${escape(item.name)} (${kind}).`, ok: true };
  }
  if (fields.action === "remove") {
    const item = parseItem(fields.item ?? "");
    if (item && removeTracked(item)) return { text: `Removed ${escape(item.name)}.`, ok: true };
    return { text: "That item wasn't tracked.", ok: false };
  }
  return null;
}

function addForm(): string {
  const options = KINDS.map((k) => `<option value="${k}"${k === "want" ? " selected" : ""}>${k}</option>`).join("");
  return `
<form method="post" action="${SELF}" class="add">
  <input type="hidden" name="action" value="add">
  <label>Item number <input name="item" inputmode="numeric" placeholder="e.g. 12391" required autofocus></label>
  <label>Kind <select name="kind">${options}</select></label>
  <button type="submit">Add</button>
</form>`;
}

function trackedTables(): string {
  const tracked = getTracked();
  return KINDS.map((kind) => {
    const rows = tracked
      .filter((t) => t.kind === kind)
      .map(
        ({ item }) => `
    <tr>
      <td class="id">${item.id}</td>
      <td>${escape(item.name)}</td>
      <td class="remove">
        <form method="post" action="${SELF}" data-name="${escape(item.name)}"
          onsubmit="return confirm('Stop tracking ' + this.dataset.name + '?')">
          <input type="hidden" name="action" value="remove">
          <input type="hidden" name="item" value="${item.id}">
          <button type="submit" title="Stop tracking ${escape(item.name)}">Remove</button>
        </form>
      </td>
    </tr>`,
      )
      .join("");
    return `
<h2>${KIND_LABELS[kind]}</h2>
${rows ? `<table>${rows}</table>` : `<p class="empty">Nothing here.</p>`}`;
  }).join("");
}

export function main(): void {
  const message = handle(formFields());
  write(`<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Cap Mall Prices</title>
<style>
  body { font-family: Arial, Helvetica, sans-serif; font-size: 14px; margin: 16px; max-width: 640px; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  h2 { font-size: 15px; margin: 20px 0 6px; border-bottom: 1px solid #ccc; padding-bottom: 2px; }
  .intro { color: #666; margin: 0 0 12px; }
  .add { display: flex; gap: 12px; align-items: end; flex-wrap: wrap; }
  .add label { display: flex; flex-direction: column; gap: 2px; font-size: 12px; color: #444; }
  .add input { width: 120px; }
  input, select, button { font-size: 14px; padding: 3px 6px; }
  .message { margin: 12px 0 0; padding: 6px 8px; border-radius: 3px; }
  .ok { background: #e6f4e6; color: #225522; }
  .error { background: #f8e3e3; color: #882222; }
  table { border-collapse: collapse; width: 100%; }
  td { padding: 3px 6px; border-bottom: 1px solid #eee; }
  td.id { color: #888; width: 60px; font-variant-numeric: tabular-nums; }
  td.remove { text-align: right; width: 1%; }
  td.remove form { margin: 0; }
  .empty { color: #888; margin: 0; }
</style>
</head>
<body>
<h1>Cap Mall Prices</h1>
<p class="intro">What <code>mall-prices</code> reports on and sends to the sheet. Adding an item that's already tracked changes its kind.</p>
${addForm()}
${message ? `<p class="message ${message.ok ? "ok" : "error"}">${message.text}</p>` : ""}
${trackedTables()}
</body>
</html>`);
}
