const express = require("express");

const router = express.Router();


// ======================================================
// CONTROLLER
// ======================================================

const sellCarController = require(
    "../controllers/sellCar.controller"
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
// MULTER MIDDLEWARE
// ======================================================

const {
    uploadSellCarImages
} = require(
    "../middlewares/sellCarUpload.middleware"
);


// ======================================================
// CUSTOMER
// CREATE SELL CAR REQUEST
// ======================================================

// POST
// /api/vehicles/sell-car
//
// Content-Type:
// multipart/form-data
//
// Image fields:
//
// frontImage
// backImage
// leftImage
// rightImage

router.post(

    "/sell-car",

    uploadSellCarImages.fields([

        {
            name: "frontImage",
            maxCount: 1
        },

        {
            name: "backImage",
            maxCount: 1
        },

        {
            name: "leftImage",
            maxCount: 1
        },

        {
            name: "rightImage",
            maxCount: 1
        }

    ]),

    sellCarController.createSellCarRequest

);


// ======================================================
// ADMIN
// GET ALL SELL CAR REQUESTS
// ======================================================

// GET
// /api/admin/sell-car-requests

router.get(

    "/sell-car-requests",

    verifyToken,

    sellCarController.getAllSellCarRequests

);


// ======================================================
// ADMIN
// GET SELL CAR REQUEST BY ID
// ======================================================

// GET
// /api/admin/sell-car-requests/:sellId

router.get(

    "/sell-car-requests/:sellId",

    verifyToken,

    sellCarController.getSellCarRequestById

);


// ======================================================
// ADMIN
// UPDATE SELL CAR REQUEST STATUS
// ======================================================

// PATCH
// /api/admin/sell-car-requests/:sellId/status

router.patch(

    "/sell-car-requests/:sellId/status",

    verifyToken,

    sellCarController.updateSellCarRequestStatus

);


// ======================================================
// EXPORT
// ======================================================

module.exports = router;