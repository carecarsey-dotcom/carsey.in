const db = require("../config/db");

const {
    triggerGoogleSheetsSync
} = require("../services/googleSheetsSync.service");

// ======================================================
// CHECK CAR EXISTS
// ======================================================

const checkCarExists = (carId) => {

    return new Promise((resolve, reject) => {

        const sql = `

            SELECT

                car_id,

                booking_id

            FROM cars

            WHERE car_id = ?

            LIMIT 1

        `;

        db.query(

            sql,

            [carId],

            (err, result) => {

                if (err) {

                    return reject(err);

                }

                resolve(result.length > 0);

            }

        );

    });

};


// ======================================================
// CREATE TEST DRIVE REQUEST
// Customer
// ======================================================

const createTestDriveRequest = (requestData) => {

    return new Promise((resolve, reject) => {

        const sql = `

            INSERT INTO test_drive_requests

            (

                car_id,

                name,

                mobile,

                email,

                city,

                preferred_date,

                preferred_time

            )

            VALUES (?, ?, ?, ?, ?, ?, ?)

        `;

        const values = [

            requestData.carId,

            requestData.name,

            requestData.mobile,

            requestData.email,

            requestData.city,

            requestData.preferredDate,

            requestData.preferredTime

        ];

        db.query(

            sql,

            values,

            (err, result) => {

                if (err) {

                    return reject(err);

                }

                // ==================================================
                // GET MASTER BOOKING ID FROM CAR
                // ==================================================

                const bookingSql = `

                    SELECT

                        booking_id

                    FROM cars

                    WHERE car_id = ?

                    LIMIT 1

                `;

                db.query(

                    bookingSql,

                    [requestData.carId],

                    (bookingErr, bookingResult) => {

                        if (bookingErr) {

                            return reject(bookingErr);

                        }

                        triggerGoogleSheetsSync(
                            `Test drive request created: request_id ${result.insertId}`
                        );

                        resolve({

                            requestId:

                                result.insertId,

                            bookingId:

                                bookingResult[0]

                                    ? bookingResult[0].booking_id

                                    : null

                        });

                    }

                );

            }

        );

    });

};


// ======================================================
// GET ALL TEST DRIVE REQUESTS
// Admin
// ======================================================

const getAllTestDriveRequests = () => {

    return new Promise((resolve, reject) => {

        const sql = `

            SELECT

                tdr.request_id,

                tdr.car_id,

                c.booking_id,

                tdr.name,

                tdr.mobile,

                tdr.email,

                tdr.city,

                tdr.preferred_date,

                tdr.preferred_time,

                tdr.status,

                tdr.created_at

            FROM test_drive_requests tdr

            LEFT JOIN cars c

                ON c.car_id = tdr.car_id

            ORDER BY tdr.request_id DESC

        `;

        db.query(

            sql,

            (err, result) => {

                if (err) {

                    return reject(err);

                }

                resolve(result);

            }

        );

    });

};


// ======================================================
// GET TEST DRIVE REQUEST BY ID
// Admin
// ======================================================

const getTestDriveRequestById = (

    requestId

) => {

    return new Promise((resolve, reject) => {

        const sql = `

            SELECT

                tdr.request_id,

                tdr.car_id,

                c.booking_id,

                tdr.name,

                tdr.mobile,

                tdr.email,

                tdr.city,

                tdr.preferred_date,

                tdr.preferred_time,

                tdr.status,

                tdr.created_at

            FROM test_drive_requests tdr

            LEFT JOIN cars c

                ON c.car_id = tdr.car_id

            WHERE tdr.request_id = ?

            LIMIT 1

        `;

        db.query(

            sql,

            [requestId],

            (err, result) => {

                if (err) {

                    return reject(err);

                }

                resolve(

                    result[0] || null

                );

            }

        );

    });

};


// ======================================================
// UPDATE TEST DRIVE STATUS
// Admin
// ======================================================

const updateTestDriveStatus = (

    requestId,

    status

) => {

    return new Promise((resolve, reject) => {

        const sql = `

            UPDATE test_drive_requests

            SET status = ?

            WHERE request_id = ?

        `;

        db.query(

            sql,

            [

                status,

                requestId

            ],

            (err, result) => {

                if (err) {

                    return reject(err);

                }

                triggerGoogleSheetsSync(
                    `Test drive request status updated: request_id ${requestId}`
                );

                resolve(result);

            }

        );

    });

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    checkCarExists,

    createTestDriveRequest,

    getAllTestDriveRequests,

    getTestDriveRequestById,

    updateTestDriveStatus

};
