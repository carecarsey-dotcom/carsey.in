const express = require("express");

const router =
    express.Router();

const vehicleController =
    require("../controllers/vehicle.controller");


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

        // ----------------------------------------------
        // Admin mounted route
        // ----------------------------------------------

        if (
            req.baseUrl ===
            "/api/admin/vehicles"
        ) {

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
    vehicleController
        .getPublishedVehicles
);


// ======================================================
// CUSTOMER - GET PUBLISHED VEHICLES
// ======================================================
//
// GET
// /api/vehicles
//
// Existing route ko remove nahi kiya gaya.
// ======================================================

router.get(
    "/",
    vehicleController
        .getPublishedVehicles
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
    vehicleController
        .addVehicle
);


// ======================================================
// EXPORT
// ======================================================

module.exports = router;