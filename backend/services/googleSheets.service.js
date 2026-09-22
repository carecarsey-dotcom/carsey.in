// ======================================================
// CARSEY.IN - GOOGLE SHEETS SERVICE
// ======================================================

const { google } = require("googleapis");

const db = require("../config/db");
const env = require("../config/env");

// ======================================================
// GOOGLE SHEETS CONFIGURATION
// ======================================================

const SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets"
];

// ======================================================
// DATABASE TABLES
// ======================================================

const TABLES = [
    "admins",
    "car_images",
    "cars",
    "exchange_requests",
    "finance_requests",
    "inspection_bookings",
    "inspection_checklist",
    "inspection_reports",
    "inspection_requests",
    "loan_requests",
    "owners",
    "report_unlock_requests",
    "sell_car_requests",
    "test_drive_requests"
];

// ======================================================
// SYNC CONFIGURATION
// ======================================================

let syncTimer = null;
let syncRunning = false;
let syncQueued = false;
let lastSyncCompletedAt = 0;

// Do not start another full 14-table sync immediately after one finishes.
// This protects the service-account user quota when many DB writes happen together.
const MIN_SYNC_INTERVAL = 60000;

const SYNC_DELAY = 3000;

// Google Sheets has per-minute write quotas.
// Keep retries bounded and use exponential backoff for 429/5xx errors.
const GOOGLE_RETRY_LIMIT = 5;
const GOOGLE_MAX_BACKOFF = 32000;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function isRetryableGoogleError(error) {

    const status =
        Number(
            error?.response?.status ||
            error?.code ||
            0
        );

    const message = String(
        error?.message ||
        error ||
        ""
    ).toLowerCase();

    return (
        status === 429 ||
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504 ||
        message.includes("quota exceeded") ||
        message.includes("too many requests") ||
        message.includes("rate limit") ||
        message.includes("resource exhausted")
    );
}

async function executeGoogleRequest(
    operation,
    label = "Google Sheets request"
) {

    let lastError = null;

    for (
        let attempt = 0;
        attempt <= GOOGLE_RETRY_LIMIT;
        attempt++
    ) {

        try {
            return await operation();
        } catch (error) {

            lastError = error;

            if (
                !isRetryableGoogleError(error) ||
                attempt >= GOOGLE_RETRY_LIMIT
            ) {
                throw error;
            }

            const baseDelay = Math.min(
                1000 * Math.pow(2, attempt),
                GOOGLE_MAX_BACKOFF
            );

            const jitter =
                Math.floor(Math.random() * 1000);

            const delay = Math.min(
                baseDelay + jitter,
                GOOGLE_MAX_BACKOFF
            );

            console.warn(
                `Google Sheets ${label} hit a temporary quota/rate limit. ` +
                `Retry ${attempt + 1}/${GOOGLE_RETRY_LIMIT} in ${delay}ms.`
            );

            await sleep(delay);
        }
    }

    throw lastError;
}

// ======================================================
// GOOGLE AUTHENTICATION
// ======================================================

function getGoogleAuth() {

    if (
        !env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
        !env.GOOGLE_PRIVATE_KEY
    ) {
        throw new Error(
            "Google Sheets credentials are not configured."
        );
    }

    return new google.auth.GoogleAuth({
        credentials: {
            client_email:
                env.GOOGLE_SERVICE_ACCOUNT_EMAIL,

            private_key:
                env.GOOGLE_PRIVATE_KEY
        },

        scopes: SCOPES
    });
}

// ======================================================
// GET GOOGLE SHEETS CLIENT
// ======================================================

async function getSheetsClient() {

    if (!env.GOOGLE_SPREADSHEET_ID) {
        throw new Error(
            "GOOGLE_SPREADSHEET_ID is not configured."
        );
    }

    const auth = getGoogleAuth();

    const authClient =
        await auth.getClient();

    return google.sheets({
        version: "v4",
        auth: authClient
    });
}

// ======================================================
// SAFE SHEET NAME
// ======================================================

function getSafeSheetName(tableName) {

    return tableName
        .replace(/[\\\/\?\*\[\]:]/g, "_")
        .substring(0, 100);
}

// ======================================================
// FILE COLUMN DETECTION
// ======================================================

const FILE_COLUMN_NAMES = new Set([
    "image_path",
    "image_url",
    "pdf_path",
    "pdf_url",
    "video_path",
    "video_url",
    "front_image",
    "back_image",
    "left_image",
    "right_image",
    "vehicle_image",
    "document_image",
    "document_path",
    "file_path",
    "file_url",
    "photo_path",
    "photo_url",
    "test_drive_video",
    "test_drive_video_path"
]);

// ======================================================
// GET BACKEND PUBLIC URL
// ======================================================

function getBackendPublicUrl() {

    const baseUrl =
        process.env.BACKEND_PUBLIC_URL ||
        process.env.API_BASE_URL ||
        process.env.BACKEND_URL ||
        "";

    return String(baseUrl)
        .trim()
        .replace(/\/+$/, "");
}

// ======================================================
// CONVERT FILE PATH TO PUBLIC URL
// ======================================================

function convertFilePathToUrl(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "";
    }

    const stringValue = String(value).trim();

    if (!stringValue) {
        return "";
    }

    // Already a complete URL
    if (
        stringValue.startsWith("http://") ||
        stringValue.startsWith("https://")
    ) {
        return stringValue;
    }

    const backendUrl =
        getBackendPublicUrl();

    if (!backendUrl) {
        return stringValue;
    }

    let cleanPath =
        stringValue.replace(/\\/g, "/");

    // Remove leading ./ if present
    cleanPath =
        cleanPath.replace(/^\.\/+/, "");

    // Convert absolute/local upload paths
    const uploadsIndex =
        cleanPath.indexOf("uploads/");

    if (uploadsIndex >= 0) {
        cleanPath =
            cleanPath.substring(uploadsIndex);
    }

    // Remove leading slash
    cleanPath =
        cleanPath.replace(/^\/+/, "");

    return `${backendUrl}/${cleanPath}`;
}

// ======================================================
// FORMAT DATABASE VALUE
// ======================================================

function formatCellValue(
    value,
    columnName = ""
) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    // Date
    if (value instanceof Date) {
        return value.toISOString();
    }

    // Buffer
    if (
        typeof value === "object" &&
        Buffer.isBuffer(value)
    ) {
        return value.toString("utf8");
    }

    // Boolean
    if (typeof value === "boolean") {
        return value ? "TRUE" : "FALSE";
    }

    // File / media path
    if (
        FILE_COLUMN_NAMES.has(
            String(columnName).toLowerCase()
        )
    ) {
        return convertFilePathToUrl(value);
    }

    // Object / JSON
    if (typeof value === "object") {

        try {
            return JSON.stringify(value);
        } catch (error) {
            return String(value);
        }
    }

    return String(value);
}

// ======================================================
// GET DATABASE TABLE DATA
// ======================================================

async function getTableData(tableName) {

    const [rows] =
        await db
            .promise()
            .query(
                `SELECT * FROM \`${tableName}\``
            );

    return rows;
}

// ======================================================
// GET DATABASE TABLE COLUMNS
// ======================================================

async function getTableColumns(tableName) {

    const [columns] =
        await db
            .promise()
            .query(
                `
                SELECT
                    COLUMN_NAME
                FROM
                    INFORMATION_SCHEMA.COLUMNS
                WHERE
                    TABLE_SCHEMA = DATABASE()
                    AND TABLE_NAME = ?
                ORDER BY
                    ORDINAL_POSITION
                `,
                [tableName]
            );

    return columns.map(
        column => column.COLUMN_NAME
    );
}

// ======================================================
// GET EXISTING GOOGLE SHEETS
// ======================================================

async function getSpreadsheetSheets(
    sheets
) {

    const response =
        await sheets.spreadsheets.get({
            spreadsheetId:
                env.GOOGLE_SPREADSHEET_ID,

            fields:
                "sheets.properties"
        });

    return (
        response.data.sheets || []
    );
}

// ======================================================
// CREATE MISSING SHEET TABS
// ======================================================

async function createMissingSheets(
    sheets
) {

    const existingSheets =
        await getSpreadsheetSheets(
            sheets
        );

    const existingNames =
        new Set(
            existingSheets.map(
                sheet =>
                    sheet.properties.title
            )
        );

    const requests = [];

    for (const tableName of TABLES) {

        const sheetName =
            getSafeSheetName(
                tableName
            );

        if (
            !existingNames.has(
                sheetName
            )
        ) {

            requests.push({
                addSheet: {
                    properties: {
                        title: sheetName
                    }
                }
            });
        }
    }

    if (requests.length === 0) {
        return;
    }

    await executeGoogleRequest(
        () =>
            sheets.spreadsheets.batchUpdate({
                spreadsheetId:
                    env.GOOGLE_SPREADSHEET_ID,

                requestBody: {
                    requests
                }
            }),
        "batch update"
    );

    console.log(
        `Created ${requests.length} Google Sheet tab(s).`
    );
}

// ======================================================
// BUILD ONE TABLE SYNC DATA
// ======================================================

async function buildTableSyncData(
    tableName
) {

    const sheetName =
        getSafeSheetName(
            tableName
        );

    const columns =
        await getTableColumns(
            tableName
        );

    const rows =
        await getTableData(
            tableName
        );

    const values = [];

    // --------------------------------------------------
    // HEADER
    // --------------------------------------------------

    values.push(columns);

    // --------------------------------------------------
    // ROWS
    // --------------------------------------------------

    for (const row of rows) {

        const rowValues =
            columns.map(
                column =>
                    formatCellValue(
                        row[column],
                        column
                    )
            );

        values.push(rowValues);
    }

    return {
        tableName,
        sheetName,
        columns,
        rows,
        values
    };
}


// ======================================================
// SYNC ONE TABLE
// ======================================================

async function syncTable(
    sheets,
    tableName
) {

    console.log(
        `Syncing table: ${tableName}`
    );

    const tableData =
        await buildTableSyncData(
            tableName
        );

    // --------------------------------------------------
    // CLEAR OLD DATA
    // --------------------------------------------------

    await executeGoogleRequest(
        () =>
            sheets.spreadsheets.values.clear({
                spreadsheetId:
                    env.GOOGLE_SPREADSHEET_ID,

                range:
                    `${tableData.sheetName}!A:ZZ`
            }),
        `${tableName} clear`
    );

    // --------------------------------------------------
    // WRITE NEW DATA
    // --------------------------------------------------

    if (tableData.values.length > 0) {

        await executeGoogleRequest(
            () =>
                sheets.spreadsheets.values.update({

                    spreadsheetId:
                        env.GOOGLE_SPREADSHEET_ID,

                    range:
                        `${tableData.sheetName}!A1`,

                    valueInputOption:
                        "RAW",

                    requestBody: {
                        values:
                            tableData.values
                    }
                }),
            `${tableName} update`
        );
    }

    console.log(
        `✓ ${tableName}: ${tableData.rows.length} row(s) synced.`
    );

    return tableData;
}


// ======================================================
// BATCH SYNC TABLE DATA
// ======================================================

async function batchSyncTableData(
    sheets,
    tableDataList
) {

    if (
        !Array.isArray(tableDataList) ||
        tableDataList.length === 0
    ) {
        return;
    }

    // --------------------------------------------------
    // CLEAR ALL TABLES IN ONE API REQUEST
    // --------------------------------------------------

    const ranges =
        tableDataList.map(
            tableData =>
                `${tableData.sheetName}!A:ZZ`
        );

    await executeGoogleRequest(
        () =>
            sheets.spreadsheets.values.batchClear({
                spreadsheetId:
                    env.GOOGLE_SPREADSHEET_ID,

                requestBody: {
                    ranges
                }
            }),
        "batch clear"
    );

    // --------------------------------------------------
    // WRITE ALL TABLES IN ONE API REQUEST
    // --------------------------------------------------

    const data =
        tableDataList
            .filter(
                tableData =>
                    tableData.values.length > 0
            )
            .map(
                tableData => ({
                    range:
                        `${tableData.sheetName}!A1`,

                    values:
                        tableData.values
                })
            );

    if (data.length === 0) {
        return;
    }

    await executeGoogleRequest(
        () =>
            sheets.spreadsheets.values.batchUpdate({
                spreadsheetId:
                    env.GOOGLE_SPREADSHEET_ID,

                requestBody: {
                    valueInputOption:
                        "RAW",

                    data
                }
            }),
        "batch data update"
    );

    for (const tableData of tableDataList) {

        console.log(
            `✓ ${tableData.tableName}: ` +
            `${tableData.rows.length} row(s) synced.`
        );
    }
}


// ======================================================
// FORMAT SHEETS
// ======================================================

async function formatSheets(
    sheets
) {

    const spreadsheet =
        await sheets.spreadsheets.get({

            spreadsheetId:
                env.GOOGLE_SPREADSHEET_ID,

            fields:
                "sheets.properties"
        });

    const requests = [];

    for (
        const sheet
        of spreadsheet.data.sheets || []
    ) {

        const properties =
            sheet.properties;

        const sheetName =
            properties.title;

        if (
            !TABLES.includes(
                sheetName
            )
        ) {
            continue;
        }

        // ------------------------------------------------
        // FREEZE HEADER
        // ------------------------------------------------

        requests.push({
            updateSheetProperties: {

                properties: {

                    sheetId:
                        properties.sheetId,

                    gridProperties: {
                        frozenRowCount: 1
                    }
                },

                fields:
                    "gridProperties.frozenRowCount"
            }
        });

        // ------------------------------------------------
        // HEADER FORMAT
        // ------------------------------------------------

        requests.push({
            repeatCell: {

                range: {

                    sheetId:
                        properties.sheetId,

                    startRowIndex: 0,

                    endRowIndex: 1
                },

                cell: {

                    userEnteredFormat: {

                        textFormat: {
                            bold: true
                        }
                    }
                },

                fields:
                    "userEnteredFormat.textFormat.bold"
            }
        });

        // ------------------------------------------------
        // AUTO RESIZE COLUMNS
        // ------------------------------------------------

        requests.push({
            autoResizeDimensions: {

                dimensions: {

                    sheetId:
                        properties.sheetId,

                    dimension:
                        "COLUMNS",

                    startIndex: 0,

                    endIndex: 26
                }
            }
        });
    }

    if (requests.length === 0) {
        return;
    }

    await executeGoogleRequest(
        () =>
            sheets.spreadsheets.batchUpdate({
                spreadsheetId:
                    env.GOOGLE_SPREADSHEET_ID,

                requestBody: {
                    requests
                }
            }),
        "batch update"
    );
}

// ======================================================
// SYNC ALL TABLES
// ======================================================

async function syncAllTables() {

    console.log("");
    console.log(
        "======================================"
    );

    console.log(
        "CARSEY → GOOGLE SHEETS SYNC STARTED"
    );

    console.log(
        "======================================"
    );

    try {

        const sheets =
            await getSheetsClient();

        // ------------------------------------------------
        // CREATE TABLE TABS
        // ------------------------------------------------

        await createMissingSheets(
            sheets
        );

        // ------------------------------------------------
        // PREPARE EACH TABLE
        // ------------------------------------------------

        const tableDataList = [];

        for (
            const tableName
            of TABLES
        ) {

            try {

                const tableData =
                    await buildTableSyncData(
                        tableName
                    );

                tableDataList.push(
                    tableData
                );

            } catch (error) {

                console.error(
                    `❌ Failed to prepare ${tableName}`
                );

                console.error(
                    error.message ||
                    error
                );
            }
        }

        // ------------------------------------------------
        // BATCH WRITE ALL TABLES
        // ------------------------------------------------

        try {

            await batchSyncTableData(
                sheets,
                tableDataList
            );

        } catch (error) {

            console.error(
                "❌ Failed to batch sync Google Sheets data"
            );

            console.error(
                error.message ||
                error
            );
        }

        // ------------------------------------------------
        // FORMAT
        // ------------------------------------------------

        try {

            await formatSheets(
                sheets
            );

        } catch (error) {

            console.error(
                "Google Sheet formatting failed:"
            );

            console.error(
                error.message ||
                error
            );
        }

        console.log("");

        console.log(
            "======================================"
        );

        console.log(
            "CARSEY → GOOGLE SHEETS SYNC COMPLETED"
        );

        console.log(
            "======================================"
        );

        return {
            success: true
        };

    } catch (error) {

        console.error("");

        console.error(
            "======================================"
        );

        console.error(
            "GOOGLE SHEETS SYNC FAILED"
        );

        console.error(
            "======================================"
        );

        console.error(
            "Error message:",
            error?.message || "No error message"
        );

        console.error(
            "Error code:",
            error?.code || "No error code"
        );

        console.error(
            "Error status:",
            error?.response?.status || "No HTTP status"
        );

        console.error(
            "Error details:",
            error?.response?.data || "No response details"
        );

        console.error(
            "Full error:",
            error
        );

        console.error(
            "Google Spreadsheet ID configured:",
            Boolean(env.GOOGLE_SPREADSHEET_ID)
        );

        console.error(
            "Google service account configured:",
            Boolean(env.GOOGLE_SERVICE_ACCOUNT_EMAIL)
        );

        console.error(
            "Google private key configured:",
            Boolean(env.GOOGLE_PRIVATE_KEY)
        );

        return {
            success: false,
            error:
                error?.message ||
                String(error)
        };
    }
}

// ======================================================
// SCHEDULE AUTOMATIC SYNC
// ======================================================

function scheduleGoogleSheetsSync(
    reason = "Database change"
) {

    console.log(
        `Google Sheets sync scheduled: ${reason}`
    );

    // A sync is already running.
    // Queue another sync after it finishes.
    if (syncRunning) {

        syncQueued = true;

        return;
    }

    // Reset existing timer.
    if (syncTimer) {
        clearTimeout(syncTimer);
    }

    // Keep at least one minute between complete automatic
    // full-table syncs. This prevents a burst of DB changes
    // from repeatedly consuming the Sheets write quota.
    const elapsed =
        Date.now() -
        lastSyncCompletedAt;

    const cooldown =
        lastSyncCompletedAt > 0
            ? Math.max(
                MIN_SYNC_INTERVAL - elapsed,
                0
            )
            : 0;

    const delay =
        Math.max(
            SYNC_DELAY,
            cooldown
        );

    syncTimer = setTimeout(
        async () => {

            syncTimer = null;

            if (syncRunning) {

                syncQueued = true;

                return;
            }

            syncRunning = true;

            try {

                await syncAllTables();

            } catch (error) {

                console.error(
                    "Automatic Google Sheets sync failed:"
                );

                console.error(
                    error.message ||
                    error
                );

            } finally {

                syncRunning = false;

                lastSyncCompletedAt =
                    Date.now();

                // If another DB operation happened
                // while syncing, schedule only after the
                // automatic cooldown instead of immediately.
                if (syncQueued) {

                    syncQueued = false;

                    scheduleGoogleSheetsSync(
                        "Queued database change"
                    );
                }
            }

        },
        delay
    );
}


// ======================================================
// IMMEDIATE SYNC
// ======================================================

async function syncGoogleSheetsNow(
    reason = "Manual sync"
) {

    console.log(
        `Immediate Google Sheets sync requested: ${reason}`
    );

    if (syncTimer) {

        clearTimeout(
            syncTimer
        );

        syncTimer = null;
    }

    if (syncRunning) {

        syncQueued = true;

        return {
            success: true,
            queued: true
        };
    }

    syncRunning = true;

    try {

        return await syncAllTables();

    } finally {

        syncRunning = false;
        lastSyncCompletedAt = Date.now();

        if (syncQueued) {

            syncQueued = false;

            scheduleGoogleSheetsSync(
                "Queued database change"
            );
        }
    }
}

// ======================================================
// GET SYNC STATUS
// ======================================================

function getGoogleSheetsSyncStatus() {

    return {
        running: syncRunning,
        queued: syncQueued,
        scheduled: Boolean(syncTimer),
        lastSyncCompletedAt,
        minSyncInterval: MIN_SYNC_INTERVAL
    };
}

// ======================================================
// EXPORT
// ======================================================

module.exports = {

    syncAllTables,

    syncTable,

    buildTableSyncData,

    batchSyncTableData,

    getTableData,

    getTableColumns,

    scheduleGoogleSheetsSync,

    syncGoogleSheetsNow,

    getGoogleSheetsSyncStatus
};