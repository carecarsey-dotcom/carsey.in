const db = require("../config/db");

const {
    triggerGoogleSheetsSync
} = require("../services/googleSheetsSync.service");

// ======================================================
// CREATE SELL CAR REQUEST
// Customer
// ======================================================

const createSellCarRequest = (requestData) => {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO sell_car_requests
            (
                seller_name,
                owner_name,
                owner_classification,
                mobile,
                email,
                city,
                brand,
                model,
                variant,
                vehicle_number,
                manufacturing_year,
                fuel_type,
                transmission,
                km_driven,
                expected_price,
                front_image,
                back_image,
                left_image,
                right_image,
                interior_front_image,
                interior_rear_image,
                open_dicky_image,
                open_bonnet_image,
                odometer_image,
                dashboard_image,
                extra_image,
                status
            )
            VALUES (
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
        `;

        const values = [
            requestData.sellerName,
            requestData.ownerName ?? null,
            requestData.ownerClassification ?? null,
            requestData.mobile,
            requestData.email,
            requestData.city,
            requestData.brand,
            requestData.model,
            requestData.variant,
            requestData.vehicleNumber,
            requestData.manufacturingYear,
            requestData.fuelType,
            requestData.transmission,
            requestData.kmDriven,
            requestData.expectedPrice,
            requestData.frontImage,
            requestData.backImage,
            requestData.leftImage,
            requestData.rightImage,
            requestData.interiorFrontImage ?? null,
            requestData.interiorRearImage ?? null,
            requestData.openDickyImage ?? null,
            requestData.openBonnetImage ?? null,
            requestData.odometerImage ?? null,
            requestData.dashboardImage ?? null,
            requestData.extraImage ?? null,
            requestData.status || "Pending"
        ];

        db.query(sql, values, (err, result) => {
            if (err) {
                return reject(err);
            }

            triggerGoogleSheetsSync(
                `Sell car request created: sell_id ${result.insertId}`
            );

            resolve({
                sellId: result.insertId
            });
        });
    });
};

// ======================================================
// GET ALL SELL CAR REQUESTS
// Admin
// ======================================================

const getAllSellCarRequests = () => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT
                sell_id,
                seller_name,
                owner_name,
                owner_classification,
                mobile,
                email,
                city,
                brand,
                model,
                variant,
                vehicle_number,
                manufacturing_year,
                fuel_type,
                transmission,
                km_driven,
                expected_price,

                front_image,
                back_image,
                left_image,
                right_image,

                interior_front_image,
                interior_rear_image,
                open_dicky_image,
                open_bonnet_image,
                odometer_image,
                dashboard_image,
                extra_image,

                status,
                assigned_employee_id,
                workflow_status,
                correction_note,
                submitted_for_approval_at,
                created_at

            FROM sell_car_requests
            ORDER BY sell_id DESC
        `;

        db.query(sql, (err, result) => {
            if (err) {
                return reject(err);
            }

            resolve(result);
        });
    });
};

// ======================================================
// GET SELL CAR REQUEST BY ID
// Admin
// ======================================================

const getSellCarRequestById = (sellId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT
                sell_id,
                seller_name,
                owner_name,
                owner_classification,
                mobile,
                email,
                city,
                brand,
                model,
                variant,
                vehicle_number,
                manufacturing_year,
                fuel_type,
                transmission,
                km_driven,
                expected_price,

                front_image,
                back_image,
                left_image,
                right_image,

                interior_front_image,
                interior_rear_image,
                open_dicky_image,
                open_bonnet_image,
                odometer_image,
                dashboard_image,
                extra_image,

                status,
                assigned_employee_id,
                workflow_status,
                correction_note,
                submitted_for_approval_at,
                created_at

            FROM sell_car_requests
            WHERE sell_id = ?
            LIMIT 1
        `;

        db.query(sql, [sellId], (err, result) => {
            if (err) {
                return reject(err);
            }

            resolve(result[0] || null);
        });
    });
};

// ======================================================
// ASSIGN SELL CAR REQUEST TO EMPLOYEE
// Admin
// ======================================================

const assignSellCarRequest = (sellId, employeeId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE sell_car_requests
            SET
                assigned_employee_id = ?,
                workflow_status = 'Assigned',
                correction_note = NULL,
                submitted_for_approval_at = NULL,
                status = 'Pending'
            WHERE sell_id = ?
              AND workflow_status NOT IN ('Approved', 'Rejected')
        `;

        db.query(sql, [employeeId, sellId], (err, result) => {
            if (err) {
                return reject(err);
            }

            if (result.affectedRows === 0) {
                return resolve(null);
            }

            triggerGoogleSheetsSync(
                `Sell car request assigned: sell_id ${sellId}`
            );

            resolve(result);
        });
    });
};

// ======================================================
// GET SELL CAR REQUESTS ASSIGNED TO EMPLOYEE
// Employee
// ======================================================

const getAssignedSellCarRequests = (employeeId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT
                sell_id,
                seller_name,
                owner_name,
                owner_classification,
                mobile,
                email,
                city,
                brand,
                model,
                variant,
                vehicle_number,
                manufacturing_year,
                fuel_type,
                transmission,
                km_driven,
                expected_price,

                front_image,
                back_image,
                left_image,
                right_image,

                interior_front_image,
                interior_rear_image,
                open_dicky_image,
                open_bonnet_image,
                odometer_image,
                dashboard_image,
                extra_image,

                status,
                assigned_employee_id,
                workflow_status,
                correction_note,
                submitted_for_approval_at,
                created_at

            FROM sell_car_requests
            WHERE assigned_employee_id = ?
            ORDER BY sell_id DESC
        `;

        db.query(sql, [employeeId], (err, result) => {
            if (err) {
                return reject(err);
            }

            resolve(result);
        });
    });
};

// ======================================================
// UPDATE SELL CAR REQUEST DETAILS
// Employee
// ======================================================

const updateAssignedSellCarRequest = (
    sellId,
    employeeId,
    requestData
) => {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE sell_car_requests
            SET
                seller_name = ?,
                mobile = ?,
                email = ?,
                city = ?,
                brand = ?,
                model = ?,
                variant = ?,
                vehicle_number = ?,
                manufacturing_year = ?,
                fuel_type = ?,
                transmission = ?,
                km_driven = ?,
                expected_price = ?,

                front_image = ?,
                back_image = ?,
                left_image = ?,
                right_image = ?,

                interior_front_image = ?,
                interior_rear_image = ?,
                odometer_image = ?,
                extra_image = ?,

                workflow_status = 'Assigned',
                correction_note = NULL,
                submitted_for_approval_at = NULL

            WHERE sell_id = ?
              AND assigned_employee_id = ?
              AND workflow_status IN (
                  'Assigned',
                  'Correction Required'
              )
        `;

        const values = [
            requestData.sellerName,
            requestData.mobile,
            requestData.email,
            requestData.city,
            requestData.brand,
            requestData.model,
            requestData.variant,
            requestData.vehicleNumber,
            requestData.manufacturingYear,
            requestData.fuelType,
            requestData.transmission,
            requestData.kmDriven,
            requestData.expectedPrice,

            requestData.frontImage,
            requestData.backImage,
            requestData.leftImage,
            requestData.rightImage,

            requestData.interiorFrontImage ?? null,
            requestData.interiorRearImage ?? null,
            requestData.odometerImage ?? null,
            requestData.extraImage ?? null,

            sellId,
            employeeId
        ];

        db.query(sql, values, (err, result) => {
            if (err) {
                return reject(err);
            }

            if (result.affectedRows > 0) {
                triggerGoogleSheetsSync(
                    `Sell car request updated by employee: sell_id ${sellId}`
                );
            }

            resolve(result);
        });
    });
};

// ======================================================
// SUBMIT SELL CAR REQUEST FOR ADMIN APPROVAL
// Employee
// ======================================================

const submitSellCarRequestForApproval = (
    sellId,
    employeeId
) => {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE sell_car_requests
            SET
                workflow_status = 'Pending Approval',
                correction_note = NULL,
                submitted_for_approval_at = NOW(),
                status = 'Pending'

            WHERE sell_id = ?
              AND assigned_employee_id = ?
              AND workflow_status IN (
                  'Assigned',
                  'Correction Required'
              )
        `;

        db.query(sql, [sellId, employeeId], (err, result) => {
            if (err) {
                return reject(err);
            }

            if (result.affectedRows > 0) {
                triggerGoogleSheetsSync(
                    `Sell car request submitted for approval: sell_id ${sellId}`
                );
            }

            resolve(result);
        });
    });
};

// ======================================================
// SEND SELL CAR REQUEST BACK FOR CORRECTIONS
// Admin
// ======================================================

const sendSellCarRequestForCorrection = (
    sellId,
    correctionNote
) => {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE sell_car_requests
            SET
                workflow_status = 'Correction Required',
                correction_note = ?,
                submitted_for_approval_at = NULL,
                status = 'Pending'

            WHERE sell_id = ?
              AND workflow_status = 'Pending Approval'
        `;

        db.query(
            sql,
            [correctionNote, sellId],
            (err, result) => {
                if (err) {
                    return reject(err);
                }

                if (result.affectedRows > 0) {
                    triggerGoogleSheetsSync(
                        `Sell car request returned for correction: sell_id ${sellId}`
                    );
                }

                resolve(result);
            }
        );
    });
};

// ======================================================
// GET EMPLOYEE BY ID
// ======================================================

const getEmployeeById = (employeeId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT admin_id, name, email, role
            FROM admins
            WHERE admin_id = ? AND role = 'Employee'
            LIMIT 1
        `;

        db.query(sql, [employeeId], (err, result) => {
            if (err) {
                return reject(err);
            }

            resolve(result[0] || null);
        });
    });
};

// ======================================================
// ADMIN APPROVAL: ONLY PENDING APPROVAL REQUESTS
// ======================================================

const approveSellCarRequest = (sellId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE sell_car_requests
            SET
                status = 'Approved',
                workflow_status = 'Approved',
                correction_note = NULL
            WHERE sell_id = ?
              AND workflow_status = 'Pending Approval'
        `;

        db.query(sql, [sellId], (err, result) => {
            if (err) {
                return reject(err);
            }

            if (result.affectedRows > 0) {
                triggerGoogleSheetsSync(
                    `Sell car request approved: sell_id ${sellId}`
                );
            }

            resolve(result);
        });
    });
};

// ======================================================
// ADMIN REJECTION: ONLY PENDING APPROVAL REQUESTS
// ======================================================

const rejectSellCarRequest = (sellId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE sell_car_requests
            SET
                status = 'Rejected',
                workflow_status = 'Rejected',
                correction_note = NULL
            WHERE sell_id = ?
              AND workflow_status = 'Pending Approval'
        `;

        db.query(sql, [sellId], (err, result) => {
            if (err) {
                return reject(err);
            }

            if (result.affectedRows > 0) {
                triggerGoogleSheetsSync(
                    `Sell car request rejected: sell_id ${sellId}`
                );
            }

            resolve(result);
        });
    });
};

// ======================================================
// UPDATE SELL CAR REQUEST STATUS
// Existing Admin functionality
// ======================================================

const updateSellCarRequestStatus = (sellId, status) => {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE sell_car_requests
            SET status = ?
            WHERE sell_id = ?
        `;

        db.query(sql, [status, sellId], (err, result) => {
            if (err) {
                return reject(err);
            }

            if (result.affectedRows > 0) {
                triggerGoogleSheetsSync(
                    `Sell car request status updated: sell_id ${sellId}`
                );
            }

            resolve(result);
        });
    });
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
    createSellCarRequest,
    getAllSellCarRequests,
    getSellCarRequestById,

    assignSellCarRequest,
    getAssignedSellCarRequests,
    updateAssignedSellCarRequest,
    submitSellCarRequestForApproval,
    sendSellCarRequestForCorrection,

    getEmployeeById,
    approveSellCarRequest,
    rejectSellCarRequest,

    updateSellCarRequestStatus
};