// ===== ORIGINAL WORKING VERSION (PRESERVED ONCE; DO NOT EXECUTE) =====\n// // ======================================================
// // CARSEY.IN - GOOGLE SHEETS SERVICE
// // ======================================================
//\n// const { google } = require("googleapis");
//\n// const db = require("../config/db");
// const env = require("../config/env");
//\n// // ======================================================
// // GOOGLE SHEETS CONFIGURATION
// // ======================================================
//\n// const SCOPES = [
//     "https://www.googleapis.com/auth/spreadsheets"
// ];
//\n// // ======================================================
// // DATABASE TABLES
// // ======================================================
//\n// const TABLES = [
//     "admins",
//     "car_images",
//     "car_price_requests",
//     "cars",
//     "exchange_requests",
//     "finance_requests",
//     "google_sheets_sync_state",
//     "inspection_bookings",
//     "inspection_checklist",
//     "inspection_reports",
//     "inspection_requests",
//     "loan_requests",
//     "owners",
//     "report_unlock_requests",
//     "sell_car_requests",
//     "share_you_exp",
//     "test_drive_requests"
// ];
// // ======================================================
// // SYNC CONFIGURATION
// // ======================================================
//\n// let syncTimer = null;
// let syncRunning = false;
// let syncQueued = false;
// let lastSyncCompletedAt = 0;
//\n// // Do not start another full 14-table sync immediately after one finishes.
// // This protects the service-account user quota when many DB writes happen together.
// const MIN_SYNC_INTERVAL = 60000;
//\n// const SYNC_DELAY = 3000;
//\n// // Google Sheets has per-minute write quotas.
// // Keep retries bounded and use exponential backoff for 429/5xx errors.
// const GOOGLE_RETRY_LIMIT = 5;
// const GOOGLE_MAX_BACKOFF = 32000;
//\n// function sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }
//\n// function isRetryableGoogleError(error) {
//\n//     const status =
//         Number(
//             error?.response?.status ||
//             error?.code ||
//             0
//         );
//\n//     const message = String(
//         error?.message ||
//         error ||
//         ""
//     ).toLowerCase();
//\n//     return (
//         status === 429 ||
//         status === 500 ||
//         status === 502 ||
//         status === 503 ||
//         status === 504 ||
//         message.includes("quota exceeded") ||
//         message.includes("too many requests") ||
//         message.includes("rate limit") ||
//         message.includes("resource exhausted")
//     );
// }
//\n// async function executeGoogleRequest(
//     operation,
//     label = "Google Sheets request"
// ) {
//\n//     let lastError = null;
//\n//     for (
//         let attempt = 0;
//         attempt <= GOOGLE_RETRY_LIMIT;
//         attempt++
//     ) {
//\n//         try {
//             return await operation();
//         } catch (error) {
//\n//             lastError = error;
//\n//             if (
//                 !isRetryableGoogleError(error) ||
//                 attempt >= GOOGLE_RETRY_LIMIT
//             ) {
//                 throw error;
//             }
//\n//             const baseDelay = Math.min(
//                 1000 * Math.pow(2, attempt),
//                 GOOGLE_MAX_BACKOFF
//             );
//\n//             const jitter =
//                 Math.floor(Math.random() * 1000);
//\n//             const delay = Math.min(
//                 baseDelay + jitter,
//                 GOOGLE_MAX_BACKOFF
//             );
//\n//             console.warn(
//                 `Google Sheets ${label} hit a temporary quota/rate limit. ` +
//                 `Retry ${attempt + 1}/${GOOGLE_RETRY_LIMIT} in ${delay}ms.`
//             );
//\n//             await sleep(delay);
//         }
//     }
//\n//     throw lastError;
// }
//\n// // ======================================================
// // GOOGLE AUTHENTICATION
// // ======================================================
//\n// function getGoogleAuth() {
//\n//     if (
//         !env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
//         !env.GOOGLE_PRIVATE_KEY
//     ) {
//         throw new Error(
//             "Google Sheets credentials are not configured."
//         );
//     }
//\n//     return new google.auth.GoogleAuth({
//         credentials: {
//             client_email:
//                 env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
//\n//             private_key:
//                 env.GOOGLE_PRIVATE_KEY
//         },
//\n//         scopes: SCOPES
//     });
// }
//\n// // ======================================================
// // GET GOOGLE SHEETS CLIENT
// // ======================================================
//\n// async function getSheetsClient() {
//\n//     if (!env.GOOGLE_SPREADSHEET_ID) {
//         throw new Error(
//             "GOOGLE_SPREADSHEET_ID is not configured."
//         );
//     }
//\n//     const auth = getGoogleAuth();
//\n//     const authClient =
//         await auth.getClient();
//\n//     return google.sheets({
//         version: "v4",
//         auth: authClient
//     });
// }
//\n// // ======================================================
// // SAFE SHEET NAME
// // ======================================================
//\n// function getSafeSheetName(tableName) {
//\n//     return tableName
//         .replace(/[\\\/\?\*\[\]:]/g, "_")
//         .substring(0, 100);
// }
//\n// // ======================================================
// // FILE COLUMN DETECTION
// // ======================================================
//\n// const FILE_COLUMN_NAMES = new Set([
//     "image_path",
//     "image_url",
//     "pdf_path",
//     "pdf_url",
//     "video_path",
//     "video_url",
//     "front_image",
//     "back_image",
//     "left_image",
//     "right_image",
//     "vehicle_image",
//     "document_image",
//     "document_path",
//     "file_path",
//     "file_url",
//     "photo_path",
//     "photo_url",
//     "test_drive_video",
//     "test_drive_video_path"
// ]);
//\n// // ======================================================
// // GET BACKEND PUBLIC URL
// // ======================================================
//\n// function getBackendPublicUrl() {
//\n//     const baseUrl =
//         process.env.BACKEND_PUBLIC_URL ||
//         process.env.API_BASE_URL ||
//         process.env.BACKEND_URL ||
//         "";
//\n//     return String(baseUrl)
//         .trim()
//         .replace(/\/+$/, "");
// }
//\n// // ======================================================
// // CONVERT FILE PATH TO PUBLIC URL
// // ======================================================
//\n// function convertFilePathToUrl(value) {
//\n//     if (
//         value === null ||
//         value === undefined ||
//         value === ""
//     ) {
//         return "";
//     }
//\n//     const stringValue = String(value).trim();
//\n//     if (!stringValue) {
//         return "";
//     }
//\n//     // Already a complete URL
//     if (
//         stringValue.startsWith("http://") ||
//         stringValue.startsWith("https://")
//     ) {
//         return stringValue;
//     }
//\n//     const backendUrl =
//         getBackendPublicUrl();
//\n//     if (!backendUrl) {
//         return stringValue;
//     }
//\n//     let cleanPath =
//         stringValue.replace(/\\/g, "/");
//\n//     // Remove leading ./ if present
//     cleanPath =
//         cleanPath.replace(/^\.\/+/, "");
//\n//     // Convert absolute/local upload paths
//     const uploadsIndex =
//         cleanPath.indexOf("uploads/");
//\n//     if (uploadsIndex >= 0) {
//         cleanPath =
//             cleanPath.substring(uploadsIndex);
//     }
//\n//     // Remove leading slash
//     cleanPath =
//         cleanPath.replace(/^\/+/, "");
//\n//     return `${backendUrl}/${cleanPath}`;
// }
//\n// // ======================================================
// // FORMAT DATABASE VALUE
// // ======================================================
//\n// function formatCellValue(
//     value,
//     columnName = ""
// ) {
//\n//     if (
//         value === null ||
//         value === undefined
//     ) {
//         return "";
//     }
//\n//     // Date
//     if (value instanceof Date) {
//         return value.toISOString();
//     }
//\n//     // Buffer
//     if (
//         typeof value === "object" &&
//         Buffer.isBuffer(value)
//     ) {
//         return value.toString("utf8");
//     }
//\n//     // Boolean
//     if (typeof value === "boolean") {
//         return value ? "TRUE" : "FALSE";
//     }
//\n//     // File / media path
//     if (
//         FILE_COLUMN_NAMES.has(
//             String(columnName).toLowerCase()
//         )
//     ) {
//         return convertFilePathToUrl(value);
//     }
//\n//     // Object / JSON
//     if (typeof value === "object") {
//\n//         try {
//             return JSON.stringify(value);
//         } catch (error) {
//             return String(value);
//         }
//     }
//\n//     return String(value);
// }
//\n// // ======================================================
// // GET DATABASE TABLE DATA
// // ======================================================
//\n// async function getTableData(tableName) {
//\n//     const [rows] =
//         await db
//             .promise()
//             .query(
//                 `SELECT * FROM \`${tableName}\``
//             );
//\n//     return rows;
// }
//\n// // ======================================================
// // GET DATABASE TABLE COLUMNS
// // ======================================================
//\n// async function getTableColumns(tableName) {
//\n//     const [columns] =
//         await db
//             .promise()
//             .query(
//                 `
//                 SELECT
//                     COLUMN_NAME
//                 FROM
//                     INFORMATION_SCHEMA.COLUMNS
//                 WHERE
//                     TABLE_SCHEMA = DATABASE()
//                     AND TABLE_NAME = ?
//                 ORDER BY
//                     ORDINAL_POSITION
//                 `,
//                 [tableName]
//             );
//\n//     return columns.map(
//         column => column.COLUMN_NAME
//     );
// }
//\n// // ======================================================
// // GET EXISTING GOOGLE SHEETS
// // ======================================================
//\n// async function getSpreadsheetSheets(
//     sheets
// ) {
//\n//     const response =
//         await sheets.spreadsheets.get({
//             spreadsheetId:
//                 env.GOOGLE_SPREADSHEET_ID,
//\n//             fields:
//                 "sheets.properties"
//         });
//\n//     return (
//         response.data.sheets || []
//     );
// }
//\n// // ======================================================
// // CREATE MISSING SHEET TABS
// // ======================================================
//\n// async function createMissingSheets(
//     sheets
// ) {
//\n//     const existingSheets =
//         await getSpreadsheetSheets(
//             sheets
//         );
//\n//     const existingNames =
//         new Set(
//             existingSheets.map(
//                 sheet =>
//                     sheet.properties.title
//             )
//         );
//\n//     const requests = [];
//\n//     for (const tableName of TABLES) {
//\n//         const sheetName =
//             getSafeSheetName(
//                 tableName
//             );
//\n//         if (
//             !existingNames.has(
//                 sheetName
//             )
//         ) {
//\n//             requests.push({
//                 addSheet: {
//                     properties: {
//                         title: sheetName
//                     }
//                 }
//             });
//         }
//     }
//\n//     if (requests.length === 0) {
//         return;
//     }
//\n//     await executeGoogleRequest(
//         () =>
//             sheets.spreadsheets.batchUpdate({
//                 spreadsheetId:
//                     env.GOOGLE_SPREADSHEET_ID,
//\n//                 requestBody: {
//                     requests
//                 }
//             }),
//         "batch update"
//     );
//\n//     console.log(
//         `Created ${requests.length} Google Sheet tab(s).`
//     );
// }
//\n// // ======================================================
// // BUILD ONE TABLE SYNC DATA
// // ======================================================
//\n// async function buildTableSyncData(
//     tableName
// ) {
//\n//     const sheetName =
//         getSafeSheetName(
//             tableName
//         );
//\n//     const columns =
//         await getTableColumns(
//             tableName
//         );
//\n//     const rows =
//         await getTableData(
//             tableName
//         );
//\n//     const values = [];
//\n//     // --------------------------------------------------
//     // HEADER
//     // --------------------------------------------------
//\n//     values.push(columns);
//\n//     // --------------------------------------------------
//     // ROWS
//     // --------------------------------------------------
//\n//     for (const row of rows) {
//\n//         const rowValues =
//             columns.map(
//                 column =>
//                     formatCellValue(
//                         row[column],
//                         column
//                     )
//             );
//\n//         values.push(rowValues);
//     }
//\n//     return {
//         tableName,
//         sheetName,
//         columns,
//         rows,
//         values
//     };
// }
//\n//\n// // ======================================================
// // SYNC ONE TABLE
// // ======================================================
//\n// async function syncTable(
//     sheets,
//     tableName
// ) {
//\n//     console.log(
//         `Syncing table: ${tableName}`
//     );
//\n//     const tableData =
//         await buildTableSyncData(
//             tableName
//         );
//\n//     // --------------------------------------------------
//     // CLEAR OLD DATA
//     // --------------------------------------------------
//\n//     await executeGoogleRequest(
//         () =>
//             sheets.spreadsheets.values.clear({
//                 spreadsheetId:
//                     env.GOOGLE_SPREADSHEET_ID,
//\n//                 range:
//                     `${tableData.sheetName}!A:ZZ`
//             }),
//         `${tableName} clear`
//     );
//\n//     // --------------------------------------------------
//     // WRITE NEW DATA
//     // --------------------------------------------------
//\n//     if (tableData.values.length > 0) {
//\n//         await executeGoogleRequest(
//             () =>
//                 sheets.spreadsheets.values.update({
//\n//                     spreadsheetId:
//                         env.GOOGLE_SPREADSHEET_ID,
//\n//                     range:
//                         `${tableData.sheetName}!A1`,
//\n//                     valueInputOption:
//                         "RAW",
//\n//                     requestBody: {
//                         values:
//                             tableData.values
//                     }
//                 }),
//             `${tableName} update`
//         );
//     }
//\n//     console.log(
//         `✓ ${tableName}: ${tableData.rows.length} row(s) synced.`
//     );
//\n//     return tableData;
// }
//\n//\n// // ======================================================
// // BATCH SYNC TABLE DATA
// // ======================================================
//\n// async function batchSyncTableData(
//     sheets,
//     tableDataList
// ) {
//\n//     if (
//         !Array.isArray(tableDataList) ||
//         tableDataList.length === 0
//     ) {
//         return;
//     }
//\n//     // --------------------------------------------------
//     // CLEAR ALL TABLES IN ONE API REQUEST
//     // --------------------------------------------------
//\n//     const ranges =
//         tableDataList.map(
//             tableData =>
//                 `${tableData.sheetName}!A:ZZ`
//         );
//\n//     await executeGoogleRequest(
//         () =>
//             sheets.spreadsheets.values.batchClear({
//                 spreadsheetId:
//                     env.GOOGLE_SPREADSHEET_ID,
//\n//                 requestBody: {
//                     ranges
//                 }
//             }),
//         "batch clear"
//     );
//\n//     // --------------------------------------------------
//     // WRITE ALL TABLES IN ONE API REQUEST
//     // --------------------------------------------------
//\n//     const data =
//         tableDataList
//             .filter(
//                 tableData =>
//                     tableData.values.length > 0
//             )
//             .map(
//                 tableData => ({
//                     range:
//                         `${tableData.sheetName}!A1`,
//\n//                     values:
//                         tableData.values
//                 })
//             );
//\n//     if (data.length === 0) {
//         return;
//     }
//\n//     await executeGoogleRequest(
//         () =>
//             sheets.spreadsheets.values.batchUpdate({
//                 spreadsheetId:
//                     env.GOOGLE_SPREADSHEET_ID,
//\n//                 requestBody: {
//                     valueInputOption:
//                         "RAW",
//\n//                     data
//                 }
//             }),
//         "batch data update"
//     );
//\n//     for (const tableData of tableDataList) {
//\n//         console.log(
//             `✓ ${tableData.tableName}: ` +
//             `${tableData.rows.length} row(s) synced.`
//         );
//     }
// }
//\n//\n// // ======================================================
// // FORMAT SHEETS
// // ======================================================
//\n// async function formatSheets(
//     sheets
// ) {
//\n//     const spreadsheet =
//         await sheets.spreadsheets.get({
//\n//             spreadsheetId:
//                 env.GOOGLE_SPREADSHEET_ID,
//\n//             fields:
//                 "sheets.properties"
//         });
//\n//     const requests = [];
//\n//     for (
//         const sheet
//         of spreadsheet.data.sheets || []
//     ) {
//\n//         const properties =
//             sheet.properties;
//\n//         const sheetName =
//             properties.title;
//\n//         if (
//             !TABLES.includes(
//                 sheetName
//             )
//         ) {
//             continue;
//         }
//\n//         // ------------------------------------------------
//         // FREEZE HEADER
//         // ------------------------------------------------
//\n//         requests.push({
//             updateSheetProperties: {
//\n//                 properties: {
//\n//                     sheetId:
//                         properties.sheetId,
//\n//                     gridProperties: {
//                         frozenRowCount: 1
//                     }
//                 },
//\n//                 fields:
//                     "gridProperties.frozenRowCount"
//             }
//         });
//\n//         // ------------------------------------------------
//         // HEADER FORMAT
//         // ------------------------------------------------
//\n//         requests.push({
//             repeatCell: {
//\n//                 range: {
//\n//                     sheetId:
//                         properties.sheetId,
//\n//                     startRowIndex: 0,
//\n//                     endRowIndex: 1
//                 },
//\n//                 cell: {
//\n//                     userEnteredFormat: {
//\n//                         textFormat: {
//                             bold: true
//                         }
//                     }
//                 },
//\n//                 fields:
//                     "userEnteredFormat.textFormat.bold"
//             }
//         });
//\n//         // ------------------------------------------------
//         // AUTO RESIZE COLUMNS
//         // ------------------------------------------------
//\n//         requests.push({
//             autoResizeDimensions: {
//\n//                 dimensions: {
//\n//                     sheetId:
//                         properties.sheetId,
//\n//                     dimension:
//                         "COLUMNS",
//\n//                     startIndex: 0,
//\n//                     endIndex: 26
//                 }
//             }
//         });
//     }
//\n//     if (requests.length === 0) {
//         return;
//     }
//\n//     await executeGoogleRequest(
//         () =>
//             sheets.spreadsheets.batchUpdate({
//                 spreadsheetId:
//                     env.GOOGLE_SPREADSHEET_ID,
//\n//                 requestBody: {
//                     requests
//                 }
//             }),
//         "batch update"
//     );
// }
//\n// // ======================================================
// // SYNC ALL TABLES
// // ======================================================
//\n// async function syncAllTables() {
//\n//     console.log("");
//     console.log(
//         "======================================"
//     );
//\n//     console.log(
//         "CARSEY → GOOGLE SHEETS SYNC STARTED"
//     );
//\n//     console.log(
//         "======================================"
//     );
//\n//     try {
//\n//         const sheets =
//             await getSheetsClient();
//\n//         // ------------------------------------------------
//         // CREATE TABLE TABS
//         // ------------------------------------------------
//\n//         await createMissingSheets(
//             sheets
//         );
//\n//         // ------------------------------------------------
//         // PREPARE EACH TABLE
//         // ------------------------------------------------
//\n//         const tableDataList = [];
//\n//         for (
//             const tableName
//             of TABLES
//         ) {
//\n//             try {
//\n//                 const tableData =
//                     await buildTableSyncData(
//                         tableName
//                     );
//\n//                 tableDataList.push(
//                     tableData
//                 );
//\n//             } catch (error) {
//\n//                 console.error(
//                     `❌ Failed to prepare ${tableName}`
//                 );
//\n//                 console.error(
//                     error.message ||
//                     error
//                 );
//             }
//         }
//\n//         // ------------------------------------------------
//         // BATCH WRITE ALL TABLES
//         // ------------------------------------------------
//\n//         try {
//\n//             await batchSyncTableData(
//                 sheets,
//                 tableDataList
//             );
//\n//         } catch (error) {
//\n//             console.error(
//                 "❌ Failed to batch sync Google Sheets data"
//             );
//\n//             console.error(
//                 error.message ||
//                 error
//             );
//         }
//\n//         // ------------------------------------------------
//         // FORMAT
//         // ------------------------------------------------
//\n//         try {
//\n//             await formatSheets(
//                 sheets
//             );
//\n//         } catch (error) {
//\n//             console.error(
//                 "Google Sheet formatting failed:"
//             );
//\n//             console.error(
//                 error.message ||
//                 error
//             );
//         }
//\n//         console.log("");
//\n//         console.log(
//             "======================================"
//         );
//\n//         console.log(
//             "CARSEY → GOOGLE SHEETS SYNC COMPLETED"
//         );
//\n//         console.log(
//             "======================================"
//         );
//\n//         return {
//             success: true
//         };
//\n//     } catch (error) {
//\n//         console.error("");
//\n//         console.error(
//             "======================================"
//         );
//\n//         console.error(
//             "GOOGLE SHEETS SYNC FAILED"
//         );
//\n//         console.error(
//             "======================================"
//         );
//\n//         console.error(
//             "Error message:",
//             error?.message || "No error message"
//         );
//\n//         console.error(
//             "Error code:",
//             error?.code || "No error code"
//         );
//\n//         console.error(
//             "Error status:",
//             error?.response?.status || "No HTTP status"
//         );
//\n//         console.error(
//             "Error details:",
//             error?.response?.data || "No response details"
//         );
//\n//         console.error(
//             "Full error:",
//             error
//         );
//\n//         console.error(
//             "Google Spreadsheet ID configured:",
//             Boolean(env.GOOGLE_SPREADSHEET_ID)
//         );
//\n//         console.error(
//             "Google service account configured:",
//             Boolean(env.GOOGLE_SERVICE_ACCOUNT_EMAIL)
//         );
//\n//         console.error(
//             "Google private key configured:",
//             Boolean(env.GOOGLE_PRIVATE_KEY)
//         );
//\n//         return {
//             success: false,
//             error:
//                 error?.message ||
//                 String(error)
//         };
//     }
// }
//\n// // ======================================================
// // SCHEDULE AUTOMATIC SYNC
// // ======================================================
//\n// function scheduleGoogleSheetsSync(
//     reason = "Database change"
// ) {
//\n//     console.log(
//         `Google Sheets sync scheduled: ${reason}`
//     );
//\n//     // A sync is already running.
//     // Queue another sync after it finishes.
//     if (syncRunning) {
//\n//         syncQueued = true;
//\n//         return;
//     }
//\n//     // Reset existing timer.
//     if (syncTimer) {
//         clearTimeout(syncTimer);
//     }
//\n//     // Keep at least one minute between complete automatic
//     // full-table syncs. This prevents a burst of DB changes
//     // from repeatedly consuming the Sheets write quota.
//     const elapsed =
//         Date.now() -
//         lastSyncCompletedAt;
//\n//     const cooldown =
//         lastSyncCompletedAt > 0
//             ? Math.max(
//                 MIN_SYNC_INTERVAL - elapsed,
//                 0
//             )
//             : 0;
//\n//     const delay =
//         Math.max(
//             SYNC_DELAY,
//             cooldown
//         );
//\n//     syncTimer = setTimeout(
//         async () => {
//\n//             syncTimer = null;
//\n//             if (syncRunning) {
//\n//                 syncQueued = true;
//\n//                 return;
//             }
//\n//             syncRunning = true;
//\n//             try {
//\n//                 await syncAllTables();
//\n//             } catch (error) {
//\n//                 console.error(
//                     "Automatic Google Sheets sync failed:"
//                 );
//\n//                 console.error(
//                     error.message ||
//                     error
//                 );
//\n//             } finally {
//\n//                 syncRunning = false;
//\n//                 lastSyncCompletedAt =
//                     Date.now();
//\n//                 // If another DB operation happened
//                 // while syncing, schedule only after the
//                 // automatic cooldown instead of immediately.
//                 if (syncQueued) {
//\n//                     syncQueued = false;
//\n//                     scheduleGoogleSheetsSync(
//                         "Queued database change"
//                     );
//                 }
//             }
//\n//         },
//         delay
//     );
// }
//\n//\n// // ======================================================
// // IMMEDIATE SYNC
// // ======================================================
//\n// async function syncGoogleSheetsNow(
//     reason = "Manual sync"
// ) {
//\n//     console.log(
//         `Immediate Google Sheets sync requested: ${reason}`
//     );
//\n//     if (syncTimer) {
//\n//         clearTimeout(
//             syncTimer
//         );
//\n//         syncTimer = null;
//     }
//\n//     if (syncRunning) {
//\n//         syncQueued = true;
//\n//         return {
//             success: true,
//             queued: true
//         };
//     }
//\n//     syncRunning = true;
//\n//     try {
//\n//         return await syncAllTables();
//\n//     } finally {
//\n//         syncRunning = false;
//         lastSyncCompletedAt = Date.now();
//\n//         if (syncQueued) {
//\n//             syncQueued = false;
//\n//             scheduleGoogleSheetsSync(
//                 "Queued database change"
//             );
//         }
//     }
// }
//\n// // ======================================================
// // GET SYNC STATUS
// // ======================================================
//\n// function getGoogleSheetsSyncStatus() {
//\n//     return {
//         running: syncRunning,
//         queued: syncQueued,
//         scheduled: Boolean(syncTimer),
//         lastSyncCompletedAt,
//         minSyncInterval: MIN_SYNC_INTERVAL
//     };
// }
//\n// // ======================================================
// // EXPORT
// // ======================================================
//\n// module.exports = {
//\n//     syncAllTables,
//\n//     syncTable,
//\n//     buildTableSyncData,
//\n//     batchSyncTableData,
//\n//     getTableData,
//\n//     getTableColumns,
//\n//     scheduleGoogleSheetsSync,
//\n//     syncGoogleSheetsNow,
//\n//     getGoogleSheetsSyncStatus
// };\n// ===== UPDATED ACTIVE VERSION =====\n// ======================================================
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
    "car_price_requests",
    "cars",
    "exchange_requests",
    "finance_requests",
    "google_sheets_sync_state",
    "inspection_bookings",
    "inspection_checklist",
    "inspection_reports",
    "inspection_requests",
    "loan_requests",
    "owners",
    "report_unlock_requests",
    "sell_car_requests",
    "share_you_exp",
    "test_drive_requests"
];

// Additional Google Sheets tabs that are derived from an existing MySQL table.
// These are NOT MySQL tables.
const EXTRA_SHEET_TABS = [
    "pdi_bookings"
];

const SYNC_TARGETS = [
    ...TABLES,
    ...EXTRA_SHEET_TABS
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

    for (const tableName of SYNC_TARGETS) {

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

    // pdi_bookings is a Google Sheets-only tab sourced from inspection_bookings.
    const sourceTableName =
        tableName === "pdi_bookings"
            ? "inspection_bookings"
            : tableName;

    const columns =
        await getTableColumns(
            sourceTableName
        );

    let rows =
        await getTableData(
            sourceTableName
        );

    // Split inspection bookings into two separate Google Sheets tabs.
    // Keep the exact booking_type values used by the database.
    if (sourceTableName === "inspection_bookings") {
        const requiredBookingType =
            tableName === "pdi_bookings"
                ? "PDI"
                : "BOOK_INSPECTION";

        rows = rows.filter(
            row =>
                String(row.booking_type || "").trim().toUpperCase() ===
                requiredBookingType
        );
    }

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
            !SYNC_TARGETS.includes(
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
            of SYNC_TARGETS
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