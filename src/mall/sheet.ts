import { getProperty, myMeat, print, setProperty, visitUrl } from "kolmafia";
import { PriceRow } from "./checkMallPrices";

/**
 * Sends today's meat and tracked prices to the "Limited resources" sheet, via
 * the Apps Script web app in sheets/Code.gs: meat goes on the wealth tab,
 * prices rewrite the "Purchasing power (auto)" tab.
 *
 * The web-app URL lives in a preference, not here: anyone holding it can write
 * to the sheet, and this repo is public. Unset means skip quietly.
 *
 * The flag starts with an underscore, so mafia clears it at rollover -- that's
 * what makes this once a day. The script also refuses a second wealth row for
 * the same date, in case the flag is lost before mafia saves preferences.
 */
const URL_SETTING = "cap_sheetUrl";
const UPDATED_FLAG = "_capSheetUpdated";

export function updateSheet(rows: PriceRow[]): void {
  const url = getProperty(URL_SETTING);
  if (!url) return;
  if (getProperty(UPDATED_FLAG) === "true") {
    print("Sheet already updated today.", "gray");
    return;
  }

  // Encoded by hand and sent as-is (third arg), so item names can't break
  // the form fields. visitUrl sends a full https:// URL to that site rather
  // than to KoL, and follows Apps Script's 302 to fetch the reply text.
  const items = encodeURIComponent(JSON.stringify(rows));
  const reply = visitUrl(`${url}?meat=${myMeat()}&items=${items}`, true, true).trim();
  if (reply === "added" || reply === "exists") {
    setProperty(UPDATED_FLAG, "true");
    print(reply === "added" ? "Sheet updated." : "Sheet updated (wealth already in for today).", "gray");
  } else {
    print(`Couldn't update sheet: ${reply.slice(0, 200) || "no reply"}`, "red");
  }
}
