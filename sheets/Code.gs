/**
 * Apps Script for the "Limited resources" sheet (Extensions -> Apps Script).
 * Kept here for version control only -- it isn't part of the mafia release.
 * After changing it, paste it over the sheet's copy and redeploy (see README).
 */

const WEALTH_SHEET = "wealth";

/** The save button on the wealth tab: appends the INPUT cells (G3:H3). */
function addTodayEntry() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const result = appendWealthInput(sheet);
  SpreadsheetApp.getUi().alert(
    result === "added" ? "Today's entry added!" : "Today's entry is already there."
  );
}

/**
 * Web app entry point, called by cap-turns' mall-prices with ?meat=<n>.
 * Same as typing the meat into H3 and pressing the button.
 */
function doPost(e) {
  const meat = Number(e.parameter.meat);
  if (!e.parameter.meat || !Number.isFinite(meat)) {
    return ContentService.createTextOutput("error: bad meat value");
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(WEALTH_SHEET);
    sheet.getRange("H3").setValue(meat);
    SpreadsheetApp.flush();
    return ContentService.createTextOutput(appendWealthInput(sheet));
  } finally {
    lock.releaseLock();
  }
}

/** Copies G3:H3 into the first empty row of A:B, unless the last row already
 * has today's date. Returns "added" or "exists". */
function appendWealthInput(sheet) {
  const input = sheet.getRange("G3:H3").getValues()[0];
  const dates = sheet.getRange("A2:A").getValues();

  let row = 0;
  while (row < dates.length && dates[row][0] !== "") row++;

  const tz = sheet.getParent().getSpreadsheetTimeZone();
  const day = (d) => Utilities.formatDate(new Date(d), tz, "yyyy-MM-dd");
  if (row > 0 && day(dates[row - 1][0]) === day(input[0])) return "exists";

  // dates starts at row 2, so index row is sheet row row + 2.
  sheet.getRange(row + 2, 1, 1, 2).setValues([input]);
  SpreadsheetApp.flush();
  return "added";
}
