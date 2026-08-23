const express =
    require("express");

const router =
    express.Router();

const controller =
    require("../controllers/editVehicle.controller");



// ======================================================
// GET SINGLE VEHICLE
// ======================================================
//
// GET
// /api/admin/vehicles/:carId
//
// ======================================================

router.get(
    "/:carId",
    controller.getVehicleById
);



// ======================================================
// UPDATE VEHICLE
// ======================================================
//
// PUT
// /api/admin/vehicles/:carId
//
// ======================================================

router.put(
    "/:carId",
    controller.updateVehicle
);



// ======================================================
// EXPORT
// ======================================================

module.exports =
    router;