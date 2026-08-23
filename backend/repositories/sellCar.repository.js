const db = require("../config/db");

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
                mobile,
                email,
                brand,
                model,
                variant,
                manufacturing_year,
                fuel_type,
                transmission,
                km_driven,
                expected_price,
                front_image,
                back_image,
                left_image,
                right_image,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [

            requestData.sellerName,

            requestData.mobile,

            requestData.email,

            requestData.brand,

            requestData.model,

            requestData.variant,

            requestData.manufacturingYear,

            requestData.fuelType,

            requestData.transmission,

            requestData.kmDriven,

            requestData.expectedPrice,

            requestData.frontImage || null,

            requestData.backImage || null,

            requestData.leftImage || null,

            requestData.rightImage || null,

            requestData.status || "Pending"

        ];

        db.query(
            sql,
            values,
            (err, result) => {

                if (err) {

                    return reject(err);

                }

                resolve({

                    sellId: result.insertId

                });

            }
        );

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
                mobile,
                email,
                brand,
                model,
                variant,
                manufacturing_year,
                fuel_type,
                transmission,
                km_driven,
                expected_price,
                front_image,
                back_image,
                left_image,
                right_image,
                status,
                created_at

            FROM sell_car_requests

            ORDER BY sell_id DESC
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
// GET SELL CAR REQUEST BY ID
// Admin
// ======================================================

const getSellCarRequestById = (
    sellId
) => {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT
                sell_id,
                seller_name,
                mobile,
                email,
                brand,
                model,
                variant,
                manufacturing_year,
                fuel_type,
                transmission,
                km_driven,
                expected_price,
                front_image,
                back_image,
                left_image,
                right_image,
                status,
                created_at

            FROM sell_car_requests

            WHERE sell_id = ?

            LIMIT 1
        `;

        db.query(
            sql,
            [sellId],
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
// UPDATE SELL CAR REQUEST STATUS
// Admin
// ======================================================

const updateSellCarRequestStatus = (
    sellId,
    status
) => {

    return new Promise((resolve, reject) => {

        const sql = `
            UPDATE sell_car_requests

            SET
                status = ?

            WHERE sell_id = ?
        `;

        db.query(
            sql,
            [
                status,
                sellId
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

    createSellCarRequest,

    getAllSellCarRequests,

    getSellCarRequestById,

    updateSellCarRequestStatus

};