const vehicleImageRepository =
    require("../repositories/vehicleImage.repository");


// ======================================================
// ALLOWED IMAGE TYPES
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

    return await vehicleImageRepository
        .addVehicleImage(
            carId,
            imageType,
            imagePath,
            Boolean(isPrimary)
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

    const images =
        await vehicleImageRepository
            .getVehicleImages(
                carId
            );

    return Array.isArray(images)
        ? images
        : [];
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

    return await vehicleImageRepository
        .updateVehicleImage(
            imageId,
            carId,
            imageType,
            imagePath || null,
            Boolean(isPrimary)
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