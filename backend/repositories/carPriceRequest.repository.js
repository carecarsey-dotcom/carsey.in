const db = require("../config/db");

const executeQuery = async (sql, params = []) => {
    if (db && typeof db.promise === "function") {
        const result = await db.promise().execute(sql, params);
        return Array.isArray(result) ? result[0] : result;
    }

    if (db && typeof db.execute === "function") {
        const result = await db.execute(sql, params);
        return Array.isArray(result) ? result[0] : result;
    }

    if (db && typeof db.query === "function") {
        return new Promise((resolve, reject) => {
            db.query(sql, params, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            });
        });
    }

    throw new Error("Database connection is not configured correctly.");
};

const carExists = async (carId) => {
    const rows = await executeQuery(
        "SELECT car_id FROM cars WHERE car_id = ? LIMIT 1",
        [carId]
    );
    return Array.isArray(rows) && rows.length > 0;
};

const createPriceRequest = async ({ carId, name, mobile, email }) => {
    const result = await executeQuery(
        `INSERT INTO car_price_requests
            (car_id, customer_name, mobile, email)
         VALUES (?, ?, ?, ?)`,
        [carId, name, mobile, email]
    );

    return {
        requestId: result.insertId,
        carId,
        name,
        mobile,
        email
    };
};

module.exports = {
    carExists,
    createPriceRequest
};
