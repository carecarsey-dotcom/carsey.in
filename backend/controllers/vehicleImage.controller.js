const vehicleImageService =
    require("../services/vehicleImage.service");


// ======================================================
// VEHICLE SERVICE
// ======================================================
// IMPORTANT:
// Final inspection PDF must NOT be generated while
// uploading vehicle images.
//
// PDF generation must happen only from the vehicle
// publish flow, after the vehicle has actually been
// published.
// ======================================================

const vehicleService =
    require("../services/vehicle.service");


// ======================================================
// STRICT ID VALIDATION
// ======================================================
// Prevent invalid, zero, negative, decimal and NaN IDs
// from reaching the service/repository layer.
// ======================================================

const isValidPositiveInteger = (value) => {
    const numberValue = Number(value);

    return (
        Number.isInteger(numberValue) &&
        numberValue > 0
    );
};


// ======================================================
// DATABASE IMAGE TYPES
// ======================================================

const imageTypes = [

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
// FRONTEND IMAGE TYPE MAPPING
// ======================================================

const normalizeImageType = (
    imageType
) => {

    if (!imageType) {

        return "Exterior Front Photo";

    }


    const map = {

        "Front":
            "Exterior Front Photo",

        "Back":
            "Rear Left",

        "Left":
            "Exterior LHS Photo",

        "Right":
            "Exterior RHS Photo",

        "Interior":
            "Interior Photo",

        "Engine":
            "Engine Photo",

        "Dashboard":
            "Interior Photo",

        "Documents":
            "Dicky Boot",

        "Other":
            "Interior Photo"

    };


    if (
        imageTypes.includes(
            imageType
        )
    ) {

        return imageType;

    }


    return (
        map[imageType] ||
        "Exterior Front Photo"
    );

};


// ======================================================
// UPLOAD VEHICLE IMAGES
// ======================================================

const uploadVehicleImages = async (
    req,
    res
) => {

    try {

        const carId =
            Number(
                req.params.carId
            );


        if (!isValidPositiveInteger(carId)) {

            return res.status(400).json({

                success: false,

                message:
                    "Valid vehicle ID is required."

            });

        }


        if (
            !req.files ||
            req.files.length === 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please select at least one image."

            });

        }


        const uploadedImages = [];


        // ==================================================
        // SAVE EACH IMAGE
        // ==================================================

        for (
            let index = 0;
            index < req.files.length;
            index++
        ) {

            const file =
                req.files[index];


            const requestedType =
                req.body[
                    `imageType_${index}`
                ] ||
                imageTypes[index] ||
                "Exterior Front Photo";


            const safeImageType =
                normalizeImageType(
                    requestedType
                );


            const imagePath =
                `/uploads/vehicles/${file.filename}`;


            const isPrimary =
                index === 0;


            /*
             * If this upload is primary,
             * clear old primary image first.
             */

            if (isPrimary) {

                const existingImages =
                    await vehicleImageService
                        .getVehicleImages(
                            carId
                        );


                const hasPrimary =
                    Array.isArray(existingImages) &&
                    existingImages.some(
                        image =>
                            Number(
                                image.is_primary
                            ) === 1
                    );


                if (hasPrimary) {

                    const repository =
                        require(
                            "../repositories/vehicleImage.repository"
                        );


                    await repository
                        .clearPrimaryImage(
                            carId
                        );

                }

            }


            const imageId =
                await vehicleImageService
                    .addVehicleImage(
                        carId,
                        safeImageType,
                        imagePath,
                        isPrimary
                    );


            uploadedImages.push({

                imageId,

                carId,

                imageType:
                    safeImageType,

                imagePath,

                isPrimary

            });

        }


        // ==================================================
        // VERIFY ALL IMAGES FROM DATABASE
        // ==================================================
        //
        // IMPORTANT:
        //
        // Do NOT generate the PDF here.
        //
        // Images are only saved and verified here.
        //
        // The final PDF must be generated by the vehicle
        // publish flow only.
        //
        // ==================================================

        let savedVehicleImages = [];


        try {

            savedVehicleImages =
                await vehicleImageService
                    .getVehicleImages(
                        carId
                    );

        } catch (imageFetchError) {

            console.error(
                "Vehicle Images Verification Error:",
                imageFetchError
            );


            savedVehicleImages = [];

        }


        if (
            !Array.isArray(
                savedVehicleImages
            )
        ) {

            savedVehicleImages = [];

        }


        // ==================================================
        // FINAL SAFETY VALIDATION
        // ==================================================
        //
        // Make sure every returned image belongs to the
        // current vehicle.
        //
        // ==================================================

        savedVehicleImages =
            savedVehicleImages.filter(
                image => {

                    if (!image) {
                        return false;
                    }


                    if (
                        image.car_id === null ||
                        image.car_id === undefined
                    ) {

                        return false;

                    }


                    return (
                        Number(
                            image.car_id
                        ) === carId
                    );

                }
            );


        // ==================================================
        // DEBUG
        // ==================================================

        console.log(
            "========================================"
        );

        console.log(
            "VEHICLE IMAGES SAVED"
        );

        console.log(
            "Vehicle ID:",
            carId
        );

        console.log(
            "Uploaded Images:",
            uploadedImages.length
        );

        console.log(
            "Database Images:",
            savedVehicleImages.length
        );

        console.log(
            "PDF Generation:",
            "SKIPPED - WAITING FOR VEHICLE PUBLISH"
        );

        console.log(
            "========================================"
        );


        savedVehicleImages.forEach(
            (
                image,
                index
            ) => {

                console.log(

                    `Image ${index + 1}:`,

                    image.image_path ||
                    image.imagePath ||
                    image.path ||
                    "NO IMAGE PATH"

                );

                console.log(
                    `Image ${index + 1} Vehicle ID:`,
                    image.car_id
                );

                console.log(
                    `Image ${index + 1} Type:`,
                    image.image_type
                );

            }
        );


        // ==================================================
        // RESPONSE
        // ==================================================
        //
        // IMPORTANT:
        //
        // Do NOT return pdfGenerated: true.
        //
        // PDF is NOT generated during image upload.
        //
        // Vehicle publish flow will generate the final PDF.
        //
        // ==================================================

        return res.status(201).json({

            success: true,

            message:
                "Vehicle images uploaded successfully. Final inspection PDF will be generated after vehicle publication.",

            data: {

                carId,

                images:
                    uploadedImages,

                pdfGenerated:
                    false,

                pdfPending:
                    true,

                pdfGenerationStage:
                    "vehicle_publish",

                imageCount:
                    savedVehicleImages.length

            }

        });


    } catch (error) {

        console.error(
            "Upload Vehicle Images Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to upload vehicle images."

        });

    }

};


// ======================================================
// GET VEHICLE IMAGES
// ======================================================

const getVehicleImages = async (
    req,
    res
) => {

    try {

        const carId =
            Number(
                req.params.carId
            );


        if (!isValidPositiveInteger(carId)) {

            return res.status(400).json({

                success: false,

                message:
                    "Valid vehicle ID is required."

            });

        }


        const images =
            await vehicleImageService
                .getVehicleImages(
                    carId
                );


        // ==================================================
        // SAFETY FILTER
        // ==================================================
        //
        // Never return images belonging to another vehicle.
        //
        // ==================================================

        const validImages =
            Array.isArray(images)
                ? images.filter(
                    image => {

                        if (!image) {
                            return false;
                        }


                        if (
                            image.car_id === null ||
                            image.car_id === undefined
                        ) {

                            return false;

                        }


                        return (
                            Number(
                                image.car_id
                            ) === carId
                        );

                    }
                )
                : [];


        return res.status(200).json({

            success: true,

            message:
                "Vehicle images fetched successfully.",

            data: {

                carId,

                images:
                    validImages

            }

        });


    } catch (error) {

        console.error(
            "GET VEHICLE IMAGES ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to fetch vehicle images."

        });

    }

};


// ======================================================
// GET SINGLE IMAGE
// ======================================================

const getVehicleImageById = async (
    req,
    res
) => {

    try {

        const carId =
            Number(
                req.params.carId
            );


        const imageId =
            Number(
                req.params.imageId
            );


        if (!isValidPositiveInteger(carId)) {

            return res.status(400).json({

                success: false,

                message:
                    "Valid vehicle ID is required."

            });

        }


        if (!isValidPositiveInteger(imageId)) {

            return res.status(400).json({

                success: false,

                message:
                    "Valid image ID is required."

            });

        }


        const image =
            await vehicleImageService
                .getVehicleImageById(
                    imageId,
                    carId
                );


        if (!image) {

            return res.status(404).json({

                success: false,

                message:
                    "Vehicle image not found."

            });

        }


        // ==================================================
        // SAFETY VALIDATION
        // ==================================================

        if (
            !image.car_id ||
            Number(image.car_id) !== carId
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Vehicle image does not belong to this vehicle."

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Vehicle image fetched successfully.",

            data:
                image

        });


    } catch (error) {

        console.error(
            "Get Vehicle Image Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to fetch vehicle image."

        });

    }

};


// ======================================================
// UPDATE VEHICLE IMAGE
// ======================================================

const updateVehicleImage = async (
    req,
    res
) => {

    try {

        const carId =
            Number(
                req.params.carId
            );


        const imageId =
            Number(
                req.params.imageId
            );


        if (!isValidPositiveInteger(carId)) {

            return res.status(400).json({

                success: false,

                message:
                    "Valid vehicle ID is required."

            });

        }


        if (!isValidPositiveInteger(imageId)) {

            return res.status(400).json({

                success: false,

                message:
                    "Valid image ID is required."

            });

        }


        const existingImage =
            await vehicleImageService
                .getVehicleImageById(
                    imageId,
                    carId
                );


        if (!existingImage) {

            return res.status(404).json({

                success: false,

                message:
                    "Vehicle image not found."

            });

        }


        // ==================================================
        // OWNERSHIP VALIDATION
        // ==================================================

        if (
            !existingImage.car_id ||
            Number(existingImage.car_id) !== carId
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Vehicle image does not belong to this vehicle."

            });

        }


        let imageType =
            req.body.imageType ||
            existingImage.image_type;


        imageType =
            normalizeImageType(
                imageType
            );


        let imagePath =
            existingImage.image_path;


        /*
         * If a new image file is uploaded,
         * use the new file path.
         */

        if (
            req.file
        ) {

            imagePath =
                `/uploads/vehicles/${req.file.filename}`;

        }


        const isPrimary =
            req.body.isPrimary === true ||
            req.body.isPrimary === "true" ||
            Number(
                req.body.isPrimary
            ) === 1;


        const result =
            await vehicleImageService
                .updateVehicleImage(
                    imageId,
                    carId,
                    imageType,
                    imagePath,
                    isPrimary
                );


        return res.status(200).json({

            success: true,

            message:
                "Vehicle image updated successfully.",

            data: {

                ...result,

                imageId,

                carId,

                imageType,

                imagePath,

                isPrimary

            }

        });


    } catch (error) {

        console.error(
            "Update Vehicle Image Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to update vehicle image."

        });

    }

};


// ======================================================
// DELETE VEHICLE IMAGE
// ======================================================

const deleteVehicleImage = async (
    req,
    res
) => {

    try {

        const carId =
            Number(
                req.params.carId
            );


        const imageId =
            Number(
                req.params.imageId
            );


        if (!isValidPositiveInteger(carId)) {

            return res.status(400).json({

                success: false,

                message:
                    "Valid vehicle ID is required."

            });

        }


        if (!isValidPositiveInteger(imageId)) {

            return res.status(400).json({

                success: false,

                message:
                    "Valid image ID is required."

            });

        }


        // ==================================================
        // VERIFY IMAGE BELONGS TO VEHICLE
        // ==================================================

        const existingImage =
            await vehicleImageService
                .getVehicleImageById(
                    imageId,
                    carId
                );


        if (!existingImage) {

            return res.status(404).json({

                success: false,

                message:
                    "Vehicle image not found."

            });

        }


        const result =
            await vehicleImageService
                .deleteVehicleImage(
                    imageId,
                    carId
                );


        if (
            !result ||
            Number(
                result.affectedRows
            ) === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Vehicle image not found."

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Vehicle image deleted successfully.",

            data:
                result

        });


    } catch (error) {

        console.error(
            "Delete Vehicle Image Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to delete vehicle image."

        });

    }

};


// ======================================================
// SET PRIMARY IMAGE
// ======================================================

const setPrimaryImage = async (
    req,
    res
) => {

    try {

        const carId =
            Number(
                req.params.carId
            );


        const imageId =
            Number(
                req.params.imageId
            );


        if (!isValidPositiveInteger(carId)) {

            return res.status(400).json({

                success: false,

                message:
                    "Valid vehicle ID is required."

            });

        }


        if (!isValidPositiveInteger(imageId)) {

            return res.status(400).json({

                success: false,

                message:
                    "Valid image ID is required."

            });

        }


        // ==================================================
        // VERIFY IMAGE BELONGS TO VEHICLE
        // ==================================================

        const image =
            await vehicleImageService
                .getVehicleImageById(
                    imageId,
                    carId
                );


        if (!image) {

            return res.status(404).json({

                success: false,

                message:
                    "Vehicle image not found."

            });

        }


        if (
            !image.car_id ||
            Number(image.car_id) !== carId
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Vehicle image does not belong to this vehicle."

            });

        }


        const result =
            await vehicleImageService
                .setPrimaryImage(
                    imageId,
                    carId
                );


        return res.status(200).json({

            success: true,

            message:
                "Primary vehicle image updated successfully.",

            data:
                result

        });


    } catch (error) {

        console.error(
            "Set Primary Vehicle Image Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to set primary vehicle image."

        });

    }

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    uploadVehicleImages,

    getVehicleImages,

    getVehicleImageById,

    updateVehicleImage,

    deleteVehicleImage,

    setPrimaryImage

};