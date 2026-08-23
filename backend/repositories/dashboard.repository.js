const db = require("../config/db");

// ======================================================
// EXECUTE QUERY
// ======================================================

const executeQuery = (
    query,
    values = []
) => {

    return new Promise(
        (resolve, reject) => {

            db.query(
                query,
                values,
                (error, result) => {

                    if (error) {
                        return reject(error);
                    }

                    resolve(result);

                }
            );

        }
    );

};


// ======================================================
// GET ACTIVE VEHICLES
// ======================================================

const getActiveListings = async () => {

    const query = `

        SELECT COUNT(*) AS total

        FROM cars

        WHERE status = 'Published'

    `;

    const result =
        await executeQuery(query);

    return Number(result[0].total);

};


// ======================================================
// GET SOLD CARS
// ======================================================

const getSoldCars = async () => {

    const query = `

        SELECT COUNT(*) AS total

        FROM cars

        WHERE status = 'Sold'

    `;

    const result =
        await executeQuery(query);

    return Number(result[0].total);

};


// ======================================================
// GET UNLOCK REQUESTS
// ======================================================

const getUnlockRequests = async () => {

    const query = `

        SELECT COUNT(*) AS total

        FROM report_unlock_requests

    `;

    const result =
        await executeQuery(query);

    return Number(result[0].total);

};


// ======================================================
// GET TEST DRIVE REQUESTS
// ======================================================

const getTestDriveRequests = async () => {

    const query = `

        SELECT COUNT(*) AS total

        FROM test_drive_requests

    `;

    const result =
        await executeQuery(query);

    return Number(result[0].total);

};


// ======================================================
// GET FINANCE REQUESTS
// ======================================================

const getFinanceRequests = async () => {

    const query = `

        SELECT COUNT(*) AS total

        FROM finance_requests

    `;

    const result =
        await executeQuery(query);

    return Number(result[0].total);

};


// ======================================================
// GET SELL CAR REQUESTS
// ======================================================

const getSellCarRequests = async () => {

    const query = `

        SELECT COUNT(*) AS total

        FROM sell_car_requests

    `;

    const result =
        await executeQuery(query);

    return Number(result[0].total);

};


// ======================================================
// GET EXCHANGE REQUESTS
// ======================================================

const getExchangeRequests = async () => {

    const query = `

        SELECT COUNT(*) AS total

        FROM exchange_requests

    `;

    const result =
        await executeQuery(query);

    return Number(result[0].total);

};


// ======================================================
// GET LOAN REQUESTS
// ======================================================

const getLoanRequests = async () => {

    const query = `

        SELECT COUNT(*) AS total

        FROM loan_requests

    `;

    const result =
        await executeQuery(query);

    return Number(result[0].total);

};


// ======================================================
// GET INSPECTION BOOKINGS
// ======================================================

const getInspectionBookings = async () => {

    const query = `

        SELECT COUNT(*) AS total

        FROM inspection_bookings

    `;

    const result =
        await executeQuery(query);

    return Number(result[0].total);

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    getActiveListings,

    getSoldCars,

    getUnlockRequests,

    getTestDriveRequests,

    getFinanceRequests,

    getSellCarRequests,

    getExchangeRequests,

    getLoanRequests,

    getInspectionBookings

};