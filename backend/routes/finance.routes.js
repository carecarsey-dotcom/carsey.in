const express = require("express");

const router = express.Router();


// ======================================================
// CONTROLLER
// ======================================================

const financeController = require(
    "../controllers/finance.controller"
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
// CREATE FINANCE REQUEST
// ======================================================

// POST
// /api/vehicles/:carId/finance
//
// Example:
//
// POST
// http://localhost:5000/api/vehicles/2/finance

router.post(
    "/:carId/finance",
    financeController.createFinanceRequest
);


// ======================================================
// ADMIN
// GET ALL FINANCE REQUESTS
// ======================================================

// GET
// /api/admin/finance-requests

router.get(
    "/finance-requests",
    verifyToken,
    financeController.getAllFinanceRequests
);


// ======================================================
// ADMIN
// GET FINANCE REQUEST BY ID
// ======================================================

// GET
// /api/admin/finance-requests/:financeId

router.get(
    "/finance-requests/:financeId",
    verifyToken,
    financeController.getFinanceRequestById
);


// ======================================================
// ADMIN
// UPDATE FINANCE REQUEST STATUS
// ======================================================

// PATCH
// /api/admin/finance-requests/:financeId/status

router.patch(
    "/finance-requests/:financeId/status",
    verifyToken,
    financeController.updateFinanceRequestStatus
);


// ======================================================
// EXPORT
// ======================================================

module.exports = router;