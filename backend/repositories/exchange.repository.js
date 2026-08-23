const db = require("../config/db");

// ======================================================
// CREATE EXCHANGE REQUEST
// Customer
// ======================================================

const createExchangeRequest = (exchangeData) => {

    return new Promise((resolve, reject) => {

        const sql = `
            INSERT INTO exchange_requests
            (
                name,
                mobile,
                email,
                current_brand,
                current_model,
                current_year,
                current_vehicle_price,
                preferred_brand,
                preferred_model,
                preferred_variant,
                budget,
                vehicle_image,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [

            exchangeData.name,

            exchangeData.mobile,

            exchangeData.email,

            exchangeData.currentBrand,

            exchangeData.currentModel,

            exchangeData.currentYear,

            exchangeData.currentVehiclePrice,

            exchangeData.preferredBrand,

            exchangeData.preferredModel,

            exchangeData.preferredVariant,

            exchangeData.budget,

            exchangeData.vehicleImage || null,

            exchangeData.status || "Pending"

        ];

        db.query(
            sql,
            values,
            (err, result) => {

                if (err) {

                    return reject(err);

                }

                resolve({

                    exchangeId:
                        result.insertId

                });

            }
        );

    });

};


// ======================================================
// GET ALL EXCHANGE REQUESTS
// Admin
// ======================================================

const getAllExchangeRequests = () => {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT
                exchange_id,
                name,
                mobile,
                email,
                current_brand,
                current_model,
                current_year,
                current_vehicle_price,
                preferred_brand,
                preferred_model,
                preferred_variant,
                budget,
                vehicle_image,
                status,
                created_at

            FROM exchange_requests

            ORDER BY exchange_id DESC
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
// GET EXCHANGE REQUEST BY ID
// Admin
// ======================================================

const getExchangeRequestById = (
    exchangeId
) => {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT
                exchange_id,
                name,
                mobile,
                email,
                current_brand,
                current_model,
                current_year,
                current_vehicle_price,
                preferred_brand,
                preferred_model,
                preferred_variant,
                budget,
                vehicle_image,
                status,
                created_at

            FROM exchange_requests

            WHERE exchange_id = ?

            LIMIT 1
        `;

        db.query(
            sql,
            [exchangeId],
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
// UPDATE EXCHANGE REQUEST STATUS
// Admin
// ======================================================

const updateExchangeRequestStatus = (
    exchangeId,
    status
) => {

    return new Promise((resolve, reject) => {

        const sql = `
            UPDATE exchange_requests

            SET
                status = ?

            WHERE exchange_id = ?
        `;

        db.query(
            sql,
            [
                status,
                exchangeId
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

    createExchangeRequest,

    getAllExchangeRequests,

    getExchangeRequestById,

    updateExchangeRequestStatus

};