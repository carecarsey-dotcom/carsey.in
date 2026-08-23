const db = require("../config/db");

// ======================================================
// CREATE FINANCE REQUEST
// Customer
// ======================================================

const createFinanceRequest = (financeData) => {

    return new Promise((resolve, reject) => {

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

                resolve({

                    financeId:
                        result.insertId

                });

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
                finance_id,
                car_id,
                name,
                mobile,
                email,
                occupation,
                monthly_income,
                down_payment,
                status,
                created_at

            FROM finance_requests

            ORDER BY finance_id DESC
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
                finance_id,
                car_id,
                name,
                mobile,
                email,
                occupation,
                monthly_income,
                down_payment,
                status,
                created_at

            FROM finance_requests

            WHERE finance_id = ?

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