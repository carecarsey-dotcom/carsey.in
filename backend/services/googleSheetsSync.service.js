// ======================================================
// CARSEY.IN - GOOGLE SHEETS SYNC HELPER
// ======================================================

const {
    scheduleGoogleSheetsSync
} = require("./googleSheets.service");

// ======================================================
// DATABASE CHANGE SYNC
// ======================================================

function triggerGoogleSheetsSync(
    reason = "Database change"
) {
    try {

        scheduleGoogleSheetsSync(
            reason
        );

    } catch (error) {

        // Google Sheets sync must NEVER
        // break the existing Carsey operation.
        console.error(
            "Google Sheets sync trigger failed:"
        );

        console.error(
            error.message || error
        );
    }
}

// ======================================================
// EXPORT
// ======================================================

module.exports = {
    triggerGoogleSheetsSync
};