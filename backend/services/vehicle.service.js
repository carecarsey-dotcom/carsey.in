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
    // IMPORTANT PUBLISH FLOW FIX
    // ==================================================
    //
    // Creating a vehicle must NEVER generate the final
    // inspection PDF or send the inspection email.
    //
    // Publishing is a separate admin action handled by
    // publishVehicle(). The final PDF is generated only
    // after the vehicle has actually been marked Published
    // in the database and vehicle images are available.
    //
    // ==================================================

    console.log(
        "Vehicle added successfully. PDF/email generation is pending until the vehicle is actually published and images are available."
    );


    return {

        ...result,

        pdfGenerated:
            false,

        pdfPending:
            true,

        adminEmailSent:
            false,

        customerEmailSent:
            false,

        message:
            "Vehicle added successfully. Publish the vehicle to generate and send the final inspection PDF."

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
    // IMPORTANT - VERIFY ACTUAL VEHICLE PUBLISH STATUS
    // ==================================================
    //
    // Never trust an incoming request value or a hardcoded
    // publishStatus value for PDF generation. The vehicle
    // must already be Published in the database.
    //
    // ==================================================

    const savedVehicleObject =
        vehicleData.vehicle ||
        vehicleData ||
        {};


    const savedPublishStatus =
        String(
            savedVehicleObject.status ??
            savedVehicleObject.publish_status ??
            savedVehicleObject.publishStatus ??
            vehicleData.status ??
            vehicleData.publish_status ??
            vehicleData.publishStatus ??
            ""
        )
            .trim()
            .toLowerCase();


    const vehicleIsPublished =
        [
            "yes",
            "published",
            "publish",
            "active",
            "available"
        ].includes(
            savedPublishStatus
        );


    console.log(
        "Vehicle publish status before PDF generation:",
        savedPublishStatus || "empty"
    );


    if (!vehicleIsPublished) {

        throw new Error(
            `Vehicle ${numericVehicleId} is not published yet. Final inspection PDF and email were not generated.`
        );

    }


    // ==================================================
    // GET LATEST INSPECTION REPORT
    // ==================================================
    //
    // PDF generation must use the latest report.
    //
    // First try the new repository method.
    // If it is not available or returns nothing,
    // fall back to the existing method.
    //
    // ==================================================

    let report = null;


    try {

        if (
            typeof inspectionReportRepository
                .getLatestInspectionReportByCarId ===
            "function"
        ) {

            report =
                await inspectionReportRepository
                    .getLatestInspectionReportByCarId(
                        numericVehicleId
                    );

        }

    } catch (reportError) {

        console.error(
            "Latest Inspection Report Fetch Error:",
            reportError.message
        );

    }


    // ==================================================
    // FALLBACK REPORT FETCH
    // ==================================================

    if (!report) {

        report =
            await inspectionReportRepository
                .getInspectionReportByCarId(
                    numericVehicleId
                );

    }


    if (!report) {

        throw new Error(
            "Inspection report was not found for this vehicle."
        );

    }


    // ==================================================
    // REPORT ID
    // ==================================================

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
    // NORMALIZED VEHICLE DATA
    // ==================================================

    const vehicleObject =
        vehicleData.vehicle ||
        vehicleData ||
        {};


    // ==================================================
    // NORMALIZED OWNER DATA
    // ==================================================

    const ownerObject =
        vehicleData.owner ||
        {

            ownerName:
                vehicleData.customer_name ||
                vehicleData.owner_name ||
                vehicleData.ownerName ||
                vehicleObject.customer_name ||
                vehicleObject.owner_name ||
                vehicleObject.ownerName ||
                "-",

            mobile:
                vehicleData.owner_mobile ||
                vehicleData.ownerMobile ||
                vehicleData.mobile ||
                vehicleData.phone ||
                vehicleObject.owner_mobile ||
                vehicleObject.ownerMobile ||
                vehicleObject.mobile ||
                vehicleObject.phone ||
                "-",

            email:
                vehicleData.owner_email ||
                vehicleData.ownerEmail ||
                vehicleData.email ||
                vehicleObject.owner_email ||
                vehicleObject.ownerEmail ||
                vehicleObject.email ||
                "-",

            address:
                vehicleData.owner_address ||
                vehicleData.ownerAddress ||
                vehicleData.address ||
                vehicleObject.owner_address ||
                vehicleObject.ownerAddress ||
                vehicleObject.address ||
                "-"
        };


    // ==================================================
    // NORMALIZED INSPECTION DATA
    // ==================================================

    const inspectionObject =
        vehicleData.inspection ||
        report.inspection ||
        report ||
        {};


    // ==================================================
    // NORMALIZED CHECKLIST DATA
    // ==================================================
    //
    // Support all checklist field names used by the
    // frontend/repository.
    //
    // ==================================================

    const checklistData =
        vehicleData.checklist ||
        vehicleData.inspection_checklist ||
        vehicleData.inspectionChecklist ||
        vehicleData.detailedInspection ||
        vehicleData.inspection?.checklist ||
        report.checklist ||
        report.inspection_checklist ||
        report.inspectionChecklist ||
        report.detailedInspection ||
        report.inspection?.checklist ||
        {};


    // ==================================================
    // COMPLETE REPORT DATA
    // ==================================================

    const completeReport = {

        // ----------------------------------------------
        // REPORT IDENTIFIERS
        // ----------------------------------------------

        reportId,

        report_id:
            report.report_id ??
            report.reportId ??
            reportId,

        carId:
            numericVehicleId,

        car_id:
            numericVehicleId,


        // ----------------------------------------------
        // SCORE
        // ----------------------------------------------

        overallScore:
            vehicleData.inspection?.overall_score ??
            vehicleData.inspection?.overallScore ??
            inspectionObject.overall_score ??
            inspectionObject.overallScore ??
            report.overall_score ??
            report.overallScore ??
            0,


        overall_score:
            vehicleData.inspection?.overall_score ??
            vehicleData.inspection?.overallScore ??
            inspectionObject.overall_score ??
            inspectionObject.overallScore ??
            report.overall_score ??
            report.overallScore ??
            0,


        // ----------------------------------------------
        // ENGINE REMARK
        // ----------------------------------------------

        engineRemark:
            vehicleData.inspection?.engine_remark ??
            vehicleData.inspection?.engineRemark ??
            inspectionObject.engine_remark ??
            inspectionObject.engineRemark ??
            report.engine_remark ??
            report.engineRemark ??
            "Not provided.",


        engine_remark:
            vehicleData.inspection?.engine_remark ??
            vehicleData.inspection?.engineRemark ??
            inspectionObject.engine_remark ??
            inspectionObject.engineRemark ??
            report.engine_remark ??
            report.engineRemark ??
            "Not provided.",


        // ----------------------------------------------
        // OVERALL REMARK
        // ----------------------------------------------

        overallRemark:
            vehicleData.inspection?.overall_remark ??
            vehicleData.inspection?.overallRemark ??
            inspectionObject.overall_remark ??
            inspectionObject.overallRemark ??
            report.overall_remark ??
            report.overallRemark ??
            "Vehicle inspection completed.",


        overall_remark:
            vehicleData.inspection?.overall_remark ??
            vehicleData.inspection?.overallRemark ??
            inspectionObject.overall_remark ??
            inspectionObject.overallRemark ??
            report.overall_remark ??
            report.overallRemark ??
            "Vehicle inspection completed.",


        // ----------------------------------------------
        // PUBLISH STATUS
        // ----------------------------------------------

        publishStatus:
            savedVehicleObject.status ||
            savedVehicleObject.publish_status ||
            savedVehicleObject.publishStatus ||
            "Published",

        publish_status:
            savedVehicleObject.status ||
            savedVehicleObject.publish_status ||
            savedVehicleObject.publishStatus ||
            "Published",


        // ----------------------------------------------
        // VEHICLE
        // ----------------------------------------------

        vehicle:
            vehicleObject,


        // ----------------------------------------------
        // OWNER
        // ----------------------------------------------

        owner:
            ownerObject,


        // ----------------------------------------------
        // INSPECTION
        // ----------------------------------------------

        inspection:
            inspectionObject,


        // ----------------------------------------------
        // CHECKLIST
        // ----------------------------------------------

        checklist:
            checklistData,

        inspection_checklist:
            checklistData,

        inspectionChecklist:
            checklistData,

        detailedInspection:
            checklistData,


        // ----------------------------------------------
        // IMAGES
        // ----------------------------------------------

        images:
            vehicleImages,

        vehicleImages:
            vehicleImages

    };


    // ==================================================
    // PDF DEBUG - CUSTOMER / OWNER DATA
    // ==================================================

    console.log(
        "========================================"
    );

    console.log(
        "FINAL PDF CUSTOMER DATA"
    );

    console.log(
        "Customer Name:",
        ownerObject.ownerName ||
        ownerObject.name ||
        "-"
    );

    console.log(
        "Customer Mobile:",
        ownerObject.mobile ||
        ownerObject.phone ||
        "-"
    );

    console.log(
        "Customer Email:",
        ownerObject.email ||
        "-"
    );

    console.log(
        "Customer Address:",
        ownerObject.address ||
        "-"
    );

    console.log(
        "========================================"
    );


    // ==================================================
    // PDF DEBUG - CHECKLIST
    // ==================================================

    console.log(
        "FINAL PDF CHECKLIST DATA:"
    );

    console.log(
        JSON.stringify(
            checklistData,
            null,
            2
        )
    );


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


    // ==================================================
    // IMPORTANT - MARK INSPECTION REPORT AS PUBLISHED
    // ==================================================

    await inspectionReportRepository
        .markInspectionReportPublished(
            reportId
        );


    // ==================================================
    // SEND ADMIN EMAIL
    // ==================================================

    let adminEmailResult = {

        success: false,

        message:
            "Admin email was not sent."

    };


    if (
        env.ADMIN_EMAIL
    ) {

        try {

            adminEmailResult =
                await emailService
                    .sendInspectionReportToAdmin({

                        // ----------------------------------
                        // VEHICLE
                        // ----------------------------------

                        vehicle:
                            vehicleObject,


                        // ----------------------------------
                        // OWNER
                        // ----------------------------------

                        owner:
                            ownerObject,


                        // ----------------------------------
                        // INSPECTION
                        // ----------------------------------

                        inspection:
                            inspectionObject,


                        // ----------------------------------
                        // CHECKLIST
                        // ----------------------------------

                        checklist:
                            checklistData,

                        inspection_checklist:
                            checklistData,

                        inspectionChecklist:
                            checklistData,

                        detailedInspection:
                            checklistData,


                        // ----------------------------------
                        // PDF
                        // ----------------------------------

                        pdfPath:
                            pdf.filePath,

                        pdfUrl:
                            pdf.pdfUrl

                    });

        } catch (emailError) {

            console.error(
                "Admin Email Error:",
                emailError
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
// PUBLISH VEHICLE
// ADMIN PUBLISH ACTION
// ======================================================
//
// IMPORTANT FLOW:
//
// 1. Vehicle must already exist.
// 2. Mark the vehicle Published in the database.
// 3. Re-fetch and verify the real database status.
// 4. If images are already available, generate the final PDF.
// 5. If images are not available yet, leave PDF pending.
//
// The image upload controller can call
// generateFinalVehicleInspectionReport(vehicleId) AFTER
// confirming that the vehicle is already Published.
//
// ======================================================

const publishVehicle = async (
    vehicleId
) => {

    const numericVehicleId =
        Number(vehicleId);


    // ==================================================
    // VALIDATE VEHICLE ID
    // ==================================================

    if (
        !Number.isInteger(numericVehicleId) ||
        numericVehicleId <= 0
    ) {

        throw new Error(
            "Valid vehicle ID is required for publishing."
        );

    }


    // ==================================================
    // CHECK VEHICLE EXISTS BEFORE PUBLISHING
    // ==================================================

    const beforePublish =
        await vehicleRepository.getVehicleById(
            numericVehicleId
        );


    if (!beforePublish) {

        throw new Error(
            "Vehicle not found."
        );

    }


    // ==================================================
    // PUBLISH IN DATABASE
    // ==================================================

    if (
        typeof vehicleRepository.publishVehicle !==
        "function"
    ) {

        throw new Error(
            "vehicleRepository.publishVehicle() is not available. Please use the fixed vehicle.repository.js."
        );

    }


    const publishResult =
        await vehicleRepository.publishVehicle(
            numericVehicleId
        );


    if (
        !publishResult ||
        publishResult.published === false
    ) {

        throw new Error(
            publishResult?.message ||
            "Vehicle could not be published."
        );

    }


    // ==================================================
    // RE-FETCH AFTER PUBLISH
    // ==================================================

    const publishedVehicleData =
        await vehicleRepository.getVehicleById(
            numericVehicleId
        );


    if (!publishedVehicleData) {

        throw new Error(
            "Vehicle was published but could not be loaded again."
        );

    }


    const publishedVehicleObject =
        publishedVehicleData.vehicle ||
        publishedVehicleData ||
        {};


    const verifiedStatus =
        String(
            publishedVehicleObject.status ??
            publishedVehicleObject.publish_status ??
            publishedVehicleObject.publishStatus ??
            ""
        )
            .trim()
            .toLowerCase();


    const verifiedPublished =
        [
            "yes",
            "published",
            "publish",
            "active",
            "available"
        ].includes(
            verifiedStatus
        );


    if (!verifiedPublished) {

        throw new Error(
            `Vehicle publish verification failed. Current status: ${publishedVehicleObject.status || "empty"}`
        );

    }


    // ==================================================
    // CHECK IMAGES
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
            "Publish Vehicle Image Fetch Error:",
            imageError.message
        );

        vehicleImages = [];

    }


    if (!Array.isArray(vehicleImages)) {

        vehicleImages = [];

    }


    // ==================================================
    // NO IMAGES YET
    // ==================================================

    if (
        vehicleImages.length === 0
    ) {

        console.log(
            `Vehicle ${numericVehicleId} is published, but images are not uploaded yet. PDF remains pending.`
        );

        return {

            ...publishResult,

            vehicleId:
                numericVehicleId,

            carId:
                numericVehicleId,

            published:
                true,

            pdfGenerated:
                false,

            pdfPending:
                true,

            imageCount:
                0,

            adminEmailSent:
                false,

            customerEmailSent:
                false,

            message:
                "Vehicle published successfully. Upload vehicle images to generate and send the final inspection PDF."

        };

    }


    // ==================================================
    // IMAGES EXIST - GENERATE FINAL PDF
    // ==================================================

    const pdfResult =
        await generateFinalVehicleInspectionReport(
            numericVehicleId
        );


    return {

        ...publishResult,

        ...pdfResult,

        vehicleId:
            numericVehicleId,

        carId:
            numericVehicleId,

        published:
            true,

        pdfGenerated:
            true,

        pdfPending:
            false,

        message:
            "Vehicle published and final inspection PDF generated successfully."

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
// DELETE VEHICLE
// ADMIN
// ======================================================
//
// Deletes the vehicle through the repository layer.
// The repository is responsible for the actual database
// deletion and related vehicle records.
//
// ======================================================

const deleteVehicle = async (
    vehicleId
) => {

    const numericVehicleId =
        Number(vehicleId);


    // ==================================================
    // VALIDATE VEHICLE ID
    // ==================================================

    if (
        !Number.isInteger(numericVehicleId) ||
        numericVehicleId <= 0
    ) {

        throw new Error(
            "Valid vehicle ID is required."
        );

    }


    // ==================================================
    // DELETE VEHICLE FROM REPOSITORY
    // ==================================================

    const result =
        await vehicleRepository
            .deleteVehicle(
                numericVehicleId
            );


    // ==================================================
    // VEHICLE NOT FOUND / NOT DELETED
    // ==================================================

    if (!result) {

        return {

            deleted: false,

            vehicleId:
                numericVehicleId,

            message:
                "Vehicle not found or could not be deleted."

        };

    }


    if (result.deleted === false) {

        return {

            ...result,

            deleted: false,

            vehicleId:
                numericVehicleId

        };

    }


    // ==================================================
    // SUCCESS
    // ==================================================

    return {

        ...result,

        deleted: true,

        vehicleId:
            numericVehicleId,

        message:
            result.message ||
            "Vehicle deleted successfully."

    };

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    addVehicle,

    generateFinalVehicleInspectionReport,

    publishVehicle,

    getCompleteVehicleData,

    getAllAdminVehicles,

    getPublishedVehicles,

    deleteVehicle

};