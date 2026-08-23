const db = require("../config/db");

// ======================================================
// CHECK CAR EXISTS
// ======================================================

const checkCarExists = (carId) => {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT car_id
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

                resolve({
                    requestId: result.insertId
                });

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
                request_id,
                car_id,
                name,
                mobile,
                email,
                city,
                preferred_date,
                preferred_time,
                status,
                created_at

            FROM test_drive_requests

            ORDER BY request_id DESC
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

const getTestDriveRequestById = (requestId) => {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT
                request_id,
                car_id,
                name,
                mobile,
                email,
                city,
                preferred_date,
                preferred_time,
                status,
                created_at

            FROM test_drive_requests

            WHERE request_id = ?

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