const inspectionReportRepository =
    require("../repositories/inspectionReport.repository");

const inspectionReportPdfService =
    require("./inspectionReportPdf.service");

const emailService =
    require("./email.service");

const env =
    require("../config/env");

const path =
    require("path");

const fs =
    require("fs");

// ======================================================
// NORMALIZE INSPECTION SCORE
// ======================================================

const normalizeOverallScore = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return NaN;
    }

    const normalized =
        number > 10 && number <= 100
            ? number / 10
            : number;

    return Number(normalized.toFixed(1));
};

// ======================================================
// CREATE INSPECTION REPORT
// ======================================================

const createInspectionReport = async (reportData) => {
    const carId = Number(reportData.carId);

    if (!Number.isInteger(carId) || carId <= 0) {
        throw new Error("Invalid car ID.");
    }

    const overallScore = normalizeOverallScore(reportData.overallScore);

    if (!Number.isFinite(overallScore) || overallScore < 0 || overallScore > 10) {
        throw new Error("Overall score must be between 0 and 10.");
    }

    if (!reportData.engineRemark || !String(reportData.engineRemark).trim()) {
        throw new Error("Engine remark is required.");
    }

    if (!reportData.overallRemark || !String(reportData.overallRemark).trim()) {
        throw new Error("Overall remark is required.");
    }

    const publishStatus =
        String(reportData.publishStatus || "").toLowerCase() === "yes" ||
        String(reportData.publishStatus || "").toLowerCase() === "published"
            ? "Yes"
            : "No";

    const result = await inspectionReportRepository.createInspectionReport({
        carId,
        overallScore,
        engineRemark: String(reportData.engineRemark).trim(),
        overallRemark: String(reportData.overallRemark).trim(),
        pdfPath: reportData.pdfPath || null,
        publishStatus
    });

    return {
        reportId: result.reportId,
        message: "Inspection report created successfully."
    };
};

// ======================================================
// GET UNLOCKED REPORT (CUSTOMER)
// ======================================================

const getUnlockedInspectionReport = async (carId, requestId) => {
    const numericCarId = Number(carId);
    const numericRequestId = Number(requestId);

    if (!Number.isInteger(numericCarId) || numericCarId <= 0) {
        throw new Error("Invalid car ID.");
    }

    if (!Number.isInteger(numericRequestId) || numericRequestId <= 0) {
        throw new Error("Invalid unlock request ID.");
    }

    const unlockRequest = await inspectionReportRepository.getApprovedUnlockRequest(
        numericRequestId,
        numericCarId
    );

    if (!unlockRequest) {
        throw new Error("Report unlock request is not approved.");
    }

    const report = await inspectionReportRepository.getInspectionReportByCarId(numericCarId);

    if (!report) {
        throw new Error("Inspection report is not available.");
    }

    const reportPublishStatus = String(
        report.publish_status || report.publishStatus || ""
    ).toLowerCase();

    if (reportPublishStatus !== "yes" && reportPublishStatus !== "published") {
        throw new Error("Inspection report is not published.");
    }

    return {
        request: {
            requestId: unlockRequest.request_id,
            carId: unlockRequest.car_id,
            status: unlockRequest.status
        },
        report: {
            reportId: report.report_id,
            carId: report.car_id,
            overallScore: report.overall_score,
            engineRemark: report.engine_remark,
            overallRemark: report.overall_remark,
            pdfPath: report.pdf_path,
            publishStatus: report.publish_status,
            createdAt: report.created_at
        }
    };
};

// ======================================================
// GET ALL REPORTS (ADMIN)
// ======================================================

const getAllInspectionReports = async () => {
    const reports = await inspectionReportRepository.getAllInspectionReports();
    return { reports };
};

// ======================================================
// GET REPORT BY ID (ADMIN)
// ======================================================

const getInspectionReportById = async (reportId) => {
    const numericReportId = Number(reportId);

    if (!Number.isInteger(numericReportId) || numericReportId <= 0) {
        throw new Error("Invalid report ID.");
    }

    const report = await inspectionReportRepository.getInspectionReportById(numericReportId);

    if (!report) {
        throw new Error("Inspection report not found.");
    }

    return {
        reportId: report.report_id,
        carId: report.car_id,
        overallScore: report.overall_score,
        engineRemark: report.engine_remark,
        overallRemark: report.overall_remark,
        pdfPath: report.pdf_path,
        publishStatus: report.publish_status,
        createdAt: report.created_at
    };
};

// ======================================================
// UPDATE INSPECTION REPORT (ADMIN)
// ======================================================

const updateInspectionReport = async (reportId, reportData) => {
    const numericReportId = Number(reportId);

    if (!Number.isInteger(numericReportId) || numericReportId <= 0) {
        throw new Error("Invalid report ID.");
    }

    const existingReport = await inspectionReportRepository.getInspectionReportById(numericReportId);

    if (!existingReport) {
        throw new Error("Inspection report not found.");
    }

    const overallScore = normalizeOverallScore(reportData.overallScore);

    if (!Number.isFinite(overallScore) || overallScore < 0 || overallScore > 10) {
        throw new Error("Overall score must be between 0 and 10.");
    }

    if (!reportData.engineRemark || !String(reportData.engineRemark).trim()) {
        throw new Error("Engine remark is required.");
    }

    if (!reportData.overallRemark || !String(reportData.overallRemark).trim()) {
        throw new Error("Overall remark is required.");
    }

    const requestedPublishStatus = String(reportData.publishStatus || "").toLowerCase();
    const publishStatus =
        requestedPublishStatus === "yes" || requestedPublishStatus === "published"
            ? "Yes"
            : "No";

    await inspectionReportRepository.updateInspectionReport(numericReportId, {
        overallScore,
        engineRemark: String(reportData.engineRemark).trim(),
        overallRemark: String(reportData.overallRemark).trim(),
        publishStatus
    });

    if (publishStatus !== "Yes") {
        return {
            reportId: numericReportId,
            carId: existingReport.car_id,
            message: "Inspection report updated successfully.",
            publishStatus: "No",
            pdfPath: existingReport.pdf_path || null,
            pdfUrl: existingReport.pdf_path || null,
            adminEmail: null,
            customerEmail: null
        };
    }

    // ==================================================
    // PUBLISH PROCESS
    // ==================================================

    if (typeof inspectionReportRepository.markInspectionReportPublished === "function") {
        await inspectionReportRepository.markInspectionReportPublished(numericReportId);
    }

    let publishedReport = null;
    try {
        publishedReport = await inspectionReportRepository.getInspectionReportById(numericReportId);
    } catch (publishFetchError) {
        console.error("Published Report Fetch Error:", publishFetchError);
    }

    const verifiedPublishStatus = String(
        (publishedReport && (publishedReport.publish_status || publishedReport.publishStatus)) || ""
    ).toLowerCase();

    if (verifiedPublishStatus !== "yes" && verifiedPublishStatus !== "published") {
        throw new Error("Inspection report could not be verified as published. PDF and emails were not sent.");
    }

    // --------------------------------------------------
    // VEHICLE DATA
    // --------------------------------------------------
    let vehicleData = null;
    try {
        const vehicleRepository = require("../repositories/vehicle.repository");
        if (typeof vehicleRepository.getCompleteVehicleData === "function") {
            vehicleData = await vehicleRepository.getCompleteVehicleData(existingReport.car_id);
        } else if (typeof vehicleRepository.getVehicleById === "function") {
            vehicleData = await vehicleRepository.getVehicleById(existingReport.car_id);
        } else {
            throw new Error("Vehicle repository does not contain getCompleteVehicleData or getVehicleById.");
        }
    } catch (vehicleError) {
        console.error("Complete Vehicle Data Fetch Error:", vehicleError);
        throw new Error(`Vehicle data could not be loaded: ${vehicleError.message}`);
    }

    if (!vehicleData) {
        throw new Error("Vehicle data could not be loaded.");
    }

    // --------------------------------------------------
    // VEHICLE IMAGES
    // --------------------------------------------------
    let vehicleImages = [];
    try {
        const vehicleImageRepository = require("../repositories/vehicleImage.repository");
        if (typeof vehicleImageRepository.getVehicleImages === "function") {
            vehicleImages = await vehicleImageRepository.getVehicleImages(existingReport.car_id);
        }
    } catch (imageError) {
        console.error("Vehicle Images Fetch Error:", imageError);
        vehicleImages = [];
    }

    if (!Array.isArray(vehicleImages) || vehicleImages.length === 0) {
        throw new Error("Vehicle images are not uploaded yet. Final inspection PDF cannot be generated.");
    }

    // --------------------------------------------------
    // FETCH ACTUAL CHECKLIST FROM REPOSITORY (CRITICAL FIX)
    // --------------------------------------------------
    let dbChecklist = null;
    try {
        // Try inspectionReportRepository first
        if (typeof inspectionReportRepository.getInspectionChecklistByReportId === "function") {
            dbChecklist = await inspectionReportRepository.getInspectionChecklistByReportId(numericReportId);
        } else if (typeof inspectionReportRepository.getChecklistByReportId === "function") {
            dbChecklist = await inspectionReportRepository.getChecklistByReportId(numericReportId);
        }

        // If not found, try vehicleRepository
        if (!dbChecklist) {
            const vehicleRepo = require("../repositories/vehicle.repository");
            if (typeof vehicleRepo.getInspectionChecklist === "function") {
                dbChecklist = await vehicleRepo.getInspectionChecklist(existingReport.car_id);
            }
        }
    } catch (chkErr) {
        console.warn("Direct checklist fetch warning:", chkErr.message);
    }

    // --------------------------------------------------
    // NORMALIZE OBJECTS
    // --------------------------------------------------
    const rawVehicle = vehicleData.vehicle || vehicleData.data?.vehicle || vehicleData.data || vehicleData || {};
    const rawOwner = vehicleData.owner || vehicleData.customer || vehicleData.customerDetails || vehicleData.customer_details || vehicleData.data?.owner || {};

    const ownerName =
        rawOwner.ownerName || rawOwner.owner_name || rawOwner.name || rawOwner.fullName ||
        vehicleData.customer_name || vehicleData.customerName || "-";

    const ownerMobile =
        rawOwner.mobile || rawOwner.phone || rawOwner.phoneNumber ||
        vehicleData.owner_mobile || vehicleData.customer_mobile || "-";

    const ownerEmail =
        rawOwner.email || rawOwner.owner_email || rawOwner.customer_email ||
        vehicleData.owner_email || vehicleData.customer_email || "-";

    const ownerAddress =
        rawOwner.address || rawOwner.owner_address || rawOwner.customer_address ||
        vehicleData.owner_address || vehicleData.address || "-";

    const ownerObject = {
        ...rawOwner,
        ownerName,
        owner_name: ownerName,
        name: ownerName,
        customerName: ownerName,
        customer_name: ownerName,
        mobile: ownerMobile,
        phone: ownerMobile,
        owner_mobile: ownerMobile,
        ownerMobile: ownerMobile,
        email: ownerEmail,
        owner_email: ownerEmail,
        ownerEmail: ownerEmail,
        address: ownerAddress,
        owner_address: ownerAddress,
        ownerAddress: ownerAddress
    };

    const rawInspection = vehicleData.inspection || vehicleData.inspectionData || vehicleData.data?.inspection || {};
    const completeInspection = {
        ...rawInspection,
        overall_score: overallScore,
        overallScore: overallScore,
        engine_remark: String(reportData.engineRemark).trim(),
        engineRemark: String(reportData.engineRemark).trim(),
        overall_remark: String(reportData.overallRemark).trim(),
        overallRemark: String(reportData.overallRemark).trim()
    };

    // Priority to database checklist, then reportData, then vehicleData
    const checklistData =
        dbChecklist ||
        reportData.checklist ||
        reportData.inspection_checklist ||
        reportData.detailedInspection ||
        vehicleData.checklist ||
        vehicleData.inspection_checklist ||
        vehicleData.inspection?.checklist ||
        [];

    const completeReport = {
        ...existingReport,
        ...(publishedReport || {}),
        ...reportData,
        customer_name: ownerName,
        owner_name: ownerName,
        owner_mobile: ownerMobile,
        owner_email: ownerEmail,
        owner_address: ownerAddress,
        reportId: numericReportId,
        report_id: numericReportId,
        carId: existingReport.car_id,
        car_id: existingReport.car_id,
        overallScore,
        overall_score: overallScore,
        engineRemark: String(reportData.engineRemark).trim(),
        engine_remark: String(reportData.engineRemark).trim(),
        overallRemark: String(reportData.overallRemark).trim(),
        overall_remark: String(reportData.overallRemark).trim(),
        publishStatus: "Yes",
        publish_status: "Yes",
        vehicle: rawVehicle,
        vehicleData: rawVehicle,
        owner: ownerObject,
        customer: ownerObject,
        customerDetails: ownerObject,
        inspection: completeInspection,
        checklist: checklistData,
        inspection_checklist: checklistData,
        inspectionChecklist: checklistData,
        detailedInspection: checklistData,
        images: vehicleImages,
        vehicleImages: vehicleImages
    };

    // Generate PDF
    const pdf = await inspectionReportPdfService.generateInspectionReportPdf(completeReport);

    if (!pdf || !pdf.filePath || !pdf.pdfPath) {
        throw new Error("Inspection PDF could not be generated.");
    }

    if (!fs.existsSync(pdf.filePath)) {
        throw new Error("Generated inspection report PDF file was not found.");
    }

    await inspectionReportRepository.updateInspectionReportPdfPath(numericReportId, pdf.pdfPath);

    let adminEmailResult = null;
    let customerEmailResult = null;

    // Send Admin Email
    try {
        if (env.ADMIN_EMAIL) {
            adminEmailResult = await emailService.sendInspectionReportToAdmin({
                pdfPath: pdf.filePath,
                fileName: pdf.fileName,
                carId: existingReport.car_id,
                reportId: numericReportId
            });
        }
    } catch (emailError) {
        console.error("Admin Email Error:", emailError);
        adminEmailResult = { success: false, message: emailError.message };
    }

    // Send Customer Email
    try {
        const deliveryReport = await inspectionReportRepository.getReportDeliveryData(numericReportId);
        const customerEmail =
            (deliveryReport && (deliveryReport.owner_email || deliveryReport.customer_email || deliveryReport.email)) ||
            ownerObject.email || "";

        if (customerEmail && String(customerEmail).trim() && customerEmail !== "-") {
            customerEmailResult = await emailService.sendInspectionReportEmail({
                to: String(customerEmail).trim().toLowerCase(),
                subject: `Carsey.in - Vehicle Inspection Report #${numericReportId}`,
                customerName: ownerObject.ownerName || "Customer",
                pdfPath: pdf.filePath,
                fileName: pdf.fileName
            });
        } else {
            customerEmailResult = {
                success: false,
                skipped: true,
                message: "Customer email is not available. PDF was saved successfully."
            };
        }
    } catch (customerEmailError) {
        console.error("Customer Email Error:", customerEmailError);
        customerEmailResult = { success: false, message: customerEmailError.message };
    }

    return {
        reportId: numericReportId,
        carId: existingReport.car_id,
        message: "Inspection report published, PDF generated and email delivery processed successfully.",
        pdfPath: pdf.pdfPath,
        pdfUrl: pdf.pdfPath,
        pdfFileName: pdf.fileName,
        adminEmail: adminEmailResult,
        customerEmail: customerEmailResult,
        publishStatus: "Yes"
    };
};

// ======================================================
// SEND REPORT TO CUSTOMER EMAIL
// ======================================================

const sendReportToCustomerEmail = async (reportId, customerEmail) => {
    if (!customerEmail || !String(customerEmail).trim()) {
        throw new Error("Customer email is required.");
    }

    const email = String(customerEmail).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid customer email.");
    }

    const report = await inspectionReportRepository.getReportDeliveryData(reportId);
    if (!report) {
        throw new Error("Inspection report not found.");
    }

    const reportPublishStatus = String(report.publish_status || report.publishStatus || "").toLowerCase();
    if (reportPublishStatus !== "yes" && reportPublishStatus !== "published") {
        throw new Error("Inspection report is not published.");
    }

    const storedPdfPath = String(report.pdf_path || report.pdfPath || "").trim();
    if (!storedPdfPath) {
        throw new Error("Inspection report PDF has not been generated.");
    }

    const backendRoot = process.cwd();
    const uploadRoot = path.join(backendRoot, "uploads");
    const candidatePdfPaths = [];

    const addCandidatePdfPath = (candPath) => {
        if (!candPath) return;
        const val = String(candPath).trim();
        const abs = path.isAbsolute(val) ? path.normalize(val) : path.resolve(backendRoot, val.replace(/^[/\\]+/, ""));
        if (!candidatePdfPaths.includes(abs)) candidatePdfPaths.push(abs);
    };

    addCandidatePdfPath(storedPdfPath);
    const fileName = path.basename(storedPdfPath);
    addCandidatePdfPath(path.join(uploadRoot, "inspection-reports", fileName));
    addCandidatePdfPath(path.join(uploadRoot, "reports", fileName));

    const pdfAbsolutePath = candidatePdfPaths.find((cand) => fs.existsSync(cand) && fs.statSync(cand).isFile());

    if (!pdfAbsolutePath) {
        throw new Error("Inspection report PDF file not found on server.");
    }

    const emailResult = await emailService.sendInspectionReportEmail({
        to: email,
        subject: `Carsey.in - Vehicle Inspection Report #${report.report_id || reportId}`,
        customerName: report.owner_name || report.customer_name || "Customer",
        pdfPath: pdfAbsolutePath,
        fileName: fileName
    });

    return {
        success: true,
        message: "Inspection report sent to customer email successfully.",
        email: emailResult
    };
};

module.exports = {
    createInspectionReport,
    getUnlockedInspectionReport,
    getAllInspectionReports,
    getInspectionReportById,
    updateInspectionReport,
    sendReportToCustomerEmail
};