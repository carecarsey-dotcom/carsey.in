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
// EXISTING IMAGE FIELDS:
// frontImage
// backImage
// leftImage
// rightImage
//
// NEW IMAGE FIELDS:
// interiorFrontImage
// interiorRearImage
// openDickyImage
// openBonnetImage
// odometerImage
// dashboardImage

router.post(

    "/sell-car",

    uploadSellCarImages.fields([

        // EXISTING IMAGES

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
        },


        // NEW IMAGE FIELDS

        {
            name: "interiorFrontImage",
            maxCount: 1
        },

        {
            name: "interiorRearImage",
            maxCount: 1
        },

        {
            name: "openDickyImage",
            maxCount: 1
        },

        {
            name: "openBonnetImage",
            maxCount: 1
        },

        {
            name: "odometerImage",
            maxCount: 1
        },

        {
            name: "dashboardImage",
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