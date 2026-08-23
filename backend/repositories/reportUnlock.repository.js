const db = require("../config/db");


// ======================================================
// CREATE REPORT UNLOCK REQUEST
// ======================================================

const createReportUnlockRequest = (requestData) => {

    return new Promise((resolve, reject) => {

        const sql = `
            INSERT INTO report_unlock_requests
            (
                car_id,
                name,
                mobile,
                email
            )
            VALUES (?, ?, ?, ?)
        `;

        const values = [
            requestData.carId,
            requestData.name,
            requestData.mobile,
            requestData.email
        ];

        db.query(
            sql,
            values,
            (err, result) => {

                // ------------------------------------------
                // Database Error
                // ------------------------------------------

                if (err) {
                    return reject(err);
                }

                // ------------------------------------------
                // Success
                // ------------------------------------------

                resolve({
                    requestId: result.insertId
                });

            }
        );

    });

};


// ======================================================
// GET REPORT UNLOCK REQUESTS
// Admin
// ======================================================

const getReportUnlockRequests = () => {

    return new Promise((resolve, reject) => {

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

            ORDER BY request_id DESC
        `;

        db.query(
            sql,
            (err, result) => {

                // ------------------------------------------
                // Database Error
                // ------------------------------------------

                if (err) {
                    return reject(err);
                }

                // ------------------------------------------
                // Success
                // ------------------------------------------

                resolve(result);

            }
        );

    });

};


// ======================================================
// UPDATE REPORT UNLOCK REQUEST STATUS
// Admin
// ======================================================

const updateReportUnlockRequestStatus = (
    requestId,
    status
) => {

    return new Promise((resolve, reject) => {

        const sql = `
            UPDATE report_unlock_requests

            SET status = ?

            WHERE request_id = ?
        `;

        db.query(
            sql,
            [status, requestId],
            (err, result) => {

                // ------------------------------------------
                // Database Error
                // ------------------------------------------

                if (err) {
                    return reject(err);
                }


                // ------------------------------------------
                // Request Not Found
                // ------------------------------------------

                if (result.affectedRows === 0) {

                    return reject(
                        new Error(
                            "Report unlock request not found."
                        )
                    );

                }


                // ------------------------------------------
                // Success
                // ------------------------------------------

                resolve({
                    requestId: Number(requestId),
                    status
                });

            }
        );

    });

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    createReportUnlockRequest,

    getReportUnlockRequests,

    updateReportUnlockRequestStatus

};