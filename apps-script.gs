/**
 * RSVP backend: paste this into script.google.com (Extensions > Apps Script
 * from inside your Google Sheet), then deploy as a Web app.
 */
const SHEET_NAME = "RSVPs";
const HEADERS = ["Submitted at", "Name", "Attending", "Guests", "Message"];

function doPost(e) {
  const p = (e && e.parameter) || {};
  if (p.website) return reply("ok"); // honeypot: bots fill this hidden field

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }
    sheet.appendRow([
      new Date(),
      clean(p.name),
      clean(p.attending),
      Number(p.guests) || 0,
      clean(p.message)
    ]);
    return reply("ok");
  } catch (err) {
    return reply("error: " + err);
  } finally {
    lock.releaseLock();
  }
}

// Opening the web-app URL in a browser should only show a status message.
function doGet() { return reply("RSVP endpoint is live"); }

// Stops spreadsheet formulas being injected through the form (=, +, -, @).
function clean(v) {
  v = String(v || "").slice(0, 500);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}
function reply(t) { return ContentService.createTextOutput(t); }
