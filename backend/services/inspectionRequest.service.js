const inspectionRequestRepository =
    require("../repositories/inspectionRequest.repository");

const vehicleRepository =
    require("../repositories/vehicle.repository");

const inspectionReportRepository =
    require("../repositories/inspectionReport.repository");

const vehicleImageRepository =
    require("../repositories/vehicleImage.repository");

const inspectionReportPdfService =
    require("./inspectionReportPdf.service");

const emailService =
    require("./email.service");

const env =
    require("../config/env");


// ======================================================
// VALIDATE POSITIVE INTEGER
// ======================================================

const validateId = (
    value,
    fieldName
) => {

    const id = Number(value);

    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {
        throw new Error(
            `${fieldName} must be a valid ID`
        );
    }

    return id;
};


// ======================================================
// GET REQUEST BY ID
// ======================================================

const getRequestById = async (
    requestId
) => {

    const id =
        validateId(
            requestId,
            "Request ID"
        );

    const request =
        await inspectionRequestRepository
            .getRequestById(id);

    if (!request) {
        throw new Error(
            "Inspection request not found"
        );
    }

    return request;
};


// ======================================================
// GET EMPLOYEE REQUESTS
// ======================================================

const getEmployeeRequests = async (
    employeeId,
    status = null
) => {

    const id =
        validateId(
            employeeId,
            "Employee ID"
        );

    const allowedStatuses = [
        "Assigned",
        "Accepted",
        "Rejected",
        "In Progress",
        "Submitted",
        "Admin Rejected",
        "Approved",
        "Published"
    ];

    if (
        status !== null &&
        status !== undefined &&
        status !== "" &&
        !allowedStatuses.includes(status)
    ) {
        throw new Error(
            "Invalid inspection request status"
        );
    }

    return await inspectionRequestRepository
        .getEmployeeRequests(
            id,
            status || null
        );
};


// ======================================================
// GET ADMIN REQUESTS
// ======================================================

const getAdminRequests = async (
    status = null
) => {

    const allowedStatuses = [
        "Assigned",
        "Accepted",
        "Rejected",
        "In Progress",
        "Submitted",
        "Admin Rejected",
        "Approved",
        "Published"
    ];

    if (
        status !== null &&
        status !== undefined &&
        status !== "" &&
        !allowedStatuses.includes(status)
    ) {
        throw new Error(
            "Invalid inspection request status"
        );
    }

    return await inspectionRequestRepository
        .getAdminRequests(
            status || null
        );
};


// ======================================================
// EMPLOYEE ACCEPT
// ======================================================

const acceptRequest = async (
    requestId,
    employeeId
) => {

    const requestIdValue =
        validateId(
            requestId,
            "Request ID"
        );

    const employeeIdValue =
        validateId(
            employeeId,
            "Employee ID"
        );

    const request =
        await inspectionRequestRepository
            .getRequestById(
                requestIdValue
            );

    if (!request) {
        throw new Error(
            "Inspection request not found"
        );
    }

    if (
        Number(request.employee_id) !==
        Number(employeeIdValue)
    ) {
        throw new Error(
            "Access denied. This inspection is not assigned to you."
        );
    }

    if (
        request.status !==
        "Assigned"
    ) {
        throw new Error(
            `Inspection request cannot be accepted from "${request.status}" status`
        );
    }

    const result =
        await inspectionRequestRepository
            .acceptRequest(
                requestIdValue,
                employeeIdValue
            );

    if (
        !result ||
        result.affectedRows !== 1
    ) {
        throw new Error(
            "Inspection request could not be accepted"
        );
    }

    return await inspectionRequestRepository
        .getRequestById(
            requestIdValue
        );
};


// ======================================================
// EMPLOYEE REJECT
// ======================================================

const rejectRequest = async (
    requestId,
    employeeId,
    employeeRemark = null
) => {

    const requestIdValue =
        validateId(
            requestId,
            "Request ID"
        );

    const employeeIdValue =
        validateId(
            employeeId,
            "Employee ID"
        );

    const request =
        await inspectionRequestRepository
            .getRequestById(
                requestIdValue
            );

    if (!request) {
        throw new Error(
            "Inspection request not found"
        );
    }

    if (
        Number(request.employee_id) !==
        Number(employeeIdValue)
    ) {
        throw new Error(
            "Access denied. This inspection is not assigned to you."
        );
    }

    if (
        request.status !==
        "Assigned"
    ) {
        throw new Error(
            `Inspection request cannot be rejected from "${request.status}" status`
        );
    }

    if (
        employeeRemark !== null &&
        employeeRemark !== undefined &&
        typeof employeeRemark !== "string"
    ) {
        throw new Error(
            "Employee remark must be text"
        );
    }

    const remark =
        employeeRemark === undefined ||
        employeeRemark === null
            ? null
            : employeeRemark.trim();

    const result =
        await inspectionRequestRepository
            .rejectRequest(
                requestIdValue,
                employeeIdValue,
                remark || null
            );

    if (
        !result ||
        result.affectedRows !== 1
    ) {
        throw new Error(
            "Inspection request could not be rejected"
        );
    }

    return await inspectionRequestRepository
        .getRequestById(
            requestIdValue
        );
};


// ======================================================
// EMPLOYEE START INSPECTION
// ======================================================

const startInspection = async (
    requestId,
    employeeId
) => {

    const requestIdValue =
        validateId(
            requestId,
            "Request ID"
        );

    const employeeIdValue =
        validateId(
            employeeId,
            "Employee ID"
        );

    const request =
        await inspectionRequestRepository
            .getRequestById(
                requestIdValue
            );

    if (!request) {
        throw new Error(
            "Inspection request not found"
        );
    }

    if (
        Number(request.employee_id) !==
        Number(employeeIdValue)
    ) {
        throw new Error(
            "Access denied. This inspection is not assigned to you."
        );
    }

    if (
        request.status !== "Accepted" &&
        request.status !== "Admin Rejected"
    ) {
        throw new Error(
            `Inspection cannot be started from "${request.status}" status`
        );
    }

    const result =
        await inspectionRequestRepository
            .startInspection(
                requestIdValue,
                employeeIdValue
            );

    if (
        !result ||
        result.affectedRows !== 1
    ) {
        throw new Error(
            "Inspection could not be started"
        );
    }

    return await inspectionRequestRepository
        .getRequestById(
            requestIdValue
        );
};


// ======================================================
// EMPLOYEE SUBMIT INSPECTION
// ======================================================
// IMPORTANT:
// Employee submit:
// 1. Validates request ownership.
// 2. Creates Draft vehicle.
// 3. Creates inspection report.
// 4. Saves checklist.
// 5. Links report_id with request.
// 6. Changes request status to Submitted.
//
// Employee price is NEVER trusted/saved here.
// ======================================================

const submitInspection = async (
    requestId,
    employeeId,
    inspectionData = {},
    uploadedFiles = []
) => {

    const requestIdValue = validateId(requestId, "Request ID");
    const employeeIdValue = validateId(employeeId, "Employee ID");

    const request = await inspectionRequestRepository.getRequestById(requestIdValue);

    if (!request) {
        throw new Error("Inspection request not found");
    }

    if (Number(request.employee_id) !== Number(employeeIdValue)) {
        throw new Error("Access denied. This inspection is not assigned to you.");
    }

    if (request.status !== "In Progress") {
        throw new Error(`Inspection cannot be submitted from "${request.status}" status`);
    }

    if (!inspectionData || typeof inspectionData !== "object") {
        throw new Error("Inspection data is required");
    }

    const vehicleData = { ...inspectionData };

    // Employee can never set Admin price or publication state.
    delete vehicleData.price;
    delete vehicleData.selling_price;
    delete vehicleData.publish_price;
    delete vehicleData.publish_status;
    delete vehicleData.publishStatus;
    delete vehicleData.published_at;
    delete vehicleData.publishedAt;
    delete vehicleData.published;

    vehicleData.status = "Draft";

    // Customer/booking fallbacks.
    if (!vehicleData.customer_name && request.customer_name) vehicleData.customer_name = request.customer_name;
    if (!vehicleData.owner_mobile && request.customer_mobile) vehicleData.owner_mobile = request.customer_mobile;
    if (!vehicleData.owner_email && request.customer_email) vehicleData.owner_email = request.customer_email;
    if (!vehicleData.owner_address && request.booking_address) vehicleData.owner_address = request.booking_address;
    if (!vehicleData.city && request.booking_city) vehicleData.city = request.booking_city;
    if (!vehicleData.brand && request.booking_brand) vehicleData.brand = request.booking_brand;
    if (!vehicleData.model && request.booking_model) vehicleData.model = request.booking_model;
    if (!vehicleData.registration_number && request.vehicle_number) vehicleData.registration_number = request.vehicle_number;

    if (!vehicleData.checklist && vehicleData.inspection_checklist) {
        vehicleData.checklist = vehicleData.inspection_checklist;
    }

    let vehicleResult;

    try {
        vehicleResult = await vehicleRepository.addVehicle(vehicleData);
    } catch (error) {
        console.error("EMPLOYEE VEHICLE SAVE ERROR:", error);
        throw new Error(`Vehicle could not be saved: ${error.message}`);
    }

    const vehicleId = Number(vehicleResult?.vehicleId || vehicleResult?.carId);

    if (!vehicleId) {
        throw new Error("Vehicle was saved but vehicle ID was not returned");
    }

    const reportId = Number(vehicleResult?.reportId);

    if (!reportId) {
        throw new Error("Vehicle was saved but inspection report ID was not returned");
    }

    // ==================================================
    // SAVE EMPLOYEE VEHICLE PHOTOS BEFORE PDF
    // ==================================================
    // Files are uploaded by the same Employee Submit request.
    // Therefore the PDF is generated only after these images
    // have been inserted into car_images.
    // ==================================================

    const imageFiles = Array.isArray(uploadedFiles)
        ? uploadedFiles
        : [];

    const expectedImageCount = 10;

    if (imageFiles.length !== expectedImageCount) {
        throw new Error(
            `Exactly ${expectedImageCount} vehicle photos are required before submission. Received ${imageFiles.length}.`
        );
    }

    const imageTypeMap = [
        "Exterior Front Photo",
        "Rear Left",
        "Exterior LHS Photo",
        "Exterior RHS Photo",
        "Interior Photo",
        "Interior RHS",
        "Interior LHS",
        "Engine Photo",
        "Dicky Boot",
        "Interior LHS"
    ];

    const savedVehicleImages = [];

    for (let index = 0; index < imageFiles.length; index++) {
        const file = imageFiles[index];

        if (!file || !file.filename) {
            throw new Error(`Vehicle photo ${index + 1} could not be uploaded.`);
        }

        const imageType = imageTypeMap[index] || "Interior Photo";
        const imagePath = `/uploads/vehicles/${file.filename}`;

        const imageId = await vehicleImageRepository.addVehicleImage(
            vehicleId,
            imageType,
            imagePath,
            index === 0
        );

        savedVehicleImages.push({
            imageId,
            car_id: vehicleId,
            image_type: imageType,
            image_path: imagePath,
            is_primary: index === 0 ? 1 : 0
        });
    }

    let employeeRemark =
        inspectionData.employeeRemark ??
        inspectionData.remark ??
        inspectionData.overall_remark ??
        null;

    if (employeeRemark !== null && employeeRemark !== undefined) {
        if (typeof employeeRemark !== "string") {
            throw new Error("Employee remark must be text");
        }
        employeeRemark = employeeRemark.trim() || null;
    }

    // ==================================================
    // GENERATE PDF BEFORE PUBLISH
    // ==================================================
    // publish_status intentionally remains "No".
    // ==================================================

    let pdfResult;

    try {
        const completeReportData =
            await inspectionReportRepository.getCompleteInspectionReport(reportId);

        if (!completeReportData) {
            throw new Error("Inspection report data could not be loaded for PDF generation.");
        }

        let completeVehicleData = null;

        if (typeof vehicleRepository.getCompleteVehicleData === "function") {
            completeVehicleData = await vehicleRepository.getCompleteVehicleData(vehicleId);
        } else if (typeof vehicleRepository.getVehicleById === "function") {
            completeVehicleData = await vehicleRepository.getVehicleById(vehicleId);
        }

        if (!completeVehicleData) {
            throw new Error("Vehicle data could not be loaded for PDF generation.");
        }

        const rawOwner = completeVehicleData.owner || completeVehicleData.customer || {};

        const owner = {
            ...rawOwner,
            ownerName: rawOwner.ownerName || rawOwner.owner_name || rawOwner.name || request.customer_name || vehicleData.customer_name || "-",
            email: rawOwner.email || rawOwner.owner_email || request.customer_email || vehicleData.owner_email || "",
            mobile: rawOwner.mobile || rawOwner.phone || request.customer_mobile || vehicleData.owner_mobile || "",
            address: rawOwner.address || request.booking_address || vehicleData.owner_address || "",
            city: rawOwner.city || request.booking_city || vehicleData.city || ""
        };

        const vehicle = completeVehicleData.vehicle || {};
        const inspection = completeVehicleData.inspection || completeReportData.report || {};
        const checklist =
            completeReportData.checklist ||
            completeVehicleData.checklist ||
            vehicleData.checklist ||
            {};

        let vehicleImages = Array.isArray(completeVehicleData.images)
            ? completeVehicleData.images
            : [];

        try {
            const dbImages = await vehicleImageRepository.getVehicleImages(vehicleId);
            if (Array.isArray(dbImages) && dbImages.length > 0) {
                vehicleImages = dbImages;
            }
        } catch (imageReadError) {
            console.warn(
                "EMPLOYEE SUBMIT - VEHICLE IMAGE READ WARNING:",
                imageReadError.message
            );
        }

        const completeReport = {
            ...completeReportData.report,
            vehicle,
            owner,
            customer: owner,
            inspection,
            checklist,
            inspection_checklist: checklist,
            inspectionChecklist: checklist,
            detailedInspection: checklist,
            images: vehicleImages,
            vehicleImages,
            publishStatus: "No",
            publish_status: "No"
        };

        console.log("EMPLOYEE SUBMIT - GENERATING PDF", {
            requestId: requestIdValue,
            vehicleId,
            reportId,
            imageCount: vehicleImages.length,
            publishStatus: "No"
        });

        pdfResult = await inspectionReportPdfService.generateInspectionReportPdf(completeReport);

        if (!pdfResult || !pdfResult.pdfPath) {
            throw new Error("Inspection PDF could not be generated.");
        }

        await inspectionReportRepository.updateInspectionReportPdfPath(
            reportId,
            pdfResult.pdfPath
        );

    } catch (pdfError) {
        console.error("EMPLOYEE SUBMIT PDF ERROR:", pdfError);
        throw new Error(`Inspection was saved, but PDF generation failed: ${pdfError.message}`);
    }

    // ==================================================
    // SEND THE SAME PDF TO ADMIN + CUSTOMER
    // ==================================================

    let adminEmailResult = {
        success: false,
        message: "Admin email was not sent."
    };

    let customerEmailResult = {
        success: false,
        message: "Customer email was not sent."
    };

    try {
        if (env.ADMIN_EMAIL) {
            adminEmailResult = await emailService.sendInspectionReportToAdmin({
                pdfPath: pdfResult.filePath || pdfResult.pdfPath,
                fileName: pdfResult.fileName || `inspection-report-${reportId}.pdf`,
                carId: vehicleId,
                reportId
            });
        } else {
            adminEmailResult = {
                success: false,
                message: "ADMIN_EMAIL is not configured."
            };
        }
    } catch (error) {
        console.error("EMPLOYEE SUBMIT ADMIN EMAIL ERROR:", error);
        adminEmailResult = {
            success: false,
            message: error.message || "Unable to send inspection PDF to Admin."
        };
    }

    try {
        const customerEmail = String(
            request.customer_email ||
            vehicleData.owner_email ||
            vehicleData.email ||
            ""
        ).trim().toLowerCase();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!customerEmail) {
            customerEmailResult = {
                success: false,
                skipped: true,
                message: "Customer email is not available."
            };
        } else if (!emailRegex.test(customerEmail)) {
            customerEmailResult = {
                success: false,
                skipped: true,
                message: "Customer email is invalid."
            };
        } else {
            customerEmailResult = await emailService.sendInspectionReportEmail({
                to: customerEmail,
                subject: `Carsey.in - Vehicle Inspection Report #${reportId}`,
                customerName: request.customer_name || vehicleData.customer_name || "Customer",
                pdfPath: pdfResult.filePath || pdfResult.pdfPath,
                fileName: pdfResult.fileName || `inspection-report-${reportId}.pdf`
            });
        }
    } catch (error) {
        console.error("EMPLOYEE SUBMIT CUSTOMER EMAIL ERROR:", error);
        customerEmailResult = {
            success: false,
            message: error.message || "Unable to send inspection PDF to customer."
        };
    }

    // ==================================================
    // ONLY NOW MOVE REQUEST TO SUBMITTED
    // ==================================================

    const result = await inspectionRequestRepository.submitInspection(
        requestIdValue,
        employeeIdValue,
        reportId,
        employeeRemark
    );

    if (!result || result.affectedRows !== 1) {
        throw new Error(
            "Vehicle/PDF were created but inspection request could not be submitted"
        );
    }

    const finalRequest = await inspectionRequestRepository.getRequestById(requestIdValue);

    return {
        request: finalRequest,
        vehicleId,
        carId: vehicleId,
        reportId,
        status: "Submitted",
        pdfGenerated: true,
        pdfPath: pdfResult.pdfPath,
        pdfUrl: pdfResult.pdfUrl || pdfResult.pdfPath,
        fileName: pdfResult.fileName || null,
        adminEmail: adminEmailResult,
        customerEmail: customerEmailResult,
        message:
            "Inspection submitted successfully. PDF generated and email delivery processed. Report sent for Admin review."
    };
};

// ======================================================
// ADMIN APPROVE
// ======================================================

const approveRequest = async (
    requestId,
    adminRemark = null
) => {

    const requestIdValue =
        validateId(
            requestId,
            "Request ID"
        );

    const request =
        await inspectionRequestRepository
            .getRequestById(
                requestIdValue
            );

    if (!request) {
        throw new Error(
            "Inspection request not found"
        );
    }

    if (
        request.status !==
        "Submitted"
    ) {
        throw new Error(
            `Inspection request cannot be approved from "${request.status}" status`
        );
    }

    if (!request.report_id) {
        throw new Error(
            "Inspection report is required before approval"
        );
    }

    if (
        adminRemark !== null &&
        adminRemark !== undefined &&
        typeof adminRemark !== "string"
    ) {
        throw new Error(
            "Admin remark must be text"
        );
    }

    const remark =
        adminRemark === undefined ||
        adminRemark === null
            ? null
            : adminRemark.trim();

    const result =
        await inspectionRequestRepository
            .approveRequest(
                requestIdValue,
                remark || null
            );

    if (
        !result ||
        result.affectedRows !== 1
    ) {
        throw new Error(
            "Inspection request could not be approved"
        );
    }

    return await inspectionRequestRepository
        .getRequestById(
            requestIdValue
        );
};


// ======================================================
// ADMIN REJECT
// ======================================================

const adminRejectRequest = async (
    requestId,
    adminRemark = null
) => {

    const requestIdValue =
        validateId(
            requestId,
            "Request ID"
        );

    const request =
        await inspectionRequestRepository
            .getRequestById(
                requestIdValue
            );

    if (!request) {
        throw new Error(
            "Inspection request not found"
        );
    }

    if (
        request.status !==
        "Submitted"
    ) {
        throw new Error(
            `Inspection request cannot be rejected from "${request.status}" status`
        );
    }

    if (
        adminRemark !== null &&
        adminRemark !== undefined &&
        typeof adminRemark !== "string"
    ) {
        throw new Error(
            "Admin remark must be text"
        );
    }

    const remark =
        adminRemark === undefined ||
        adminRemark === null
            ? null
            : adminRemark.trim();

    const result =
        await inspectionRequestRepository
            .adminRejectRequest(
                requestIdValue,
                remark || null
            );

    if (
        !result ||
        result.affectedRows !== 1
    ) {
        throw new Error(
            "Inspection request could not be rejected"
        );
    }

    return await inspectionRequestRepository
        .getRequestById(
            requestIdValue
        );
};


// ======================================================
// ADMIN PUBLISH REQUEST
// ======================================================

const markRequestPublished = async (
    requestId
) => {

    const requestIdValue =
        validateId(
            requestId,
            "Request ID"
        );

    const request =
        await inspectionRequestRepository
            .getRequestById(
                requestIdValue
            );

    if (!request) {
        throw new Error(
            "Inspection request not found"
        );
    }

    if (
        request.status !==
        "Approved"
    ) {
        throw new Error(
            `Inspection request cannot be published from "${request.status}" status`
        );
    }

    if (!request.report_id) {
        throw new Error(
            "Inspection report is required before publishing"
        );
    }

    if (!request.car_id) {
        throw new Error(
            "Vehicle is required before publishing"
        );
    }

    const result =
        await inspectionRequestRepository
            .markRequestPublished(
                requestIdValue
            );

    if (
        !result ||
        result.affectedRows !== 1
    ) {
        throw new Error(
            "Inspection request could not be marked as published"
        );
    }

    return await inspectionRequestRepository
        .getRequestById(
            requestIdValue
        );
};


// ======================================================
// GET REPORT
// ======================================================

const getRequestReport = async (
    requestId
) => {

    const requestIdValue =
        validateId(
            requestId,
            "Request ID"
        );

    const request =
        await inspectionRequestRepository
            .getRequestReport(
                requestIdValue
            );

    if (!request) {
        throw new Error(
            "Inspection request not found"
        );
    }

    return request;
};


// ======================================================
// GET REQUEST BY REPORT ID
// ======================================================

const getRequestByReportId = async (
    reportId
) => {

    const reportIdValue =
        validateId(
            reportId,
            "Report ID"
        );

    return await inspectionRequestRepository
        .getRequestByReportId(
            reportIdValue
        );
};


// ======================================================
// EXPORTS
// ======================================================

module.exports = {

    getRequestById,
    getEmployeeRequests,
    getAdminRequests,

    acceptRequest,
    rejectRequest,
    startInspection,
    submitInspection,

    approveRequest,
    adminRejectRequest,
    markRequestPublished,

    getRequestReport,
    getRequestByReportId
};