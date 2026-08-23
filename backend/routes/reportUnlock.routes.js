const express = require("express");

const router = express.Router();


// ======================================================
// CONTROLLER
// ======================================================

const reportUnlockController = require(
    "../controllers/reportUnlock.controller"
);


// ======================================================
// VALIDATOR
// ======================================================

const {
    reportUnlockValidation,
    validateReportUnlock
} = require(
    "../validators/reportUnlock.validator"
);


// ======================================================
// AUTH MIDDLEWARE
// ======================================================

const {
    verifyToken
} = require(
    "../middlewares/auth.middleware"
);


// ======================================================
// CUSTOMER
// CREATE REPORT UNLOCK REQUEST
// ======================================================

// POST
// /api/vehicles/:carId/unlock-report

router.post(
    "/:carId/unlock-report",

    reportUnlockValidation,

    validateReportUnlock,

    reportUnlockController.createReportUnlockRequest
);


// ======================================================
// ADMIN
// GET ALL REQUESTS
// ======================================================

// GET
// /api/admin/report-unlock-requests

router.get(
    "/report-unlock-requests",

    verifyToken,

    reportUnlockController.getReportUnlockRequests
);


// ======================================================
// ADMIN
// UPDATE STATUS
// ======================================================

// PATCH
// /api/admin/report-unlock-requests/:requestId/status

router.patch(
    "/report-unlock-requests/:requestId/status",

    verifyToken,

    reportUnlockController.updateReportUnlockRequestStatus
);


// ======================================================
// EXPORT
// ======================================================

module.exports = router;