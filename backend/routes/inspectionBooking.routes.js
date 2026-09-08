const express =
    require("express");


const inspectionBookingController =
    require(
        "../controllers/inspectionBooking.controller"
    );


const {
    verifyToken,
    requireAdmin,
    requireEmployee,
    requireAdminOrEmployee
} = require(
    "../middlewares/auth.middleware"
);


const router =
    express.Router();


// ======================================================
// CUSTOMER
// PUBLIC
// ======================================================


// ------------------------------------------------------
// POST
// /api/vehicles/book-inspection
// ------------------------------------------------------

router.post(
    "/book-inspection",
    inspectionBookingController.createBooking
);


// ======================================================
// EMPLOYEE
// PROTECTED
// ======================================================


// ------------------------------------------------------
// GET EMPLOYEE ASSIGNMENTS
//
// IMPORTANT:
// Ye route /:bookingId se PEHLE hona chahiye.
//
// /api/admin/inspection-bookings/employee/my-requests
//
// Employee token se sirf usi employee ke requests milenge.
// ------------------------------------------------------

router.get(
    "/inspection-bookings/employee/my-requests",
    verifyToken,
    requireEmployee,
    inspectionBookingController.getEmployeeAssignments
);


// ------------------------------------------------------
// GET INSPECTION REQUEST
//
// /api/admin/inspection-bookings/request/:requestId
//
// Admin + Employee dono access kar sakte hain.
// Employee sirf apna request dekh sakta hai.
// ------------------------------------------------------

router.get(
    "/inspection-bookings/request/:requestId",
    verifyToken,
    requireAdminOrEmployee,
    inspectionBookingController.getInspectionRequestById
);


// ======================================================
// ADMIN
// PROTECTED
// ======================================================


// ------------------------------------------------------
// GET ALL
// /api/admin/inspection-bookings
// ------------------------------------------------------

router.get(
    "/inspection-bookings",
    verifyToken,
    requireAdmin,
    inspectionBookingController.getAllBookings
);


// ------------------------------------------------------
// GET SINGLE
// /api/admin/inspection-bookings/:bookingId
// ------------------------------------------------------

router.get(
    "/inspection-bookings/:bookingId",
    verifyToken,
    requireAdmin,
    inspectionBookingController.getBookingById
);


// ------------------------------------------------------
// ADMIN APPROVE / REJECT BOOKING
//
// PATCH
// /api/admin/inspection-bookings/:bookingId/status
// ------------------------------------------------------

router.patch(
    "/inspection-bookings/:bookingId/status",
    verifyToken,
    requireAdmin,
    inspectionBookingController.updateBookingStatus
);


// ------------------------------------------------------
// ADMIN ASSIGN INSPECTION
//
// POST
// /api/admin/inspection-bookings/:bookingId/assign
// ------------------------------------------------------

router.post(
    "/inspection-bookings/:bookingId/assign",
    verifyToken,
    requireAdmin,
    inspectionBookingController.assignInspection
);


// ======================================================
// EXPORT
// ======================================================

module.exports = router;