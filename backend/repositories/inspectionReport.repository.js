const db = require("../config/db");

// ======================================================
// SMALL HELPER FUNCTIONS
// ======================================================

const firstValue = (...values) => {
    for (const value of values) {
        if (
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        ) {
            return value;
        }
    }

    return null;
};


const normalizePublishStatus = (value) => {

    if (
        value === true ||
        value === 1 ||
        String(value).toLowerCase() === "yes" ||
        String(value).toLowerCase() === "published"
    ) {
        return "Yes";
    }

    return "No";
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

                firstValue(
                    reportData.carId,
                    reportData.car_id
                ),

                firstValue(
                    reportData.overallScore,
                    reportData.overall_score
                ),

                firstValue(
                    reportData.engineRemark,
                    reportData.engine_remark
                ),

                firstValue(
                    reportData.overallRemark,
                    reportData.overall_remark
                ),

                firstValue(
                    reportData.pdfPath,
                    reportData.pdf_path,
                    null
                ),

                normalizePublishStatus(
                    firstValue(
                        reportData.publishStatus,
                        reportData.publish_status,
                        "No"
                    )
                )

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
// GET PUBLISHED / LATEST REPORT BY CAR
//
// IMPORTANT:
// Existing code was checking only:
//     publish_status = 'Yes'
//
// During PDF generation the latest report can still be
// "No" before publishing. Therefore we now prefer a
// published report, but fall back to the latest report.
//
// This keeps the old function name and behavior compatible
// with existing code while preventing missing report data.
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
                ORDER BY
                    CASE
                        WHEN publish_status = 'Yes' THEN 0
                        ELSE 1
                    END,
                    report_id DESC
                LIMIT 1
            `;


            db.query(
                sql,

                [
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
// GET LATEST INSPECTION REPORT BY CAR
//
// IMPORTANT:
// Use this function when generating the PDF immediately
// after vehicle/inspection data has been saved.
//
// It intentionally does NOT require publish_status = Yes.
// ======================================================

const getLatestInspectionReportByCarId = (
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
                ORDER BY report_id DESC
                LIMIT 1
            `;


            db.query(
                sql,

                [
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


                    resolve(
                        result || []
                    );

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

                [
                    reportId
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
                    car_id,
                    category,
                    status,
                    remark,
                    remarks,
                    note,
                    comment,
                    checklist_data,
                    data,
                    inspection_data,
                    created_at
                FROM inspection_checklist
                WHERE report_id = ?
                ORDER BY checklist_id ASC
            `;


            db.query(
                sql,

                [
                    reportId
                ],

                (
                    err,
                    result
                ) => {

                    if (err) {

                        // --------------------------------------------------
                        // Some databases may not have all optional columns.
                        // Fall back to the original safe structure.
                        // --------------------------------------------------

                        const fallbackSql = `
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


                        return db.query(
                            fallbackSql,
                            [reportId],

                            (
                                fallbackErr,
                                fallbackResult
                            ) => {

                                if (fallbackErr) {
                                    return reject(
                                        fallbackErr
                                    );
                                }


                                resolve(
                                    fallbackResult || []
                                );

                            }
                        );

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
// GET CHECKLIST BY CAR ID
// FALLBACK WHEN REPORT_ID IS NOT AVAILABLE
// ======================================================

const getInspectionChecklistByCarId = (
    carId
) => {

    return new Promise(
        (resolve, reject) => {

            const sql = `
                SELECT
                    checklist_id,
                    report_id,
                    car_id,
                    category,
                    status,
                    remark,
                    remarks,
                    note,
                    comment,
                    checklist_data,
                    data,
                    inspection_data,
                    created_at
                FROM inspection_checklist
                WHERE car_id = ?
                ORDER BY checklist_id ASC
            `;


            db.query(
                sql,

                [
                    carId
                ],

                (
                    err,
                    result
                ) => {

                    if (err) {

                        const fallbackSql = `
                            SELECT
                                checklist_id,
                                report_id,
                                category,
                                status,
                                remark
                            FROM inspection_checklist
                            WHERE car_id = ?
                            ORDER BY checklist_id ASC
                        `;


                        return db.query(
                            fallbackSql,
                            [carId],

                            (
                                fallbackErr,
                                fallbackResult
                            ) => {

                                if (fallbackErr) {
                                    return reject(
                                        fallbackErr
                                    );
                                }


                                resolve(
                                    fallbackResult || []
                                );

                            }
                        );

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
        async (resolve, reject) => {

            try {

                const report =
                    await getInspectionReportById(
                        reportId
                    );


                if (!report) {

                    return resolve(
                        null
                    );

                }


                let checklist = [];


                try {

                    checklist =
                        await getInspectionChecklist(
                            reportId
                        );

                } catch (checklistError) {

                    console.error(
                        "Checklist fetch error:",
                        checklistError.message
                    );

                }


                // --------------------------------------------------
                // If report_id checklist is empty, try car_id.
                // --------------------------------------------------

                if (
                    (!Array.isArray(checklist) ||
                        checklist.length === 0) &&
                    report.car_id
                ) {

                    try {

                        checklist =
                            await getInspectionChecklistByCarId(
                                report.car_id
                            );

                    } catch (carChecklistError) {

                        console.error(
                            "Car checklist fallback error:",
                            carChecklistError.message
                        );

                    }

                }


                resolve({

                    report,

                    checklist:
                        checklist || []

                });

            } catch (error) {

                reject(error);

            }

        }
    );

};


// ======================================================
// GET REPORT DELIVERY DATA
// USED FOR EMAIL
//
// IMPORTANT:
// Customer data can exist in:
// 1. owners table
// 2. cars table
// 3. report_unlock_requests
//
// Therefore we fetch all useful fields.
// ======================================================

const getReportDeliveryData = (
    reportId
) => {

    return new Promise(
        async (resolve, reject) => {

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

                    c.*,

                    o.owner_id AS joined_owner_id,
                    o.owner_name AS joined_owner_name,
                    o.email AS joined_owner_email,
                    o.mobile AS joined_owner_mobile,
                    o.address AS joined_owner_address,

                    rur.name AS unlock_customer_name,
                    rur.mobile AS unlock_customer_mobile,
                    rur.email AS unlock_customer_email

                FROM inspection_reports ir

                LEFT JOIN cars c
                    ON c.car_id = ir.car_id

                LEFT JOIN owners o
                    ON o.owner_id = c.owner_id

                LEFT JOIN report_unlock_requests rur
                    ON rur.car_id = ir.car_id
                    AND rur.status = 'Approved'

                WHERE ir.report_id = ?

                ORDER BY rur.request_id DESC

                LIMIT 1
            `;


            db.query(
                sql,

                [
                    reportId
                ],

                async (
                    err,
                    result
                ) => {

                    if (err) {

                        console.error(
                            "getReportDeliveryData JOIN query error:",
                            err.message
                        );

                        // --------------------------------------------------
                        // Fallback to original minimal query.
                        // --------------------------------------------------

                        const fallbackSql = `
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
                                o.mobile AS owner_mobile,
                                o.address AS owner_address

                            FROM inspection_reports ir

                            LEFT JOIN cars c
                                ON c.car_id = ir.car_id

                            LEFT JOIN owners o
                                ON o.owner_id = c.owner_id

                            WHERE ir.report_id = ?

                            LIMIT 1
                        `;


                        return db.query(
                            fallbackSql,
                            [reportId],

                            (
                                fallbackErr,
                                fallbackResult
                            ) => {

                                if (fallbackErr) {
                                    return reject(
                                        fallbackErr
                                    );
                                }


                                const row =
                                    fallbackResult[0] ||
                                    null;


                                if (!row) {
                                    return resolve(
                                        null
                                    );
                                }


                                resolve(
                                    normalizeDeliveryData(
                                        row
                                    )
                                );

                            }
                        );

                    }


                    const row =
                        result[0] ||
                        null;


                    if (!row) {
                        return resolve(null);
                    }


                    resolve(
                        normalizeDeliveryData(
                            row
                        )
                    );

                }
            );

        }
    );

};


// ======================================================
// NORMALIZE REPORT DELIVERY DATA
// ======================================================

const normalizeDeliveryData = (
    row
) => {

    const customerName =
        firstValue(

            row.customer_name,
            row.customerName,

            row.owner_name,
            row.ownerName,

            row.joined_owner_name,

            row.unlock_customer_name,

            row.name,

            "-"
        );


    const customerMobile =
        firstValue(

            row.owner_mobile,
            row.ownerMobile,

            row.mobile,
            row.phone,

            row.joined_owner_mobile,

            row.unlock_customer_mobile,

            "-"
        );


    const customerEmail =
        firstValue(

            row.owner_email,
            row.ownerEmail,

            row.email,

            row.joined_owner_email,

            row.unlock_customer_email,

            null
        );


    const customerAddress =
        firstValue(

            row.owner_address,
            row.ownerAddress,

            row.address,

            row.city,

            row.joined_owner_address,

            "-"
        );


    const vehicle = {

        ...row,

        customer_name:
            customerName,

        customerName:
            customerName,

        owner_name:
            customerName,

        ownerName:
            customerName,

        owner_mobile:
            customerMobile,

        ownerMobile:
            customerMobile,

        owner_email:
            customerEmail,

        ownerEmail:
            customerEmail,

        owner_address:
            customerAddress,

        ownerAddress:
            customerAddress

    };


    const owner = {

        ...row,

        ownerName:
            customerName,

        owner_name:
            customerName,

        name:
            customerName,

        fullName:
            customerName,

        mobile:
            customerMobile,

        phone:
            customerMobile,

        owner_mobile:
            customerMobile,

        ownerMobile:
            customerMobile,

        email:
            customerEmail,

        owner_email:
            customerEmail,

        ownerEmail:
            customerEmail,

        address:
            customerAddress,

        owner_address:
            customerAddress,

        ownerAddress:
            customerAddress

    };


    const inspection = {

        ...row,

        report_id:
            row.report_id,

        reportId:
            row.report_id,

        car_id:
            row.car_id,

        carId:
            row.car_id,

        overall_score:
            row.overall_score,

        overallScore:
            row.overall_score,

        engine_remark:
            row.engine_remark,

        engineRemark:
            row.engine_remark,

        overall_remark:
            row.overall_remark,

        overallRemark:
            row.overall_remark,

        publish_status:
            row.publish_status,

        publishStatus:
            row.publish_status,

        pdf_path:
            row.pdf_path,

        pdfPath:
            row.pdf_path

    };


    return {

        ...row,

        reportId:
            row.report_id,

        report_id:
            row.report_id,

        carId:
            row.car_id,

        car_id:
            row.car_id,

        vehicle,

        owner,

        inspection,

        customer_name:
            customerName,

        customerName:
            customerName,

        owner_name:
            customerName,

        ownerName:
            customerName,

        owner_mobile:
            customerMobile,

        ownerMobile:
            customerMobile,

        owner_email:
            customerEmail,

        ownerEmail:
            customerEmail,

        owner_address:
            customerAddress,

        ownerAddress:
            customerAddress,

        pdf_path:
            row.pdf_path,

        pdfPath:
            row.pdf_path,

        publish_status:
            row.publish_status,

        publishStatus:
            row.publish_status

    };

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


            const values = [

                firstValue(
                    reportData.overallScore,
                    reportData.overall_score,
                    null
                ),

                firstValue(
                    reportData.engineRemark,
                    reportData.engine_remark,
                    null
                ),

                firstValue(
                    reportData.overallRemark,
                    reportData.overall_remark,
                    null
                ),

                normalizePublishStatus(
                    firstValue(
                        reportData.publishStatus,
                        reportData.publish_status,
                        "No"
                    )
                ),

                reportId

            ];


            db.query(
                sql,
                values,

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
// MARK INSPECTION REPORT AS PUBLISHED
// ======================================================

const markInspectionReportPublished = (
    reportId
) => {

    return new Promise(
        (resolve, reject) => {

            const sql = `
                UPDATE inspection_reports
                SET publish_status = 'Yes'
                WHERE report_id = ?
            `;


            db.query(
                sql,

                [
                    reportId
                ],

                (
                    err,
                    result
                ) => {

                    if (err) {

                        return reject(
                            err
                        );

                    }


                    resolve(
                        result
                    );

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

    getLatestInspectionReportByCarId,

    getAllInspectionReports,

    getInspectionReportById,

    getInspectionChecklist,

    getCompleteInspectionReport,

    getReportDeliveryData,

    updateInspectionReport,

    updateInspectionReportPdfPath,

    markInspectionReportPublished,

    getInspectionChecklistByCarId

};