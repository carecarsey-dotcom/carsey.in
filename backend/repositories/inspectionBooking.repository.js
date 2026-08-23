const db = require("../config/db");

// ======================================================
// HELPER
// MYSQL CALLBACK QUERY KO PROMISE ME CONVERT KARNA
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
// CREATE INSPECTION BOOKING
// ======================================================

const createBooking = async (
    bookingData
) => {

    const {
        name,
        mobile,
        email,
        city,
        vehicleNumber,
        brand,
        model,
        address,
        bookingDate,
        timeSlot
    } = bookingData;


    const query = `
        INSERT INTO inspection_bookings
        (
            name,
            mobile,
            email,
            city,
            vehicle_number,
            brand,
            model,
            address,
            booking_date,
            time_slot,
            status
        )
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
    `;


    const result =
        await executeQuery(
            query,
            [
                name,
                mobile,
                email,
                city,
                vehicleNumber,
                brand,
                model,
                address,
                bookingDate,
                timeSlot
            ]
        );


    return result;

};


// ======================================================
// GET ALL BOOKINGS
// ======================================================

const getAllBookings = async () => {

    const query = `
        SELECT
            booking_id,
            name,
            mobile,
            email,
            city,
            vehicle_number,
            brand,
            model,
            address,
            booking_date,
            time_slot,
            status,
            created_at
        FROM inspection_bookings
        ORDER BY booking_id DESC
    `;


    const rows =
        await executeQuery(query);


    return rows;

};


// ======================================================
// GET BOOKING BY ID
// ======================================================

const getBookingById = async (
    bookingId
) => {

    const query = `
        SELECT
            booking_id,
            name,
            mobile,
            email,
            city,
            vehicle_number,
            brand,
            model,
            address,
            booking_date,
            time_slot,
            status,
            created_at
        FROM inspection_bookings
        WHERE booking_id = ?
        LIMIT 1
    `;


    const rows =
        await executeQuery(
            query,
            [bookingId]
        );


    return rows[0] || null;

};


// ======================================================
// UPDATE BOOKING STATUS
// ======================================================

const updateBookingStatus = async (
    bookingId,
    status
) => {

    const query = `
        UPDATE inspection_bookings
        SET status = ?
        WHERE booking_id = ?
    `;


    const result =
        await executeQuery(
            query,
            [
                status,
                bookingId
            ]
        );


    return result;

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    createBooking,

    getAllBookings,

    getBookingById,

    updateBookingStatus

};