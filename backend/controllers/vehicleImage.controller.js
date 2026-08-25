const vehicleImageService =
    require("../services/vehicleImage.service");


// ======================================================
// VEHICLE SERVICE
// ======================================================
// IMPORTANT:
// Final inspection PDF is generated only AFTER all
// vehicle images have been successfully saved.
// ======================================================

const vehicleService =
    require("../services/vehicle.service");


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


        if (!carId) {

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
        // Do NOT generate the PDF from uploadedImages only.
        //
        // We fetch the images again from the database so the
        // PDF always uses the actual saved car_images records.
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

            }
        );


        // ==================================================
        // GENERATE FINAL VEHICLE INSPECTION PDF
        // ==================================================
        //
        // Images have now been inserted into car_images.
        //
        // Therefore this is the correct point to generate
        // the final publish PDF.
        //
        // ==================================================

        let pdfResult = null;


        try {

            console.log(
                "========================================"
            );

            console.log(
                "GENERATING FINAL PUBLISH VEHICLE PDF"
            );

            console.log(
                "Vehicle ID:",
                carId
            );

            console.log(
                "PDF Image Count:",
                savedVehicleImages.length
            );

            console.log(
                "========================================"
            );


            // ----------------------------------------------
            // SAFETY CHECK
            // ----------------------------------------------

            if (
                savedVehicleImages.length === 0
            ) {

                throw new Error(
                    "Vehicle images were uploaded but could not be found in the database."
                );

            }


            // ----------------------------------------------
            // GENERATE PDF
            // ----------------------------------------------

            pdfResult =
                await vehicleService
                    .generateFinalVehicleInspectionReport(
                        carId
                    );


            console.log(
                "========================================"
            );

            console.log(
                "FINAL VEHICLE PDF GENERATED"
            );

            console.log(
                "Vehicle ID:",
                carId
            );

            console.log(
                "Report ID:",
                pdfResult?.reportId ||
                null
            );

            console.log(
                "PDF Image Count:",
                pdfResult?.imageCount ||
                savedVehicleImages.length
            );

            console.log(
                "PDF Path:",
                pdfResult?.pdfPath ||
                ""
            );

            console.log(
                "========================================"
            );


        } catch (pdfError) {

            console.error(
                "Final Vehicle PDF Generation Error:",
                pdfError
            );


            // ==================================================
            // IMPORTANT
            // ==================================================
            //
            // Images have already been successfully saved.
            //
            // Do NOT delete uploaded images if PDF generation
            // fails.
            //
            // Frontend can retry PDF generation later.
            //
            // ==================================================

            return res.status(201).json({

                success: true,

                message:
                    "Vehicle images uploaded successfully, but final inspection PDF could not be generated.",

                data: {

                    carId,

                    images:
                        uploadedImages,

                    pdfGenerated:
                        false,

                    imageCount:
                        savedVehicleImages.length,

                    pdfError:
                        pdfError.message

                }

            });

        }


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.status(201).json({

            success: true,

            message:
                "Vehicle images uploaded and final inspection PDF generated successfully.",

            data: {

                carId,

                images:
                    uploadedImages,

                pdfGenerated:
                    true,

                imageCount:
                    pdfResult?.imageCount ||
                    savedVehicleImages.length,

                pdf: {

                    reportId:
                        pdfResult?.reportId ||
                        null,

                    pdfPath:
                        pdfResult?.pdfPath ||
                        null,

                    pdfUrl:
                        pdfResult?.pdfUrl ||
                        null,

                    filePath:
                        pdfResult?.filePath ||
                        null,

                    fileName:
                        pdfResult?.fileName ||
                        null,

                    imageCount:
                        pdfResult?.imageCount ||
                        savedVehicleImages.length

                }

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

        if (!carId) {
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

        return res.status(200).json({
            success: true,
            message:
                "Vehicle images fetched successfully.",
            data: {
                carId,
                images: Array.isArray(images)
                    ? images
                    : []
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


        if (!carId) {

            return res.status(400).json({

                success: false,

                message:
                    "Valid vehicle ID is required."

            });

        }


        if (!imageId) {

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


        if (!carId) {

            return res.status(400).json({

                success: false,

                message:
                    "Valid vehicle ID is required."

            });

        }


        if (!imageId) {

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


        if (!carId) {

            return res.status(400).json({

                success: false,

                message:
                    "Valid vehicle ID is required."

            });

        }


        if (!imageId) {

            return res.status(400).json({

                success: false,

                message:
                    "Valid image ID is required."

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


        if (!carId) {

            return res.status(400).json({

                success: false,

                message:
                    "Valid vehicle ID is required."

            });

        }


        if (!imageId) {

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