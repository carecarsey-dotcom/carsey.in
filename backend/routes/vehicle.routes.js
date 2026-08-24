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

        // --------------------------------------------------
        // Admin mounted route
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
// Ye route "/:carId" se PEHLE hona chahiye.
//
// ======================================================

router.get(
    "/:carId/images",
    (req, res, next) => {

        if (
            !checkController(
                "getVehicleImages"
            )
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
// IMPORTANT:
// Isko "/:carId" ke BAAD nahi rakhna chahiye,
// warna "/" request ke flow mein confusion ho sakta hai.
//
// ======================================================

router.get(
    "/",
    (req, res, next) => {

        // --------------------------------------------------
        // IMPORTANT
        // --------------------------------------------------
        //
        // Agar router /api/admin/vehicles par mounted hai,
        // to upar wala admin handler request handle karega.
        //
        // Agar router /api/vehicles par mounted hai,
        // to customer published vehicles return honge.
        //
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