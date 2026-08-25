const express = require("express");

const router = express.Router();

const vehicleController =
    require("../controllers/vehicle.controller");

const vehicleImageRepository =
    require("../repositories/vehicleImage.repository");


// ======================================================
// CONTROLLER SAFETY
// ======================================================

if (!vehicleController) {
    throw new Error(
        "vehicle.controller.js could not be loaded."
    );
}


// ======================================================
// CONTROLLER FUNCTION SAFETY
// ======================================================

const checkController = (
    functionName
) => {

    if (
        typeof vehicleController[functionName] !==
        "function"
    ) {
        return false;
    }

    return true;
};


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

        if (
            req.baseUrl ===
            "/api/admin/vehicles"
        ) {

            if (
                !checkController(
                    "getAllAdminVehicles"
                )
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
                    res,
                    next
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
// IMPORTANT:
// Ye route "/:carId" se PEHLE hona chahiye.
//
// ======================================================

router.get(
    "/published",
    (req, res, next) => {

        if (
            !checkController(
                "getPublishedVehicles"
            )
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
// IMPORTANT:
// Ye route "/:carId" se PEHLE hona chahiye.
//
// ======================================================

router.get(
    "/:carId/inspection-report",
    (req, res, next) => {

        if (
            !checkController(
                "getVehicleInspectionReport"
            )
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
// IMPORTANT:
// Yahan vehicleController.getVehicleImages()
// par depend nahi karenge.
//
// Directly existing
// vehicleImageRepository.getVehicleImages()
// use hoga.
//
// Isse "getVehicleImages controller function is missing"
// wali problem completely remove ho jayegi.
//
// ======================================================

router.get(
    "/:carId/images",
    async (req, res) => {

        try {

            const carId =
                Number(
                    req.params.carId
                );


            // --------------------------------------------------
            // VALIDATE CAR ID
            // --------------------------------------------------

            if (
                !Number.isInteger(carId) ||
                carId <= 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Valid vehicle ID is required."
                });
            }


            // --------------------------------------------------
            // GET IMAGES FROM DATABASE
            // --------------------------------------------------

            const images =
                await vehicleImageRepository
                    .getVehicleImages(
                        carId
                    );


            // --------------------------------------------------
            // NORMALIZE RESULT
            // --------------------------------------------------

            const imageList =
                Array.isArray(images)
                    ? images
                    : [];


            // --------------------------------------------------
            // SUCCESS RESPONSE
            // --------------------------------------------------

            return res.status(200).json({

                success: true,

                message:
                    "Vehicle images fetched successfully.",

                data: {

                    carId: carId,

                    images: imageList

                }

            });

        } catch (error) {

            console.error(
                "GET VEHICLE IMAGES ROUTE ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Failed to fetch vehicle images.",

                error:
                    process.env.NODE_ENV ===
                    "development"
                        ? error.message
                        : undefined

            });

        }

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
// /api/vehicles/30
//
// IMPORTANT:
// Ye route LAST mein hona chahiye,
// kyunki ":carId" generic parameter hai.
//
// ======================================================

router.get(
    "/:carId",
    (req, res, next) => {

        if (
            !checkController(
                "getCompleteVehicleData"
            )
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
// Existing route preserved.
//
// ======================================================

router.get(
    "/",
    (req, res, next) => {

        // --------------------------------------------------
        // ADMIN
        // --------------------------------------------------

        if (
            req.baseUrl ===
            "/api/admin/vehicles"
        ) {

            if (
                !checkController(
                    "getAllAdminVehicles"
                )
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
                    res,
                    next
                );
        }


        // --------------------------------------------------
        // CUSTOMER
        // --------------------------------------------------

        if (
            !checkController(
                "getPublishedVehicles"
            )
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
            !checkController(
                "addVehicle"
            )
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