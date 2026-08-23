const express = require("express");


// ======================================================
// ROUTER
// ======================================================

const router = express.Router();


// ======================================================
// CONTROLLER
// ======================================================

const exchangeController = require(
    "../controllers/exchange.controller"
);


// ======================================================
// MULTER
// ======================================================

const exchangeUpload = require(
    "../middlewares/exchangeUpload.middleware"
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
// CREATE EXCHANGE REQUEST
// ======================================================

// POST
// /api/vehicles/exchange
//
// Form-data:
//
// name
// mobile
// email
// currentBrand
// currentModel
// currentYear
// currentVehiclePrice
// preferredBrand
// preferredModel
// preferredVariant
// budget
// vehicleImage

router.post(
    "/exchange",
    exchangeUpload.single("vehicleImage"),
    exchangeController.createExchangeRequest
);


// ======================================================
// ADMIN
// GET ALL EXCHANGE REQUESTS
// ======================================================

// GET
// /api/admin/exchange-requests

router.get(
    "/exchange-requests",
    verifyToken,
    exchangeController.getAllExchangeRequests
);


// ======================================================
// ADMIN
// GET EXCHANGE REQUEST BY ID
// ======================================================

// GET
// /api/admin/exchange-requests/:exchangeId

router.get(
    "/exchange-requests/:exchangeId",
    verifyToken,
    exchangeController.getExchangeRequestById
);


// ======================================================
// ADMIN
// UPDATE EXCHANGE REQUEST STATUS
// ======================================================

// PATCH
// /api/admin/exchange-requests/:exchangeId/status
//
// Body:
//
// {
//     "status": "Approved"
// }
//
// OR
//
// {
//     "status": "Rejected"
// }

router.patch(
    "/exchange-requests/:exchangeId/status",
    verifyToken,
    exchangeController.updateExchangeRequestStatus
);


// ======================================================
// EXPORT
// ======================================================

module.exports = router;