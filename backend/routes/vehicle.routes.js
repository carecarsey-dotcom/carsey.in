const express = require("express");

const router = express.Router();

const vehicleController =
    require("../controllers/vehicle.controller");


// ======================================================
// CONTROLLER SAFETY
// ======================================================

if (!vehicleController) {
    throw new Error(
        "vehicle.controller.js could not be loaded."
    );
}


// ======================================================
// ADMIN - GET ALL VEHICLES
// ======================================================
//
// GET
// /api/admin/vehicles
//
// ======================================================

router.get(
    "/",
    (req, res, next) => {

        // --------------------------------------------------
        // Admin mounted route
        // --------------------------------------------------

        if (
            req.baseUrl ===
            "/api/admin/vehicles"
        ) {

            if (
                typeof vehicleController
                    .getAllAdminVehicles !==
                "function"
            ) {
                return res.status(500).json({
                    success: false,
                    message:
                        "getAllAdminVehicles controller function is missing."
                });
            }

            return vehicleController
                .getAllAdminVehicles(
                    req,
                    res
                );
        }

        next();
    }
);


// ======================================================
// CUSTOMER - GET PUBLISHED VEHICLES
// ======================================================
//
// GET
// /api/vehicles/published
//
// Customer website ke liye
// Sirf published vehicles
//
// ======================================================

router.get(
    "/published",
    (req, res, next) => {

        if (
            typeof vehicleController
                .getPublishedVehicles !==
            "function"
        ) {
            return res.status(500).json({
                success: false,
                message:
                    "getPublishedVehicles controller function is missing."
            });
        }

        return vehicleController
            .getPublishedVehicles(
                req,
                res,
                next
            );
    }
);


// ======================================================
// CUSTOMER - GET COMPLETE VEHICLE DATA
// ======================================================
//
// GET
// /api/vehicles/:carId
//
// Example:
//
// /api/vehicles/30
//
// ======================================================
//
// IMPORTANT:
// Ye route missing tha.
// Isi wajah se:
//
// GET /api/vehicles/30
//
// Route Not Found aa raha tha.
//
// ======================================================

router.get(
    "/:carId",
    (req, res, next) => {

        if (
            typeof vehicleController
                .getCompleteVehicleData !==
            "function"
        ) {
            return res.status(500).json({
                success: false,
                message:
                    "getCompleteVehicleData controller function is missing."
            });
        }

        return vehicleController
            .getCompleteVehicleData(
                req,
                res,
                next
            );
    }
);


// ======================================================
// CUSTOMER - GET PUBLISHED VEHICLES
// ======================================================
//
// GET
// /api/vehicles
//
// Existing route ko remove nahi kiya gaya.
//
// ======================================================

router.get(
    "/",
    (req, res, next) => {

        if (
            typeof vehicleController
                .getPublishedVehicles !==
            "function"
        ) {
            return res.status(500).json({
                success: false,
                message:
                    "getPublishedVehicles controller function is missing."
            });
        }

        return vehicleController
            .getPublishedVehicles(
                req,
                res,
                next
            );
    }
);


// ======================================================
// CUSTOMER - GET VEHICLE INSPECTION REPORT
// ======================================================
//
// GET
// /api/vehicles/:carId/inspection-report
//
// ======================================================

router.get(
    "/:carId/inspection-report",
    (req, res, next) => {

        if (
            typeof vehicleController
                .getVehicleInspectionReport !==
            "function"
        ) {
            return res.status(500).json({
                success: false,
                message:
                    "getVehicleInspectionReport controller function is missing."
            });
        }

        return vehicleController
            .getVehicleInspectionReport(
                req,
                res,
                next
            );
    }
);


// ======================================================
// CUSTOMER - GET VEHICLE IMAGES
// ======================================================
//
// GET
// /api/vehicles/:carId/images
//
// ======================================================

router.get(
    "/:carId/images",
    (req, res, next) => {

        if (
            typeof vehicleController
                .getVehicleImages !==
            "function"
        ) {
            return res.status(500).json({
                success: false,
                message:
                    "getVehicleImages controller function is missing."
            });
        }

        return vehicleController
            .getVehicleImages(
                req,
                res,
                next
            );
    }
);


// ======================================================
// ADMIN - ADD VEHICLE
// ======================================================
//
// POST
// /api/admin/vehicles
//
// ======================================================

router.post(
    "/",
    (req, res, next) => {

        if (
            typeof vehicleController
                .addVehicle !==
            "function"
        ) {
            return res.status(500).json({
                success: false,
                message:
                    "addVehicle controller function is missing."
            });
        }

        return vehicleController
            .addVehicle(
                req,
                res,
                next
            );
    }
);


// ======================================================
// EXPORT
// ======================================================

module.exports = router;