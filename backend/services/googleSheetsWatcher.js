const db = require("../config/db");

const {
    syncGoogleSheetsNow
} = require("./googleSheets.service");

const WATCH_INTERVAL = 5000; // 5 seconds

let lastChangeVersion = null;

let isChecking = false;

let isSyncing = false;


// ======================================================
// DATABASE QUERY HELPER
// ======================================================

function getChangeVersion() {

    return new Promise((resolve, reject) => {

        db.query(
            `
                SELECT change_version
                FROM google_sheets_sync_state
                WHERE id = 1
                LIMIT 1
            `,
            (error, rows) => {

                if (error) {

                    reject(error);

                    return;

                }

                resolve(rows);

            }
        );

    });

}


// ======================================================
// CHECK DATABASE CHANGES
// ======================================================

async function checkForDatabaseChanges() {

    if (isChecking || isSyncing) {

        return;

    }

    isChecking = true;

    try {

        const rows = await getChangeVersion();


        // ==================================================
        // SYNC STATE ROW CHECK
        // ==================================================

        if (!rows || rows.length === 0) {

            console.error(
                "Google Sheets watcher: sync state row not found."
            );

            return;

        }


        const currentVersion = Number(
            rows[0].change_version
        );


        // ==================================================
        // FIRST CHECK
        // ==================================================

        if (lastChangeVersion === null) {

            lastChangeVersion = currentVersion;

            console.log(
                `Google Sheets watcher started. Current DB version: ${currentVersion}`
            );

            return;

        }


        // ==================================================
        // NO DATABASE CHANGE
        // ==================================================

        if (currentVersion === lastChangeVersion) {

            return;

        }


        // ==================================================
        // DATABASE CHANGE DETECTED
        // ==================================================

        console.log(
            `Database change detected: ${lastChangeVersion} → ${currentVersion}`
        );


        lastChangeVersion = currentVersion;

        isSyncing = true;


        // ==================================================
        // GOOGLE SHEETS SYNC
        // ==================================================

        try {

            const result = await syncGoogleSheetsNow(
                `Automatic DB change detected (version ${currentVersion})`
            );


            console.log(
                "Google Sheets automatic sync completed:",
                result
            );

        } catch (syncError) {

            console.error(
                "Google Sheets automatic sync failed:"
            );

            console.error(
                syncError.message || syncError
            );

        } finally {

            isSyncing = false;

        }


    } catch (error) {

        console.error(
            "Google Sheets watcher database check failed:"
        );

        console.error(
            error.message || error
        );

    } finally {

        isChecking = false;

    }

}


// ======================================================
// START WATCHER
// ======================================================

function startGoogleSheetsWatcher() {

    console.log(
        `Google Sheets DB watcher started. Checking every ${WATCH_INTERVAL / 1000} seconds.`
    );


    // Initial check
    checkForDatabaseChanges();


    // Continue checking
    setInterval(
        checkForDatabaseChanges,
        WATCH_INTERVAL
    );

}


// ======================================================
// EXPORT
// ======================================================

module.exports = {
    startGoogleSheetsWatcher,
};