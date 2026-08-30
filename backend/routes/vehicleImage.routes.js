const express = require("express");

const router = express.Router();

const vehicleImageController =
    require("../controllers/vehicleImage.controller");

const upload =
    require("../middlewares/upload.middleware");

// ======================================================
// UPLOAD VEHICLE IMAGES
// ======================================================

router.post(
    "/:carId/images",
    upload.array(
        "images",
        66
    ),
    vehicleImageController
        .uploadVehicleImages
);

// ======================================================
// GET VEHICLE IMAGES
// ======================================================

router.get(
    "/:carId/images",
    vehicleImageController
        .getVehicleImages
);

// ======================================================
// GET SINGLE VEHICLE IMAGE
// ======================================================

router.get(
    "/:carId/images/:imageId",
    vehicleImageController
        .getVehicleImageById
);

// ======================================================
// UPDATE VEHICLE IMAGE
// ======================================================

router.put(
    "/:carId/images/:imageId",
    upload.single("image"),
    vehicleImageController
        .updateVehicleImage
);

// ======================================================
// DELETE VEHICLE IMAGE
// ======================================================

router.delete(
    "/:carId/images/:imageId",
    vehicleImageController
        .deleteVehicleImage
);

// ======================================================
// SET PRIMARY VEHICLE IMAGE
// ======================================================

router.put(
    "/:carId/images/:imageId/primary",
    vehicleImageController
        .setPrimaryImage
);

// ======================================================
// EXPORT
// ======================================================

module.exports = router;