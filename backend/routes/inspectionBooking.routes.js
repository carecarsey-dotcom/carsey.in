const express = require("express");

const inspectionBookingController =
    require(
        "../controllers/inspectionBooking.controller"
    );

const {
    verifyToken
} = require(
    "../middlewares/auth.middleware"
);

const router = express.Router();


// ======================================================
// CUSTOMER
// PUBLIC
// ======================================================

// POST
// /api/vehicles/book-inspection

router.post(
    "/book-inspection",
    inspectionBookingController.createBooking
);


// ======================================================
// ADMIN
// PROTECTED
// ======================================================

// GET ALL
//
// /api/admin/inspection-bookings

router.get(
    "/inspection-bookings",
    verifyToken,
    inspectionBookingController.getAllBookings
);


// ======================================================
// ADMIN SINGLE
// ======================================================

// GET
//
// /api/admin/inspection-bookings/:bookingId

router.get(
    "/inspection-bookings/:bookingId",
    verifyToken,
    inspectionBookingController.getBookingById
);


// ======================================================
// ADMIN APPROVE / REJECT
// ======================================================

// PATCH
//
// /api/admin/inspection-bookings/:bookingId/status

router.patch(
    "/inspection-bookings/:bookingId/status",
    verifyToken,
    inspectionBookingController.updateBookingStatus
);


// ======================================================
// EXPORT
// ======================================================

module.exports = router;