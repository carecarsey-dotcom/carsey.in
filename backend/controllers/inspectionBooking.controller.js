const inspectionBookingService = require(
    "../services/inspectionBooking.service"
);


// ======================================================
// CREATE BOOKING
// ======================================================

const createBooking = async (
    req,
    res
) => {

    try {

        const bookingId =
            await inspectionBookingService.createBooking(
                req.body
            );


        return res.status(201).json({

            success: true,

            message:
                "Inspection Booking Submitted Successfully",

            data: {

                bookingId,

                message:
                    "Inspection booking submitted successfully."

            }

        });

    } catch (error) {

        console.error(
            "Create Inspection Booking Error:",
            error
        );


        return res.status(400).json({

            success: false,

            message:
                error.message

        });

    }

};


// ======================================================
// GET ALL BOOKINGS
// ======================================================

const getAllBookings = async (
    req,
    res
) => {

    try {

        const bookings =
            await inspectionBookingService.getAllBookings();


        return res.status(200).json({

            success: true,

            message:
                "Inspection Bookings Retrieved Successfully",

            data: {

                bookings

            }

        });

    } catch (error) {

        console.error(
            "Get Inspection Bookings Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

};


// ======================================================
// GET SINGLE BOOKING
// ======================================================

const getBookingById = async (
    req,
    res
) => {

    try {

        const {
            bookingId
        } = req.params;


        const booking =
            await inspectionBookingService.getBookingById(
                bookingId
            );


        return res.status(200).json({

            success: true,

            message:
                "Inspection Booking Retrieved Successfully",

            data: {

                booking

            }

        });

    } catch (error) {

        console.error(
            "Get Inspection Booking Error:",
            error
        );


        return res.status(404).json({

            success: false,

            message:
                error.message

        });

    }

};


// ======================================================
// UPDATE STATUS
// ======================================================

const updateBookingStatus = async (
    req,
    res
) => {

    try {

        const {
            bookingId
        } = req.params;


        const {
            status
        } = req.body;


        const result =
            await inspectionBookingService.updateBookingStatus(
                bookingId,
                status
            );


        return res.status(200).json({

            success: true,

            message:
                "Inspection Booking Status Updated Successfully",

            data: {

                bookingId:
                    result.bookingId,

                status:
                    result.status,

                message:
                    "Inspection booking status updated successfully."

            }

        });

    } catch (error) {

        console.error(
            "Update Inspection Booking Status Error:",
            error
        );


        return res.status(400).json({

            success: false,

            message:
                error.message

        });

    }

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