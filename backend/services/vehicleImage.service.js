const vehicleImageRepository =
    require("../repositories/vehicleImage.repository");


// ======================================================
// ALLOWED IMAGE TYPES
// ======================================================
// Must exactly match car_images.image_type ENUM
// ======================================================

const ALLOWED_IMAGE_TYPES = [
    "Exterior Front Photo",
    "Engine Photo",
    "Exterior LHS Photo",
    "Dicky Boot",
    "Open Dickey",
    "Exterior RHS Photo",
    "Interior Photo",
    "Interior RHS",
    "Interior LHS",
    "Rear Right",
    "Rear Left"
];


// ======================================================
// ADD IMAGE
// ======================================================

const addVehicleImage = async (
    carId,
    imageType,
    imagePath,
    isPrimary
) => {

    if (!carId) {
        throw new Error(
            "Valid vehicle ID is required."
        );
    }

    if (!imageType) {
        throw new Error(
            "Image type is required."
        );
    }

    if (
        !ALLOWED_IMAGE_TYPES.includes(
            imageType
        )
    ) {
        throw new Error(
            `Invalid image type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(", ")}`
        );
    }

    if (!imagePath) {
        throw new Error(
            "Image path is required."
        );
    }

    // --------------------------------------------------
    // If new image is primary, remove primary from
    // existing images first.
    // --------------------------------------------------

    if (isPrimary) {

        await vehicleImageRepository
            .clearPrimaryImage(
                carId
            );
    }

    return await vehicleImageRepository
        .addVehicleImage(
            carId,
            imageType,
            imagePath,
            isPrimary
        );
};


// ======================================================
// GET IMAGES
// ======================================================

const getVehicleImages = async (
    carId
) => {

    if (!carId) {
        throw new Error(
            "Valid vehicle ID is required."
        );
    }

    return await vehicleImageRepository
        .getVehicleImages(
            carId
        );
};


// ======================================================
// GET SINGLE IMAGE
// ======================================================

const getVehicleImageById = async (
    imageId,
    carId
) => {

    if (!imageId) {
        throw new Error(
            "Valid image ID is required."
        );
    }

    if (!carId) {
        throw new Error(
            "Valid vehicle ID is required."
        );
    }

    return await vehicleImageRepository
        .getVehicleImageById(
            imageId,
            carId
        );
};


// ======================================================
// UPDATE IMAGE
// ======================================================

const updateVehicleImage = async (
    imageId,
    carId,
    imageType,
    imagePath,
    isPrimary
) => {

    if (!imageId) {
        throw new Error(
            "Valid image ID is required."
        );
    }

    if (!carId) {
        throw new Error(
            "Valid vehicle ID is required."
        );
    }

    if (!imageType) {
        throw new Error(
            "Image type is required."
        );
    }

    if (
        !ALLOWED_IMAGE_TYPES.includes(
            imageType
        )
    ) {
        throw new Error(
            `Invalid image type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(", ")}`
        );
    }

    /*
     * imagePath optional rakha gaya hai.
     *
     * Agar edit vehicle me sirf image type / primary change
     * ho raha hai aur nayi file upload nahi hui hai,
     * existing image path repository/database se preserve
     * kiya ja sakta hai.
     */

    if (isPrimary) {

        await vehicleImageRepository
            .clearPrimaryImage(
                carId
            );
    }

    return await vehicleImageRepository
        .updateVehicleImage(
            imageId,
            carId,
            imageType,
            imagePath || null,
            isPrimary
        );
};


// ======================================================
// DELETE IMAGE
// ======================================================

const deleteVehicleImage = async (
    imageId,
    carId
) => {

    if (!imageId) {
        throw new Error(
            "Valid image ID is required."
        );
    }

    if (!carId) {
        throw new Error(
            "Valid vehicle ID is required."
        );
    }

    return await vehicleImageRepository
        .deleteVehicleImage(
            imageId,
            carId
        );
};


// ======================================================
// DELETE ALL IMAGES
// ======================================================

const deleteVehicleImages = async (
    carId
) => {

    if (!carId) {
        throw new Error(
            "Valid vehicle ID is required."
        );
    }

    return await vehicleImageRepository
        .deleteVehicleImages(
            carId
        );
};


// ======================================================
// SET PRIMARY IMAGE
// ======================================================

const setPrimaryImage = async (
    imageId,
    carId
) => {

    if (!imageId) {
        throw new Error(
            "Valid image ID is required."
        );
    }

    if (!carId) {
        throw new Error(
            "Valid vehicle ID is required."
        );
    }

    // --------------------------------------------------
    // First remove primary from all images of vehicle
    // --------------------------------------------------

    await vehicleImageRepository
        .clearPrimaryImage(
            carId
        );

    // --------------------------------------------------
    // Then make selected image primary
    // --------------------------------------------------

    return await vehicleImageRepository
        .setPrimaryImage(
            imageId,
            carId
        );
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    addVehicleImage,

    getVehicleImages,

    getVehicleImageById,

    updateVehicleImage,

    deleteVehicleImage,

    deleteVehicleImages,

    setPrimaryImage,

    ALLOWED_IMAGE_TYPES
};