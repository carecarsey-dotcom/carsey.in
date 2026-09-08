const inspectionBookingService =
    require(
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
            await
                inspectionBookingService
                    .createBooking(
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
            await
                inspectionBookingService
                    .getAllBookings();


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
            await
                inspectionBookingService
                    .getBookingById(
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
            await
                inspectionBookingService
                    .updateBookingStatus(
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
// ASSIGN INSPECTION TO EMPLOYEE
// ADMIN ONLY
// ======================================================

const assignInspection = async (
    req,
    res
) => {

    try {

        const {
            bookingId
        } = req.params;


        const {
            employeeId
        } = req.body;


        const result =
            await
                inspectionBookingService
                    .assignInspection(
                        bookingId,
                        employeeId
                    );


        return res.status(201).json({

            success: true,

            message:
                "Inspection Assigned Successfully",

            data:
                result

        });

    } catch (error) {

        console.error(
            "Assign Inspection Error:",
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
// GET EMPLOYEE ASSIGNMENTS
// EMPLOYEE ONLY
// ======================================================

const getEmployeeAssignments = async (
    req,
    res
) => {

    try {

        const employeeId =
            req.admin.admin_id;


        const assignments =
            await
                inspectionBookingService
                    .getEmployeeAssignments(
                        employeeId
                    );


        return res.status(200).json({

            success: true,

            message:
                "Employee Inspection Requests Retrieved Successfully",

            data: {

                assignments

            }

        });

    } catch (error) {

        console.error(
            "Get Employee Assignments Error:",
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
// GET INSPECTION REQUEST
// ADMIN / EMPLOYEE
// ======================================================

const getInspectionRequestById = async (
    req,
    res
) => {

    try {

        const {
            requestId
        } = req.params;


        const request =
            await
                inspectionBookingService
                    .getInspectionRequestById(
                        requestId
                    );


        // ==================================================
        // EMPLOYEE SECURITY
        // Employee can only see own request
        // ==================================================

        if (
            req.admin.role === "Employee" &&
            Number(request.employee_id) !==
                Number(req.admin.admin_id)
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Access Denied. This inspection is not assigned to you."

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Inspection Request Retrieved Successfully",

            data: {

                request

            }

        });

    } catch (error) {

        console.error(
            "Get Inspection Request Error:",
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
// EXPORT
// ======================================================

module.exports = {

    createBooking,
    getAllBookings,
    getBookingById,
    updateBookingStatus,

    assignInspection,
    getEmployeeAssignments,
    getInspectionRequestById

};