const db = require("../config/db");

const {
    triggerGoogleSheetsSync
} = require("../services/googleSheetsSync.service");

// ======================================================
// CREATE FINANCE REQUEST
// Customer
// ======================================================

const createFinanceRequest = (financeData) => {

    return new Promise((resolve, reject) => {

        // ==================================================
        // GET MASTER BOOKING ID FROM CAR
        // ==================================================

        const bookingSql = `

            SELECT

                car_id,

                booking_id

            FROM cars

            WHERE car_id = ?

            LIMIT 1

        `;

        db.query(

            bookingSql,

            [financeData.carId],

            (bookingErr, bookingResult) => {

                if (bookingErr) {

                    return reject(bookingErr);

                }

                // ==================================================
                // CAR NOT FOUND
                // ==================================================

                if (!bookingResult || !bookingResult[0]) {

                    return reject(

                        new Error(

                            "Car not found."

                        )

                    );

                }

                // ==================================================
                // MASTER BOOKING ID
                // ==================================================

                const bookingId =

                    bookingResult[0].booking_id;

                // ==================================================
                // BOOKING ID IS REQUIRED
                // ==================================================

                if (

                    bookingId === null ||

                    bookingId === undefined ||

                    !Number.isInteger(

                        Number(bookingId)

                    ) ||

                    Number(bookingId) <= 0

                ) {

                    return reject(

                        new Error(

                            "This car is not linked to a valid booking ID."

                        )

                    );

                }

                // ==================================================
                // INSERT FINANCE REQUEST
                // ==================================================

                const sql = `

                    INSERT INTO finance_requests

                    (

                        car_id,

                        name,

                        mobile,

                        email,

                        occupation,

                        monthly_income,

                        down_payment,

                        status

                    )

                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)

                `;

                const values = [

                    financeData.carId,

                    financeData.name,

                    financeData.mobile,

                    financeData.email,

                    financeData.occupation,

                    financeData.monthlyIncome,

                    financeData.downPayment,

                    financeData.status || "Pending"

                ];

                db.query(

                    sql,

                    values,

                    (err, result) => {

                        if (err) {

                            return reject(err);

                        }

                        // ==================================================
                        // GOOGLE SHEETS SYNC
                        // ==================================================

                        triggerGoogleSheetsSync(
                            `Finance request created: finance_id ${result.insertId}`
                        );

                        // ==================================================
                        // RETURN MASTER BOOKING ID
                        // ==================================================

                        resolve({

                            financeId:

                                result.insertId,

                            bookingId:

                                Number(bookingId)

                        });

                    }

                );

            }

        );

    });

};

// ======================================================
// GET ALL FINANCE REQUESTS
// Admin
// ======================================================

const getAllFinanceRequests = () => {

    return new Promise((resolve, reject) => {

        const sql = `

            SELECT

                fr.finance_id,

                fr.car_id,

                c.booking_id,

                fr.name,

                fr.mobile,

                fr.email,

                fr.occupation,

                fr.monthly_income,

                fr.down_payment,

                fr.status,

                fr.created_at

            FROM finance_requests fr

            LEFT JOIN cars c

                ON c.car_id = fr.car_id

            ORDER BY fr.finance_id DESC

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
// GET FINANCE REQUEST BY ID
// Admin
// ======================================================

const getFinanceRequestById = (

    financeId

) => {

    return new Promise((resolve, reject) => {

        const sql = `

            SELECT

                fr.finance_id,

                fr.car_id,

                c.booking_id,

                fr.name,

                fr.mobile,

                fr.email,

                fr.occupation,

                fr.monthly_income,

                fr.down_payment,

                fr.status,

                fr.created_at

            FROM finance_requests fr

            LEFT JOIN cars c

                ON c.car_id = fr.car_id

            WHERE fr.finance_id = ?

            LIMIT 1

        `;

        db.query(

            sql,

            [financeId],

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
// UPDATE FINANCE REQUEST STATUS
// Admin
// ======================================================

const updateFinanceRequestStatus = (

    financeId,

    status

) => {

    return new Promise((resolve, reject) => {

        const sql = `

            UPDATE finance_requests

            SET

                status = ?

            WHERE finance_id = ?

        `;

        db.query(

            sql,

            [

                status,

                financeId

            ],

            (err, result) => {

                if (err) {

                    return reject(err);

                }

                // ==================================================
                // GOOGLE SHEETS SYNC
                // ==================================================

                triggerGoogleSheetsSync(
                    `Finance request status updated: finance_id ${financeId}`
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

    createFinanceRequest,

    getAllFinanceRequests,

    getFinanceRequestById,

    updateFinanceRequestStatus

};
