const db = require("../config/db");

// ======================================================
// NORMALIZE INSPECTION SCORE
// ======================================================
// 43 -> 4.3, 92 -> 9.2, 95 -> 9.5.
// Scores already between 0 and 10 remain unchanged.
const normalizeOverallScore = (value) => {

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return null;
    }

    const normalized =
        number > 10 && number <= 100
            ? number / 10
            : number;

    return Number(
        normalized.toFixed(1)
    );
};

// ======================================================
// NORMALIZED SCORE SQL
// ======================================================
// This also makes old rows (43, 92, 95...) display correctly
// until the one-time database migration is executed.
const normalizedScoreSql = (tableAlias = "") => {
    const prefix = tableAlias
        ? `${tableAlias}.`
        : "";

    return `
        CASE
            WHEN ${prefix}overall_score > 10
                THEN ROUND(${prefix}overall_score / 10, 1)
            ELSE ROUND(${prefix}overall_score, 1)
        END AS overall_score
    `;
};

// ======================================================
// CREATE INSPECTION REPORT
// ======================================================

const createInspectionReport = (
    reportData
) => {

    return new Promise(
        (resolve, reject) => {

            const sql = `
                INSERT INTO inspection_reports
                (
                    car_id,
                    overall_score,
                    engine_remark,
                    overall_remark,
                    pdf_path,
                    publish_status
                )
                VALUES (?, ?, ?, ?, ?, ?)
            `;


            const values = [

                reportData.carId,

                normalizeOverallScore(
                    reportData.overallScore
                ),

                reportData.engineRemark,

                reportData.overallRemark,

                reportData.pdfPath ||
                    null,

                reportData.publishStatus ||
                    "No"

            ];


            db.query(
                sql,
                values,

                (err, result) => {

                    if (err) {
                        return reject(err);
                    }


                    resolve({

                        reportId:
                            result.insertId

                    });

                }
            );

        }
    );

};


// ======================================================
// GET APPROVED UNLOCK REQUEST
// ======================================================

const getApprovedUnlockRequest = (
    requestId,
    carId
) => {

    return new Promise(
        (resolve, reject) => {

            const sql = `
                SELECT
                    rur.request_id,
                    rur.car_id,
                    c.booking_id,
                    rur.name,
                    rur.mobile,
                    rur.email,
                    rur.status,
                    rur.created_at
                FROM report_unlock_requests rur
                LEFT JOIN cars c
                    ON c.car_id = rur.car_id
                WHERE rur.request_id = ?
                AND rur.car_id = ?
                AND rur.status = 'Approved'
                LIMIT 1
            `;


            db.query(
                sql,

                [
                    requestId,
                    carId
                ],

                (
                    err,
                    result
                ) => {

                    if (err) {
                        return reject(err);
                    }


                    resolve(
                        result[0] ||
                        null
                    );

                }
            );

        }
    );

};


// ======================================================
// GET PUBLISHED REPORT BY CAR
// ======================================================

const getInspectionReportByCarId = (
    carId
) => {

    return new Promise(
        (resolve, reject) => {

            const sql = `
                SELECT
                    ir.report_id,
                    ir.car_id,
                    c.booking_id,
                    ${normalizedScoreSql("ir")},
                    ir.engine_remark,
                    ir.overall_remark,
                    ir.pdf_path,
                    ir.publish_status,
                    ir.created_at
                FROM inspection_reports ir
                LEFT JOIN cars c
                    ON c.car_id = ir.car_id
                WHERE ir.car_id = ?
                AND ir.publish_status = 'Yes'
                ORDER BY ir.report_id DESC
                LIMIT 1
            `;


            db.query(
                sql,

                [carId],

                (
                    err,
                    result
                ) => {

                    if (err) {
                        return reject(err);
                    }


                    resolve(
                        result[0] ||
                        null
                    );

                }
            );

        }
    );

};


// ======================================================
// GET ALL REPORTS
// ======================================================

const getAllInspectionReports = () => {

    return new Promise(
        (resolve, reject) => {

            const sql = `
                SELECT
                    ir.report_id,
                    ir.car_id,
                    c.booking_id,
                    ${normalizedScoreSql("ir")},
                    ir.engine_remark,
                    ir.overall_remark,
                    ir.pdf_path,
                    ir.publish_status,
                    ir.created_at
                FROM inspection_reports ir
                LEFT JOIN cars c
                    ON c.car_id = ir.car_id
                ORDER BY ir.report_id DESC
            `;


            db.query(
                sql,

                (
                    err,
                    result
                ) => {

                    if (err) {
                        return reject(err);
                    }


                    resolve(result);

                }
            );

        }
    );

};


// ======================================================
// GET REPORT BY ID
// ======================================================

const getInspectionReportById = (
    reportId
) => {

    return new Promise(
        (resolve, reject) => {

            const sql = `
                SELECT
                    ir.report_id,
                    ir.car_id,
                    c.booking_id,
                    ${normalizedScoreSql("ir")},
                    ir.engine_remark,
                    ir.overall_remark,
                    ir.pdf_path,
                    ir.publish_status,
                    ir.created_at
                FROM inspection_reports ir
                LEFT JOIN cars c
                    ON c.car_id = ir.car_id
                WHERE ir.report_id = ?
                LIMIT 1
            `;


            db.query(
                sql,

                [reportId],

                (
                    err,
                    result
                ) => {

                    if (err) {
                        return reject(err);
                    }


                    resolve(
                        result[0] ||
                        null
                    );

                }
            );

        }
    );

};


// ======================================================
// GET CHECKLIST
// ======================================================

const getInspectionChecklist = (
    reportId
) => {

    return new Promise(
        (resolve, reject) => {

            const sql = `
                SELECT
                    checklist_id,
                    report_id,
                    category,
                    status,
                    remark
                FROM inspection_checklist
                WHERE report_id = ?
                ORDER BY checklist_id ASC
            `;


            db.query(
                sql,

                [reportId],

                (
                    err,
                    result
                ) => {

                    if (err) {
                        return reject(err);
                    }


                    resolve(
                        result || []
                    );

                }
            );

        }
    );

};


// ======================================================
// GET COMPLETE INSPECTION REPORT
// ======================================================

const getCompleteInspectionReport = (
    reportId
) => {

    return new Promise(
        (resolve, reject) => {

            getInspectionReportById(
                reportId
            )
                .then(async report => {

                    if (!report) {

                        return resolve(
                            null
                        );

                    }


                    const checklist =
                        await getInspectionChecklist(
                            reportId
                        );


                    resolve({

                        report,

                        checklist

                    });

                })
                .catch(reject);

        }
    );

};


// ======================================================
// GET REPORT DELIVERY DATA
// USED FOR EMAIL
// ======================================================

const getReportDeliveryData = (
    reportId
) => {

    return new Promise(
        (resolve, reject) => {

            const sql = `
                SELECT
                    ir.report_id,
                    ir.car_id,
                    c.booking_id,
                    CASE
                        WHEN ir.overall_score > 10
                            THEN ROUND(ir.overall_score / 10, 1)
                        ELSE ROUND(ir.overall_score, 1)
                    END AS overall_score,
                    ir.engine_remark,
                    ir.overall_remark,
                    ir.pdf_path,
                    ir.publish_status,
                    ir.created_at,

                    o.owner_name,
                    o.email AS owner_email,
                    o.mobile AS owner_mobile

                FROM inspection_reports ir

                LEFT JOIN cars c
                    ON c.car_id = ir.car_id

                LEFT JOIN owners o
                    ON o.owner_id = c.owner_id

                WHERE ir.report_id = ?

                LIMIT 1
            `;


            db.query(
                sql,

                [reportId],

                (
                    err,
                    result
                ) => {

                    if (err) {
                        return reject(err);
                    }


                    resolve(
                        result[0] ||
                        null
                    );

                }
            );

        }
    );

};


// ======================================================
// UPDATE REPORT
// ======================================================

const updateInspectionReport = (
    reportId,
    reportData
) => {

    return new Promise(
        (resolve, reject) => {

            const sql = `
                UPDATE inspection_reports
                SET
                    overall_score = ?,
                    engine_remark = ?,
                    overall_remark = ?,
                    publish_status = ?
                WHERE report_id = ?
            `;


            db.query(
                sql,

                [
                    normalizeOverallScore(
                        reportData.overallScore
                    ),
                    reportData.engineRemark,
                    reportData.overallRemark,
                    reportData.publishStatus,
                    reportId
                ],

                (
                    err,
                    result
                ) => {

                    if (err) {
                        return reject(err);
                    }


                    resolve(result);

                }
            );

        }
    );

};


// ======================================================
// UPDATE PDF PATH
// ======================================================

const updateInspectionReportPdfPath = (
    reportId,
    pdfPath
) => {

    return new Promise(
        (resolve, reject) => {

            const sql = `
                UPDATE inspection_reports
                SET pdf_path = ?
                WHERE report_id = ?
            `;


            db.query(
                sql,

                [
                    pdfPath,
                    reportId
                ],

                (
                    err,
                    result
                ) => {

                    if (err) {
                        return reject(err);
                    }


                    resolve(result);

                }
            );

        }
    );

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    createInspectionReport,

    getApprovedUnlockRequest,

    getInspectionReportByCarId,

    getAllInspectionReports,

    getInspectionReportById,

    getInspectionChecklist,

    getCompleteInspectionReport,

    getReportDeliveryData,

    updateInspectionReport,

    updateInspectionReportPdfPath

};