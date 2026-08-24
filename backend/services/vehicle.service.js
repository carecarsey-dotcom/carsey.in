const vehicleRepository =
    require("../repositories/vehicle.repository");

const vehicleImageRepository =
    require("../repositories/vehicleImage.repository");

const inspectionReportRepository =
    require("../repositories/inspectionReport.repository");

const inspectionReportPdfService =
    require("./inspectionReportPdf.service");

const emailService =
    require("./email.service");

const env =
    require("../config/env");


// ======================================================
// ADD VEHICLE
// ======================================================

const addVehicle = async (vehicle) => {

    // ==================================================
    // STEP 1
    // SAVE VEHICLE + OWNER + INSPECTION + CHECKLIST
    // ==================================================

    const result =
        await vehicleRepository.addVehicle(
            vehicle
        );


    // ==================================================
    // VALIDATE RESULT
    // ==================================================

    if (!result) {

        throw new Error(
            "Vehicle could not be added."
        );

    }


    const vehicleId =
        Number(result.vehicleId);


    const reportId =
        Number(result.reportId);


    if (
        !Number.isInteger(vehicleId) ||
        vehicleId <= 0
    ) {

        throw new Error(
            "Vehicle ID was not generated."
        );

    }


    if (
        !Number.isInteger(reportId) ||
        reportId <= 0
    ) {

        throw new Error(
            "Inspection report ID was not generated."
        );

    }


    // ==================================================
    // STEP 2
    // ONLY PUBLISHED VEHICLE
    // ==================================================

    const isPublished =
        vehicle.status === "Published";


    // ==================================================
    // DRAFT / OTHER STATUS
    // ==================================================

    if (!isPublished) {

        return {

            ...result,

            pdfGenerated: false,

            adminEmailSent: false,

            message:
                "Vehicle added successfully."

        };

    }


    // ==================================================
    // STEP 3
    // GET COMPLETE SAVED VEHICLE DATA
    // ==================================================

    const vehicleData =
        await vehicleRepository.getVehicleById(
            vehicleId
        );


    if (!vehicleData) {

        throw new Error(
            "Saved vehicle data could not be loaded."
        );

    }


    // ==================================================
    // STEP 4
    // FINAL PDF IS GENERATED AFTER VEHICLE IMAGES
    // ARE UPLOADED
    // ==================================================
    //
    // IMPORTANT:
    //
    // Vehicle creation and vehicle image upload are
    // separate requests.
    //
    // Therefore PDF must NOT be generated here when
    // car_images can still be empty.
    //
    // The image upload controller should call:
    //
    // generateFinalVehicleInspectionReport(vehicleId)
    //
    // AFTER all images have been saved in car_images.
    //
    // ==================================================

    console.log(
        "Vehicle published successfully. Final inspection PDF will be generated after images are uploaded."
    );


    return {

        ...result,

        pdfGenerated: false,

        pdfPending: true,

        adminEmailSent: false,

        message:
            "Vehicle published successfully. Upload vehicle images to generate the final inspection PDF."

    };

};


// ======================================================
// GENERATE FINAL VEHICLE INSPECTION REPORT
// ======================================================
//
// THIS FUNCTION MUST BE CALLED AFTER ALL VEHICLE IMAGES
// HAVE BEEN SAVED INTO car_images.
//
// ======================================================

const generateFinalVehicleInspectionReport = async (
    vehicleId
) => {

    const numericVehicleId =
        Number(vehicleId);


    if (
        !Number.isInteger(numericVehicleId) ||
        numericVehicleId <= 0
    ) {

        throw new Error(
            "Valid vehicle ID is required for PDF generation."
        );

    }


    // ==================================================
    // GET COMPLETE SAVED VEHICLE DATA
    // ==================================================

    const vehicleData =
        await vehicleRepository.getVehicleById(
            numericVehicleId
        );


    if (!vehicleData) {

        throw new Error(
            "Saved vehicle data could not be loaded."
        );

    }


    // ==================================================
    // GET INSPECTION REPORT
    // ==================================================

    const report =
        await inspectionReportRepository
            .getInspectionReportByCarId(
                numericVehicleId
            );


    if (!report) {

        throw new Error(
            "Inspection report was not found for this vehicle."
        );

    }


    const reportId =
        Number(
            report.reportId ??
            report.report_id ??
            report.id
        );


    if (
        !Number.isInteger(reportId) ||
        reportId <= 0
    ) {

        throw new Error(
            "Inspection report ID is invalid."
        );

    }


    // ==================================================
    // GET VEHICLE IMAGES AFTER UPLOAD
    // ==================================================

    let vehicleImages = [];


    try {

        vehicleImages =
            await vehicleImageRepository
                .getVehicleImages(
                    numericVehicleId
                );

    } catch (imageError) {

        console.error(
            "Vehicle Image Fetch Error:",
            imageError.message
        );

        vehicleImages = [];

    }


    if (!Array.isArray(vehicleImages)) {

        vehicleImages = [];

    }


    // ==================================================
    // IMAGE DEBUG LOG
    // ==================================================

    console.log(
        "========================================"
    );

    console.log(
        "VEHICLE IMAGES FOR FINAL PUBLISH PDF"
    );

    console.log(
        "Vehicle ID:",
        numericVehicleId
    );

    console.log(
        "Report ID:",
        reportId
    );

    console.log(
        "Image Count:",
        vehicleImages.length
    );


    vehicleImages.forEach(
        (image, index) => {

            console.log(
                `Image ${index + 1}:`,
                image.imagePath ||
                image.image_path ||
                image.path ||
                "NO PATH"
            );

        }
    );


    console.log(
        "========================================"
    );


    // ==================================================
    // DO NOT CREATE EMPTY PDF
    // ==================================================

    if (vehicleImages.length === 0) {

        throw new Error(
            `Vehicle images are not uploaded yet for vehicle ${numericVehicleId}. Final inspection PDF was not generated.`
        );

    }


    // ==================================================
    // COMPLETE REPORT DATA
    // ==================================================

    const completeReport = {

        reportId,

        carId:
            numericVehicleId,

        overallScore:
            vehicleData.inspection?.overall_score ??
            report.overall_score ??
            0,

        engineRemark:
            vehicleData.inspection?.engine_remark ??
            report.engine_remark ??
            "Not provided.",

        overallRemark:
            vehicleData.inspection?.overall_remark ??
            report.overall_remark ??
            "Vehicle inspection completed.",

        publishStatus:
            "Yes",

        vehicle:
            vehicleData.vehicle || {},

        owner:
            vehicleData.owner || {},

        inspection:
            vehicleData.inspection || {},

        checklist:
            vehicleData.checklist || {},

        images:
            vehicleImages,

        vehicleImages:
            vehicleImages

    };


    // ==================================================
    // PDF DEBUG
    // ==================================================

    console.log(
        "Generating Vehicle Inspection PDF..."
    );

    console.log(
        "PDF Image Count:",
        completeReport.images.length
    );


    // ==================================================
    // GENERATE PDF
    // ==================================================

    const pdf =
        await inspectionReportPdfService
            .generateInspectionReportPdf(
                completeReport
            );


    // ==================================================
    // VALIDATE PDF
    // ==================================================

    if (
        !pdf ||
        !pdf.filePath ||
        !pdf.pdfPath
    ) {

        throw new Error(
            "Inspection PDF could not be generated."
        );

    }


    console.log(
        "Vehicle PDF Generated:",
        pdf.filePath
    );


    // ==================================================
    // SAVE PDF PATH
    // ==================================================

    await inspectionReportRepository
        .updateInspectionReportPdfPath(
            reportId,
            pdf.pdfPath
        );


    console.log(
        "PDF path saved in inspection_reports."
    );


    // ==================================================
    // SEND PDF TO ADMIN
    // ==================================================

    let adminEmailResult = null;


    if (env.ADMIN_EMAIL) {

        try {

            adminEmailResult =
                await emailService
                    .sendInspectionReportEmail({

                        to:
                            env.ADMIN_EMAIL,

                        subject:
                            `Carsey.in - Vehicle Published #${numericVehicleId}`,

                        customerName:
                            "Carsey.in Admin",

                        pdfPath:
                            pdf.filePath,

                        fileName:
                            pdf.fileName

                    });


            console.log(
                "Admin Vehicle PDF Email Sent Successfully."
            );

        } catch (emailError) {

            console.error(
                "Admin Vehicle PDF Email Error:",
                emailError.message
            );

            adminEmailResult = {

                success:
                    false,

                message:
                    emailError.message

            };

        }

    } else {

        adminEmailResult = {

            success:
                false,

            message:
                "ADMIN_EMAIL is not configured."

        };

    }


    // ==================================================
    // RETURN FINAL RESULT
    // ==================================================

    return {

        vehicleId:
            numericVehicleId,

        reportId,

        pdfGenerated:
            true,

        pdfPath:
            pdf.pdfPath,

        pdfUrl:
            pdf.pdfUrl,

        filePath:
            pdf.filePath,

        fileName:
            pdf.fileName,

        imageCount:
            completeReport.images.length,

        adminEmail:
            adminEmailResult,

        message:
            "Vehicle published and inspection PDF generated successfully with vehicle images."

    };

};



// ======================================================
// GET COMPLETE VEHICLE DATA
// CUSTOMER VEHICLE DETAIL
// ======================================================
//
// GET
// /api/vehicles/:carId
//
// Complete vehicle + owner + inspection + checklist
// + related saved data
//
// ======================================================

const getCompleteVehicleData = async (
    vehicleId
) => {

    const numericVehicleId =
        Number(vehicleId);

    if (
        !Number.isInteger(numericVehicleId) ||
        numericVehicleId <= 0
    ) {

        throw new Error(
            "Valid vehicle ID is required."
        );

    }

    // ==================================================
    // GET COMPLETE VEHICLE DATA FROM REPOSITORY
    // ==================================================

    const vehicleData =
        await vehicleRepository.getVehicleById(
            numericVehicleId
        );

    // ==================================================
    // VEHICLE NOT FOUND
    // ==================================================

    if (!vehicleData) {

        throw new Error(
            "Vehicle not found."
        );

    }

    // ==================================================
    // GET VEHICLE IMAGES
    // ==================================================

    let vehicleImages = [];

    try {

        vehicleImages =
            await vehicleImageRepository
                .getVehicleImages(
                    numericVehicleId
                );

    } catch (imageError) {

        console.error(
            "Vehicle Detail Image Fetch Error:",
            imageError.message
        );

        vehicleImages = [];

    }

    if (!Array.isArray(vehicleImages)) {

        vehicleImages = [];

    }

    // ==================================================
    // RETURN COMPLETE VEHICLE DATA
    // ==================================================

    return {

        ...vehicleData,

        images:
            vehicleImages,

        vehicleImages:
            vehicleImages

    };

};


// ======================================================
// GET ALL ADMIN VEHICLES
// ======================================================

const getAllAdminVehicles = async () => {

    const vehicles =
        await vehicleRepository
            .getAllAdminVehicles();


    return {

        vehicles

    };

};


// ======================================================
// GET PUBLISHED VEHICLES
// CUSTOMER
// ======================================================

const getPublishedVehicles = async (
    filters
) => {

    // ==================================================
    // STEP 1
    // GET PUBLISHED VEHICLES
    // ==================================================

    const result =
        await vehicleRepository
            .getPublishedVehicles(
                filters
            );


    // ==================================================
    // VALIDATE RESULT
    // ==================================================

    if (!result) {

        return result;

    }


    // ==================================================
    // GET VEHICLE ARRAY
    // ==================================================

    const vehicles =
        Array.isArray(result)
            ? result
            : Array.isArray(result.vehicles)
                ? result.vehicles
                : [];


    // ==================================================
    // NO VEHICLES
    // ==================================================

    if (
        vehicles.length === 0
    ) {

        return result;

    }


    // ==================================================
    // STEP 2
    // GET IMAGES FOR EVERY VEHICLE
    // ==================================================

    const vehiclesWithImages =
        await Promise.all(

            vehicles.map(
                async (vehicle) => {

                    try {

                        const carId =
                            Number(
                                vehicle.car_id
                            );


                        // ----------------------------------
                        // INVALID CAR ID
                        // ----------------------------------

                        if (
                            !Number.isInteger(
                                carId
                            ) ||
                            carId <= 0
                        ) {

                            return {

                                ...vehicle,

                                images: []

                            };

                        }


                        // ----------------------------------
                        // GET IMAGES
                        // ----------------------------------

                        const images =
                            await vehicleImageRepository
                                .getVehicleImages(
                                    carId
                                );


                        // ----------------------------------
                        // RETURN VEHICLE + IMAGES
                        // ----------------------------------

                        return {

                            ...vehicle,

                            images:
                                Array.isArray(images)
                                    ? images
                                    : []

                        };

                    } catch (imageError) {

                        // ----------------------------------
                        // IMAGE ERROR SHOULD NOT BREAK
                        // VEHICLE LIST
                        // ----------------------------------

                        console.error(

                            `Vehicle Image Fetch Error for Car ${vehicle.car_id}:`,

                            imageError.message

                        );


                        return {

                            ...vehicle,

                            images: []

                        };

                    }

                }
            )

        );


    // ==================================================
    // STEP 3
    // PRESERVE PAGINATION
    // ==================================================

    if (
        Array.isArray(result)
    ) {

        return vehiclesWithImages;

    }


    // ==================================================
    // STEP 4
    // RETURN SAME RESPONSE STRUCTURE
    // ==================================================

    return {

        ...result,

        vehicles:
            vehiclesWithImages

    };

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    addVehicle,

    generateFinalVehicleInspectionReport,

    getCompleteVehicleData,


    getAllAdminVehicles,

    getPublishedVehicles

};