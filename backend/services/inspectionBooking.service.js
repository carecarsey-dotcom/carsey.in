const inspectionBookingRepository = require(
    "../repositories/inspectionBooking.repository"
);

// ======================================================
// CREATE BOOKING
// ======================================================

const createBooking = async (bookingData) => {

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


    // ==================================================
    // REQUIRED VALIDATION
    // ==================================================

    if (!name) {
        throw new Error(
            "Name is required."
        );
    }

    if (!mobile) {
        throw new Error(
            "Mobile number is required."
        );
    }

    if (!email) {
        throw new Error(
            "Email is required."
        );
    }

    if (!city) {
        throw new Error(
            "City is required."
        );
    }

    if (!vehicleNumber) {
        throw new Error(
            "Vehicle number is required."
        );
    }

    if (!brand) {
        throw new Error(
            "Vehicle brand is required."
        );
    }

    if (!model) {
        throw new Error(
            "Vehicle model is required."
        );
    }

    if (!address) {
        throw new Error(
            "Address is required."
        );
    }

    if (!bookingDate) {
        throw new Error(
            "Booking date is required."
        );
    }

    if (!timeSlot) {
        throw new Error(
            "Time slot is required."
        );
    }


    // ==================================================
    // CREATE DATABASE RECORD
    // ==================================================

    const result =
        await inspectionBookingRepository.createBooking(
            bookingData
        );


    return result.insertId;
};


// ======================================================
// GET ALL BOOKINGS
// ======================================================

const getAllBookings = async () => {

    return await inspectionBookingRepository.getAllBookings();

};


// ======================================================
// GET SINGLE BOOKING
// ======================================================

const getBookingById = async (
    bookingId
) => {

    const booking =
        await inspectionBookingRepository.getBookingById(
            bookingId
        );


    if (!booking) {

        throw new Error(
            "Inspection booking not found."
        );

    }


    return booking;
};


// ======================================================
// UPDATE STATUS
// ======================================================

const updateBookingStatus = async (
    bookingId,
    status
) => {

    const allowedStatuses = [
        "Pending",
        "Approved",
        "Rejected"
    ];


    if (
        !allowedStatuses.includes(status)
    ) {

        throw new Error(
            "Invalid booking status."
        );

    }


    const booking =
        await inspectionBookingRepository.getBookingById(
            bookingId
        );


    if (!booking) {

        throw new Error(
            "Inspection booking not found."
        );

    }


    await inspectionBookingRepository.updateBookingStatus(
        bookingId,
        status
    );


    return {
        bookingId,
        status
    };

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