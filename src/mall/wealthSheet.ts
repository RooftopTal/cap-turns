import { getProperty, myMeat, print, setProperty, visitUrl } from "kolmafia";

/**
 * Logs today's meat to the wealth tab of the "Limited resources" sheet, via
 * the Apps Script web app in sheets/Code.gs.
 *
 * The web-app URL lives in a preference, not here: anyone holding it can write
 * to the sheet, and this repo is public. Unset means skip quietly.
 *
 * The flag starts with an underscore, so mafia clears it at rollover -- that's
 * what makes this once a day. The script also refuses a second row for the
 * same date, in case the flag is lost before mafia saves preferences.
 */
const URL_SETTING = "cap_sheetUrl";
const LOGGED_FLAG = "_capWealthLogged";

export function logWealth(): void {
  const url = getProperty(URL_SETTING);
  if (!url) return;
  if (getProperty(LOGGED_FLAG) === "true") {
    print("Wealth already logged today.", "gray");
    return;
  }

  // visitUrl sends a full https:// URL to that site rather than to KoL, and
  // follows Apps Script's 302 to fetch the reply text.
  const reply = visitUrl(`${url}?meat=${myMeat()}`, true, false).trim();
  if (reply === "added" || reply === "exists") {
    setProperty(LOGGED_FLAG, "true");
    print(reply === "added" ? "Wealth logged to sheet." : "Wealth already in sheet for today.", "gray");
  } else {
    print(`Couldn't log wealth to sheet: ${reply.slice(0, 200) || "no reply"}`, "red");
  }
}
