const db = require("../config/db");


// ======================================================
// GET ADMIN BY EMAIL
// ======================================================

const findAdminByEmail = (email) => {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT *
            FROM admins
            WHERE email = ?
            LIMIT 1
        `;

        db.query(
            sql,
            [email],
            (err, result) => {

                if (err) {
                    return reject(err);
                }

                resolve(result[0]);

            }
        );

    });

};


// ======================================================
// GET ADMIN BY ID
// ======================================================

const findAdminById = (adminId) => {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT *
            FROM admins
            WHERE admin_id = ?
            LIMIT 1
        `;

        db.query(
            sql,
            [adminId],
            (err, result) => {

                if (err) {
                    return reject(err);
                }

                resolve(result[0]);

            }
        );

    });

};


// ======================================================
// UPDATE ADMIN PASSWORD
// ======================================================

const updatePassword = (
    adminId,
    password
) => {

    return new Promise((resolve, reject) => {

        const sql = `
            UPDATE admins
            SET password = ?
            WHERE admin_id = ?
        `;

        db.query(
            sql,
            [
                password,
                adminId
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
// CHECK ADMIN / EMPLOYEE EMAIL
// ======================================================

const findAccountByEmail = (
    email
) => {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT
                admin_id,
                name,
                email,
                role,
                status
            FROM admins
            WHERE email = ?
            LIMIT 1
        `;

        db.query(
            sql,
            [email],
            (err, result) => {

                if (err) {
                    return reject(err);
                }

                resolve(result[0] || null);

            }
        );

    });

};


// ======================================================
// CREATE EMPLOYEE
// ======================================================

const createEmployee = (
    name,
    email,
    password
) => {

    return new Promise((resolve, reject) => {

        const sql = `
            INSERT INTO admins
            (
                name,
                email,
                password,
                role,
                status
            )
            VALUES
            (
                ?,
                ?,
                ?,
                'Employee',
                'Active'
            )
        `;

        db.query(
            sql,
            [
                name,
                email,
                password
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
// GET ALL EMPLOYEES
// ======================================================

const getAllEmployees = () => {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT
                admin_id,
                name,
                email,
                role,
                status,
                created_at
            FROM admins
            WHERE role = 'Employee'
            ORDER BY admin_id DESC
        `;

        db.query(
            sql,
            [],
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
// GET EMPLOYEE BY ID
// ======================================================

const getEmployeeById = (
    employeeId
) => {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT
                admin_id,
                name,
                email,
                role,
                status,
                created_at
            FROM admins
            WHERE admin_id = ?
              AND role = 'Employee'
            LIMIT 1
        `;

        db.query(
            sql,
            [employeeId],
            (err, result) => {

                if (err) {
                    return reject(err);
                }

                resolve(result[0] || null);

            }
        );

    });

};


// ======================================================
// UPDATE EMPLOYEE STATUS
// ======================================================

const updateEmployeeStatus = (
    employeeId,
    status
) => {

    return new Promise((resolve, reject) => {

        const sql = `
            UPDATE admins
            SET status = ?
            WHERE admin_id = ?
              AND role = 'Employee'
        `;

        db.query(
            sql,
            [
                status,
                employeeId
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

    // Existing
    findAdminByEmail,
    findAdminById,
    updatePassword,

    // Employee Management
    findAccountByEmail,
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployeeStatus

};