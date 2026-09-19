const db = require("../config/db");

const {
    triggerGoogleSheetsSync
} = require("../services/googleSheetsSync.service");

// ======================================================
// HELPER - MYSQL2 CALLBACK POOL -> PROMISE
// ======================================================

const executeQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (error, result) => {
            if (error) {
                return reject(error);
            }

            resolve(result);
        });
    });
};


// ======================================================
// HELPER - GET CONNECTION AS PROMISE
// ======================================================

const getConnection = () => {
    return new Promise((resolve, reject) => {
        db.getConnection((error, connection) => {
            if (error) {
                return reject(error);
            }

            resolve(connection);
        });
    });
};


// ======================================================
// HELPER - CONNECTION QUERY AS PROMISE
// ======================================================

const executeConnectionQuery = (
    connection,
    sql,
    params = []
) => {
    return new Promise((resolve, reject) => {
        connection.query(
            sql,
            params,
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            }
        );
    });
};


// ======================================================
// GET REQUEST BY ID
// ======================================================

const getRequestById = async (requestId) => {

    const sql = `
        SELECT
            ir.*,

            ib.booking_id,
            ib.name AS customer_name,
            ib.mobile AS customer_mobile,
            ib.email AS customer_email,
            ib.city AS booking_city,
            ib.vehicle_number,
            ib.brand AS booking_brand,
            ib.model AS booking_model,
            ib.address AS booking_address,
            ib.booking_date,
            ib.time_slot,
            ib.status AS booking_status,

            emp.admin_id AS employee_id,
            emp.name AS employee_name,
            emp.email AS employee_email,
            emp.status AS employee_status,

            r.report_id,
            r.car_id,
            r.overall_score,
            r.engine_remark,
            r.overall_remark,
            r.pdf_path,
            r.publish_status AS report_publish_status,
            r.created_at AS report_created_at

        FROM inspection_requests ir

        INNER JOIN inspection_bookings ib
            ON ib.booking_id = ir.booking_id

        LEFT JOIN admins emp
            ON emp.admin_id = ir.employee_id

        LEFT JOIN inspection_reports r
            ON r.report_id = ir.report_id

        WHERE ir.request_id = ?

        LIMIT 1
    `;

    const rows = await executeQuery(
        sql,
        [requestId]
    );

    return rows.length
        ? rows[0]
        : null;
};


// ======================================================
// GET EMPLOYEE REQUESTS
// ======================================================

const getEmployeeRequests = async (
    employeeId,
    status = null
) => {

    let sql = `
        SELECT
            ir.*,

            ib.booking_id,
            ib.name AS customer_name,
            ib.mobile AS customer_mobile,
            ib.email AS customer_email,
            ib.city AS booking_city,
            ib.vehicle_number,
            ib.brand AS booking_brand,
            ib.model AS booking_model,
            ib.address AS booking_address,
            ib.booking_date,
            ib.time_slot,
            ib.status AS booking_status,

            emp.name AS employee_name,
            emp.email AS employee_email,

            r.report_id,
            r.car_id,
            r.overall_score,
            r.engine_remark,
            r.overall_remark,
            r.pdf_path,
            r.publish_status AS report_publish_status

        FROM inspection_requests ir

        INNER JOIN inspection_bookings ib
            ON ib.booking_id = ir.booking_id

        LEFT JOIN admins emp
            ON emp.admin_id = ir.employee_id

        LEFT JOIN inspection_reports r
            ON r.report_id = ir.report_id

        WHERE ir.employee_id = ?
    `;

    const params = [employeeId];

    if (status) {

        sql += `
            AND ir.status = ?
        `;

        params.push(status);
    }

    sql += `
        ORDER BY
            ir.created_at DESC,
            ir.request_id DESC
    `;

    return await executeQuery(
        sql,
        params
    );
};


// ======================================================
// GET ADMIN REQUESTS
// ======================================================

const getAdminRequests = async (
    status = null
) => {

    let sql = `
        SELECT
            ir.*,

            ib.booking_id,
            ib.name AS customer_name,
            ib.mobile AS customer_mobile,
            ib.email AS customer_email,
            ib.city AS booking_city,
            ib.vehicle_number,
            ib.brand AS booking_brand,
            ib.model AS booking_model,
            ib.address AS booking_address,
            ib.booking_date,
            ib.time_slot,
            ib.status AS booking_status,

            emp.admin_id AS employee_id,
            emp.name AS employee_name,
            emp.email AS employee_email,
            emp.status AS employee_status,

            r.report_id,
            r.car_id,
            r.overall_score,
            r.engine_remark,
            r.overall_remark,
            r.pdf_path,
            r.publish_status AS report_publish_status

        FROM inspection_requests ir

        INNER JOIN inspection_bookings ib
            ON ib.booking_id = ir.booking_id

        LEFT JOIN admins emp
            ON emp.admin_id = ir.employee_id

        LEFT JOIN inspection_reports r
            ON r.report_id = ir.report_id
    `;

    const params = [];

    if (status) {

        sql += `
            WHERE ir.status = ?
        `;

        params.push(status);
    }

    sql += `
        ORDER BY
            ir.created_at DESC,
            ir.request_id DESC
    `;

    return await executeQuery(
        sql,
        params
    );
};


// ======================================================
// ACCEPT REQUEST
// ======================================================

const acceptRequest = async (
    requestId,
    employeeId
) => {

    const sql = `
        UPDATE inspection_requests

        SET
            status = 'Accepted',
            accepted_at = CURRENT_TIMESTAMP

        WHERE request_id = ?
          AND employee_id = ?
          AND status = 'Assigned'
    `;

    const result = await executeQuery(
        sql,
        [
            requestId,
            employeeId
        ]
    );

    triggerGoogleSheetsSync(
        `Inspection request accepted: request_id ${requestId}`
    );

    return result;
};


// ======================================================
// REJECT REQUEST
// ======================================================

const rejectRequest = async (
    requestId,
    employeeId,
    employeeRemark = null
) => {

    const sql = `
        UPDATE inspection_requests

        SET
            status = 'Rejected',
            employee_remark = ?,
            rejected_at = CURRENT_TIMESTAMP

        WHERE request_id = ?
          AND employee_id = ?
          AND status = 'Assigned'
    `;

    const result = await executeQuery(
        sql,
        [
            employeeRemark,
            requestId,
            employeeId
        ]
    );

    triggerGoogleSheetsSync(
        `Inspection request rejected: request_id ${requestId}`
    );

    return result;
};


// ======================================================
// START INSPECTION
// ======================================================

const startInspection = async (
    requestId,
    employeeId
) => {

    const sql = `
        UPDATE inspection_requests

        SET
            status = 'In Progress',
            started_at = CURRENT_TIMESTAMP

        WHERE request_id = ?
          AND employee_id = ?
          AND status IN ('Accepted', 'Admin Rejected')
    `;

    const result = await executeQuery(
        sql,
        [
            requestId,
            employeeId
        ]
    );

    triggerGoogleSheetsSync(
        `Inspection started: request_id ${requestId}`
    );

    return result;
};


// ======================================================
// SUBMIT INSPECTION
// ======================================================
//
// Vehicle/report creation happens in service.
//
// This method only:
//
// 1. Links report to request
// 2. Saves employee remark
// 3. Changes request status to Submitted
//
// ======================================================

const submitInspection = async (
    requestId,
    employeeId,
    reportId,
    employeeRemark = null
) => {

    const sql = `
        UPDATE inspection_requests

        SET
            status = 'Submitted',
            report_id = ?,
            employee_remark = ?,
            submitted_at = CURRENT_TIMESTAMP

        WHERE request_id = ?
          AND employee_id = ?
          AND status = 'In Progress'
    `;

    const result = await executeQuery(
        sql,
        [
            reportId,
            employeeRemark,
            requestId,
            employeeId
        ]
    );

    triggerGoogleSheetsSync(
        `Inspection submitted: request_id ${requestId}, report_id ${reportId}`
    );

    return result;
};


// ======================================================
// ADMIN APPROVE REQUEST
// ======================================================

const approveRequest = async (
    requestId,
    adminRemark = null
) => {

    const sql = `
        UPDATE inspection_requests

        SET
            status = 'Approved',
            admin_remark = ?,
            admin_reviewed_at = CURRENT_TIMESTAMP,
            approved_at = CURRENT_TIMESTAMP

        WHERE request_id = ?
          AND status = 'Submitted'
    `;

    const result = await executeQuery(
        sql,
        [
            adminRemark,
            requestId
        ]
    );

    triggerGoogleSheetsSync(
        `Inspection request approved: request_id ${requestId}`
    );

    return result;
};


// ======================================================
// ADMIN REJECT REQUEST
// ======================================================

const adminRejectRequest = async (
    requestId,
    adminRemark = null
) => {

    const sql = `
        UPDATE inspection_requests

        SET
            status = 'Admin Rejected',
            admin_remark = ?,
            admin_reviewed_at = CURRENT_TIMESTAMP

        WHERE request_id = ?
          AND status = 'Submitted'
    `;

    const result = await executeQuery(
        sql,
        [
            adminRemark,
            requestId
        ]
    );

    triggerGoogleSheetsSync(
        `Inspection request admin-rejected: request_id ${requestId}`
    );

    return result;
};


// ======================================================
// MARK REQUEST AS PUBLISHED
// ======================================================
//
// IMPORTANT:
//
// Admin publish does TWO things:
//
// 1. cars.status = Published
// 2. inspection_requests.status = Published
//
// Price is saved ONLY from Admin publish action.
//
// Employee cannot reach this method because the route
// is Admin protected.
//
// ======================================================

const markRequestPublished = async (
    requestId,
    price
) => {

    const connection = await getConnection();

    try {

        // ==================================================
        // BEGIN TRANSACTION
        // ==================================================

        await new Promise((resolve, reject) => {
            connection.beginTransaction(
                (error) => {
                    if (error) {
                        return reject(error);
                    }

                    resolve();
                }
            );
        });


        // ==================================================
        // GET APPROVED REQUEST + LINKED CAR
        // ==================================================

        const requestRows = await executeConnectionQuery(
            connection,
            `
                SELECT
                    ir.request_id,
                    ir.report_id,
                    r.car_id,
                    ir.status

                FROM inspection_requests ir

                INNER JOIN inspection_reports r
                    ON r.report_id = ir.report_id

                WHERE ir.request_id = ?
                  AND ir.status = 'Approved'

                LIMIT 1
            `,
            [
                requestId
            ]
        );


        if (
            !requestRows ||
            requestRows.length === 0
        ) {
            throw new Error(
                "Approved inspection request not found"
            );
        }


        const request =
            requestRows[0];


        const carId =
            Number(request.car_id);


        if (!carId) {
            throw new Error(
                "Vehicle is not linked with this inspection report"
            );
        }


        // ==================================================
        // VALIDATE ADMIN PRICE
        // ==================================================

        if (
            price === undefined ||
            price === null ||
            price === ""
        ) {
            throw new Error(
                "Vehicle price is required before publishing"
            );
        }


        const numericPrice =
            Number(price);


        // PRICE MUST BE GREATER THAN ZERO
        // 0 IS NOT ALLOWED

        if (
            !Number.isFinite(numericPrice) ||
            numericPrice <= 0
        ) {
            throw new Error(
                "Vehicle price must be a valid positive number"
            );
        }


        // ==================================================
        // UPDATE CAR PRICE + PUBLISH
        // ==================================================

        await executeConnectionQuery(
            connection,
            `
                UPDATE cars

                SET
                    price = ?,
                    status = 'Published',
                    published_at = CURRENT_TIMESTAMP

                WHERE car_id = ?
            `,
            [
                numericPrice,
                carId
            ]
        );


        // ==================================================
        // UPDATE INSPECTION REPORT
        // ==================================================

        await executeConnectionQuery(
            connection,
            `
                UPDATE inspection_reports

                SET
                    publish_status = 'Yes'

                WHERE report_id = ?
            `,
            [
                request.report_id
            ]
        );


        // ==================================================
        // UPDATE INSPECTION REQUEST
        // ==================================================

        const requestUpdateResult =
            await executeConnectionQuery(
                connection,
                `
                    UPDATE inspection_requests

                    SET
                        status = 'Published',
                        published_at = CURRENT_TIMESTAMP

                    WHERE request_id = ?
                      AND status = 'Approved'
                `,
                [
                    requestId
                ]
            );


        if (
            !requestUpdateResult ||
            requestUpdateResult.affectedRows !== 1
        ) {
            throw new Error(
                "Inspection request could not be marked as published"
            );
        }


        // ==================================================
        // COMMIT
        // ==================================================

        await new Promise((resolve, reject) => {
            connection.commit(
                (error) => {
                    if (error) {
                        return reject(error);
                    }

                    resolve();
                }
            );
        });


        triggerGoogleSheetsSync(
            `Inspection request published: request_id ${requestId}, car_id ${carId}`
        );


        return requestUpdateResult;

    } catch (error) {

        // ==================================================
        // ROLLBACK
        // ==================================================

        await new Promise((resolve) => {
            connection.rollback(() => {
                resolve();
            });
        });

        throw error;

    } finally {

        // ==================================================
        // RELEASE CONNECTION
        // ==================================================

        connection.release();
    }
};


// ======================================================
// GET REQUEST REPORT
// ======================================================

const getRequestReport = async (
    requestId
) => {

    const sql = `
        SELECT
            ir.request_id,
            ir.booking_id,
            ir.employee_id,
            ir.report_id,
            ir.status,

            r.report_id AS inspection_report_id,
            r.car_id,
            r.overall_score,
            r.engine_remark,
            r.overall_remark,
            r.pdf_path,
            r.publish_status,
            r.created_at AS report_created_at

        FROM inspection_requests ir

        LEFT JOIN inspection_reports r
            ON r.report_id = ir.report_id

        WHERE ir.request_id = ?

        LIMIT 1
    `;

    const rows = await executeQuery(
        sql,
        [
            requestId
        ]
    );

    return rows.length
        ? rows[0]
        : null;
};


// ======================================================
// GET REQUEST BY REPORT ID
// ======================================================

const getRequestByReportId = async (
    reportId
) => {

    const sql = `
        SELECT
            ir.*

        FROM inspection_requests ir

        WHERE ir.report_id = ?

        ORDER BY ir.request_id DESC

        LIMIT 1
    `;

    const rows = await executeQuery(
        sql,
        [
            reportId
        ]
    );

    return rows.length
        ? rows[0]
        : null;
};


// ======================================================
// EXPORTS
// ======================================================

module.exports = {

    getRequestById,
    getEmployeeRequests,
    getAdminRequests,

    acceptRequest,
    rejectRequest,
    startInspection,
    submitInspection,

    approveRequest,
    adminRejectRequest,
    markRequestPublished,

    getRequestReport,
    getRequestByReportId
};