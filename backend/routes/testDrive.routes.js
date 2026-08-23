const express = require("express");

const router = express.Router();


// ======================================================
// CONTROLLER
// ======================================================

const testDriveController = require(
    "../controllers/testDrive.controller"
);


// ======================================================
// VALIDATOR
// ======================================================

const {
    validateTestDriveRequest
} = require(
    "../validators/testDrive.validator"
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
// CREATE TEST DRIVE REQUEST
// ======================================================

// POST
// /api/vehicles/:carId/test-drive

router.post(

    "/:carId/test-drive",

    validateTestDriveRequest,

    testDriveController.createTestDriveRequest

);


// ======================================================
// ADMIN
// GET ALL TEST DRIVE REQUESTS
// ======================================================

// GET
// /api/admin/test-drive-requests

router.get(

    "/test-drive-requests",

    verifyToken,

    testDriveController.getAllTestDriveRequests

);


// ======================================================
// ADMIN
// GET TEST DRIVE REQUEST BY ID
// ======================================================

// GET
// /api/admin/test-drive-requests/:requestId

router.get(

    "/test-drive-requests/:requestId",

    verifyToken,

    testDriveController.getTestDriveRequestById

);


// ======================================================
// ADMIN
// UPDATE STATUS
// ======================================================

// PATCH
// /api/admin/test-drive-requests/:requestId/status

router.patch(

    "/test-drive-requests/:requestId/status",

    verifyToken,

    testDriveController.updateTestDriveStatus

);


// ======================================================
// EXPORT
// ======================================================

module.exports = router;