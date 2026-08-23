const db = require("../config/db");

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

                reportData.overallScore,

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
                    request_id,
                    car_id,
                    name,
                    mobile,
                    email,
                    status,
                    created_at
                FROM report_unlock_requests
                WHERE request_id = ?
                AND car_id = ?
                AND status = 'Approved'
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
                    report_id,
                    car_id,
                    overall_score,
                    engine_remark,
                    overall_remark,
                    pdf_path,
                    publish_status,
                    created_at
                FROM inspection_reports
                WHERE car_id = ?
                AND publish_status = 'Yes'
                ORDER BY report_id DESC
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
                    report_id,
                    car_id,
                    overall_score,
                    engine_remark,
                    overall_remark,
                    pdf_path,
                    publish_status,
                    created_at
                FROM inspection_reports
                ORDER BY report_id DESC
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
                    report_id,
                    car_id,
                    overall_score,
                    engine_remark,
                    overall_remark,
                    pdf_path,
                    publish_status,
                    created_at
                FROM inspection_reports
                WHERE report_id = ?
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
                    ir.overall_score,
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
                    reportData.overallScore,
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