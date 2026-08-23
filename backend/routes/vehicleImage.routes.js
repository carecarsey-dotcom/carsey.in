const express =
    require("express");

const router =
    express.Router();


const vehicleImageController =
    require("../controllers/vehicleImage.controller");


const upload =
    require("../middlewares/upload.middleware");


// ======================================================
// UPLOAD VEHICLE IMAGES
// ======================================================
//
// POST
// /api/admin/vehicles/:carId/images
//
// Field name:
//
// images
//
// Maximum:
//
// 10 images
//
// ======================================================

router.post(

    "/:carId/images",

    upload.array(
        "images",
        10
    ),

    vehicleImageController
        .uploadVehicleImages

);


// ======================================================
// GET VEHICLE IMAGES
// ======================================================
//
// GET
// /api/admin/vehicles/:carId/images
//
// ======================================================

router.get(

    "/:carId/images",

    vehicleImageController
        .getVehicleImages

);


// ======================================================
// GET SINGLE VEHICLE IMAGE
// ======================================================
//
// GET
// /api/admin/vehicles/:carId/images/:imageId
//
// ======================================================

router.get(

    "/:carId/images/:imageId",

    vehicleImageController
        .getVehicleImageById

);


// ======================================================
// UPDATE VEHICLE IMAGE
// ======================================================
//
// PUT
// /api/admin/vehicles/:carId/images/:imageId
//
// Existing image information can be updated.
//
// If a new file is supplied:
//
// form-data field:
//
// image
//
// Other fields:
//
// imageType
// isPrimary
//
// ======================================================

router.put(

    "/:carId/images/:imageId",

    upload.single(
        "image"
    ),

    vehicleImageController
        .updateVehicleImage

);


// ======================================================
// DELETE VEHICLE IMAGE
// ======================================================
//
// DELETE
// /api/admin/vehicles/:carId/images/:imageId
//
// ======================================================

router.delete(

    "/:carId/images/:imageId",

    vehicleImageController
        .deleteVehicleImage

);


// ======================================================
// SET PRIMARY VEHICLE IMAGE
// ======================================================
//
// PUT
// /api/admin/vehicles/:carId/images/:imageId/primary
//
// ======================================================

router.put(

    "/:carId/images/:imageId/primary",

    vehicleImageController
        .setPrimaryImage

);


// ======================================================
// EXPORT
// ======================================================

module.exports =
    router;