/**
 * Apps Script for the "Limited resources" sheet (Extensions -> Apps Script).
 * Kept here for version control only -- it isn't part of the mafia release.
 * After changing it, paste it over the sheet's copy and redeploy (see README).
 */

const WEALTH_SHEET = "wealth";
const PURCHASING_SHEET = "Purchasing power (auto)";

/** The save button on the wealth tab: appends the INPUT cells (G3:H3). */
function addTodayEntry() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const result = appendWealthInput(sheet);
  SpreadsheetApp.getUi().alert(
    result === "added" ? "Today's entry added!" : "Today's entry is already there."
  );
}

/**
 * Web app entry point, called by cap-turns' mall-prices with ?meat=<n> and
 * optionally &items=<JSON list of {name, kind, have, price}>.
 * The meat part is the same as typing it into H3 and pressing the button.
 * Replies "added" or "exists" (about the wealth row).
 */
function doPost(e) {
  const meat = Number(e.parameter.meat);
  if (!e.parameter.meat || !Number.isFinite(meat)) {
    return ContentService.createTextOutput("error: bad meat value");
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(WEALTH_SHEET);
    sheet.getRange("H3").setValue(meat);
    SpreadsheetApp.flush();
    const result = appendWealthInput(sheet);
    if (e.parameter.items) writePurchasing(ss, JSON.parse(e.parameter.items));
    return ContentService.createTextOutput(result);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Rewrites the Purchasing power (auto) tab, creating it if needed. Headers and
 * formulas are rewritten every time so they stay in step with this file;
 * formatting you add by hand is left alone. Prices arrive in meat, shown in M.
 *
 *   A:D  wanted items, in cap-turns' priority order, with days to afford
 *   F:J  owned currency / for-sale / might-sell items
 *   L:M  summary
 */
function writePurchasing(ss, items) {
  const sheet = ss.getSheetByName(PURCHASING_SHEET) || ss.insertSheet(PURCHASING_SHEET);
  const M = 1000000;

  sheet.getRange("A1:B1").setValues([["Updated", new Date()]]);
  sheet.getRange("B1").setNumberFormat("dd/mm/yyyy hh:mm");
  sheet.getRange("A2:B2").setValues([["Wanted", "Price (M)"]]);
  // M3 is cash, M7 cash plus everything for sale, M4 the 30-day daily average.
  const days = (title, have) =>
    `=ARRAYFORMULA({"${title}"; IF(A3:A="", "", IF((B3:B-${have})/$M$4<0, 0, (B3:B-${have})/$M$4)))})`;
  sheet.getRange("C2").setFormula(days("Days (cash)", "$M$3"));
  sheet.getRange("D2").setFormula(days("Days (with sales)", "$M$7"));
  sheet.getRange("F2:J2").setValues([["Asset", "Kind", "Have", "Price (M)", "Value (M)"]]);
  sheet.getRange("A2:M2").setFontWeight("bold");

  const wanted = items.filter((i) => i.kind === "want").map((i) => [i.name, i.price / M]);
  const assets = items
    .filter((i) => i.kind !== "want")
    .map((i) => [i.name, i.kind, i.have, i.price / M, (i.have * i.price) / M]);

  sheet.getRange("A3:B").clearContent();
  sheet.getRange("F3:J").clearContent();
  if (wanted.length) sheet.getRange(3, 1, wanted.length, 2).setValues(wanted);
  if (assets.length) sheet.getRange(3, 6, assets.length, 5).setValues(assets);

  const summary = [
    ["Cash (M)", "=wealth!H3/1000000"],
    ["30d avg (M/day)", "=wealth!N3/1000000"],
    ["For sale (M)", '=SUMIF(G3:G, "sell", J3:J) + SUMIF(G3:G, "currency", J3:J)'],
    ["Might sell (M)", '=SUMIF(G3:G, "keep", J3:J)'],
    ["Cash + for sale (M)", "=M3+M5"],
    ["Total wanted (M)", "=SUM(B3:B)"],
    ["Shortfall (M)", "=M8-M7"],
    ["Next purchase", "=A3"],
    ["Days to next (cash)", "=C3"],
    ["Days to next (with sales)", "=D3"],
    ["Days to farm a Mr. A", '=IFERROR(INDEX(I3:I, MATCH("Mr. Accessory", F3:F, 0))/M4, "")'],
    ["Mr. As a month", '=IFERROR((365/12)/M13, "")'],
    ["Meat a month (M)", "=(365/12)*M4"],
  ];
  sheet.getRange("L2:M2").setValues([["Summary", ""]]);
  sheet.getRange(3, 12, summary.length, 2).setValues(summary);

  sheet.getRange("B3:D").setNumberFormat("0.0");
  sheet.getRange("I3:J").setNumberFormat("0.0");
  sheet.getRange("M3:M").setNumberFormat("0.0");
  SpreadsheetApp.flush();
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
