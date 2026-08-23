const db = require("../config/db");

// ======================================================
// CREATE LOAN REQUEST
// Customer
// ======================================================

const createLoanRequest = (loanData) => {

    return new Promise((resolve, reject) => {

        const sql = `
            INSERT INTO loan_requests
            (
                name,
                mobile,
                email,
                employment_type,
                monthly_income,
                vehicle_required,
                budget,
                car_model,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [

            loanData.name,

            loanData.mobile,

            loanData.email,

            loanData.employmentType,

            loanData.monthlyIncome,

            loanData.vehicleRequired,

            loanData.budget,

            loanData.carModel,

            loanData.status || "Pending"

        ];

        db.query(
            sql,
            values,
            (err, result) => {

                if (err) {

                    return reject(err);

                }

                resolve({

                    loanId:
                        result.insertId

                });

            }
        );

    });

};


// ======================================================
// GET ALL LOAN REQUESTS
// Admin
// ======================================================

const getAllLoanRequests = () => {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT
                loan_id,
                name,
                mobile,
                email,
                employment_type,
                monthly_income,
                vehicle_required,
                budget,
                car_model,
                status,
                created_at

            FROM loan_requests

            ORDER BY loan_id DESC
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
// GET LOAN REQUEST BY ID
// Admin
// ======================================================

const getLoanRequestById = (
    loanId
) => {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT
                loan_id,
                name,
                mobile,
                email,
                employment_type,
                monthly_income,
                vehicle_required,
                budget,
                car_model,
                status,
                created_at

            FROM loan_requests

            WHERE loan_id = ?

            LIMIT 1
        `;

        db.query(
            sql,
            [loanId],
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
// UPDATE LOAN REQUEST STATUS
// Admin
// ======================================================

const updateLoanRequestStatus = (
    loanId,
    status
) => {

    return new Promise((resolve, reject) => {

        const sql = `
            UPDATE loan_requests

            SET
                status = ?

            WHERE loan_id = ?
        `;

        db.query(
            sql,
            [
                status,
                loanId
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

    createLoanRequest,

    getAllLoanRequests,

    getLoanRequestById,

    updateLoanRequestStatus

};