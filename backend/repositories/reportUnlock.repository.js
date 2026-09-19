const db = require("../config/db");

const {
    triggerGoogleSheetsSync
} = require("../services/googleSheetsSync.service");


// ======================================================
// CREATE REPORT UNLOCK REQUEST
// ======================================================

const createReportUnlockRequest = (requestData) => {

    return new Promise((resolve, reject) => {

        // ==================================================
        // FIRST CHECK CAR + MASTER BOOKING ID
        // ==================================================

        const carSql = `

            SELECT

                car_id,

                booking_id

            FROM cars

            WHERE car_id = ?

            LIMIT 1

        `;

        db.query(

            carSql,

            [requestData.carId],

            (carErr, carResult) => {

                // ------------------------------------------
                // Database Error
                // ------------------------------------------

                if (carErr) {

                    return reject(carErr);

                }

                // ------------------------------------------
                // Car Not Found
                // ------------------------------------------

                if (

                    !carResult ||

                    carResult.length === 0

                ) {

                    return reject(

                        new Error(

                            "Vehicle not found."

                        )

                    );

                }

                // ------------------------------------------
                // Get Master Booking ID
                // ------------------------------------------

                const bookingId =

                    Number(

                        carResult[0].booking_id

                    );

                // ------------------------------------------
                // Booking ID Must Exist
                // ------------------------------------------

                if (

                    !Number.isInteger(

                        bookingId

                    ) ||

                    bookingId <= 0

                ) {

                    return reject(

                        new Error(

                            "Vehicle is not linked to a valid booking ID."

                        )

                    );

                }

                // ==================================================
                // INSERT REQUEST
                // ==================================================

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

                        triggerGoogleSheetsSync(
                            `Report unlock request created: request_id ${result.insertId}`
                        );

                        resolve({

                            requestId:

                                result.insertId,

                            bookingId

                        });

                    }

                );

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

            ORDER BY rur.request_id DESC

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

            SELECT

                rur.request_id,

                rur.car_id,

                c.booking_id

            FROM report_unlock_requests rur

            LEFT JOIN cars c

                ON c.car_id = rur.car_id

            WHERE rur.request_id = ?

            LIMIT 1

        `;

        db.query(

            sql,

            [requestId],

            (selectErr, selectResult) => {

                // ------------------------------------------
                // Database Error
                // ------------------------------------------

                if (selectErr) {

                    return reject(selectErr);

                }

                // ------------------------------------------
                // Request Not Found
                // ------------------------------------------

                if (

                    !selectResult ||

                    selectResult.length === 0

                ) {

                    return reject(

                        new Error(

                            "Report unlock request not found."

                        )

                    );

                }

                // ------------------------------------------
                // Get Booking ID
                // ------------------------------------------

                const bookingId =

                    Number(

                        selectResult[0].booking_id

                    );

                // ------------------------------------------
                // Validate Booking ID
                // ------------------------------------------

                if (

                    !Number.isInteger(

                        bookingId

                    ) ||

                    bookingId <= 0

                ) {

                    return reject(

                        new Error(

                            "Vehicle is not linked to a valid booking ID."

                        )

                    );

                }

                // ==================================================
                // UPDATE STATUS
                // ==================================================

                const updateSql = `

                    UPDATE report_unlock_requests

                    SET status = ?

                    WHERE request_id = ?

                `;

                db.query(

                    updateSql,

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

                        if (

                            result.affectedRows === 0

                        ) {

                            return reject(

                                new Error(

                                    "Report unlock request not found."

                                )

                            );

                        }

                        // ------------------------------------------
                        // Success
                        // ------------------------------------------

                        triggerGoogleSheetsSync(
                            `Report unlock request status updated: request_id ${requestId}`
                        );

                        resolve({

                            requestId:

                                Number(requestId),

                            carId:

                                Number(

                                    selectResult[0].car_id

                                ),

                            bookingId,

                            status

                        });

                    }

                );

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
