const express = require("express");

const loanController = require(
    "../controllers/loan.controller"
);

const {
    verifyToken
} = require(
    "../middlewares/auth.middleware"
);

const router = express.Router();


// ======================================================
// CUSTOMER LOAN ELIGIBILITY
// PUBLIC
// ======================================================

// POST
// /api/vehicles/loan-eligibility

router.post(
    "/loan-eligibility",
    loanController.createLoanRequest
);


// ======================================================
// ADMIN LOAN REQUESTS
// PROTECTED
// ======================================================

// GET
// /api/admin/loan-requests

router.get(
    "/loan-requests",
    verifyToken,
    loanController.getAllLoanRequests
);


// ======================================================
// ADMIN SINGLE LOAN REQUEST
// PROTECTED
// ======================================================

// GET
// /api/admin/loan-requests/:loanId

router.get(
    "/loan-requests/:loanId",
    verifyToken,
    loanController.getLoanRequestById
);


// ======================================================
// ADMIN APPROVE / REJECT
// PROTECTED
// ======================================================

// PATCH
// /api/admin/loan-requests/:loanId/status

router.patch(
    "/loan-requests/:loanId/status",
    verifyToken,
    loanController.updateLoanRequestStatus
);


// ======================================================
// EXPORT
// ======================================================

module.exports = router;