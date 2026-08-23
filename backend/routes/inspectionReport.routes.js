const express =
    require("express");


const router =
    express.Router();


const inspectionReportController =
    require(
        "../controllers/inspectionReport.controller"
    );


const {
    verifyToken
} = require(
    "../middlewares/auth.middleware"
);


// ======================================================
// CUSTOMER
// GET UNLOCKED INSPECTION REPORT
// ======================================================

router.get(

    "/:carId/inspection-report",

    inspectionReportController
        .getUnlockedInspectionReport

);


// ======================================================
// CUSTOMER
// GENERATE INSPECTION REPORT PDF
// ======================================================

router.get(

    "/:carId/inspection-report/pdf",

    inspectionReportController
        .generateInspectionReportPdf

);


// ======================================================
// ADMIN
// CREATE INSPECTION REPORT
// ======================================================

router.post(

    "/inspection-reports",

    verifyToken,

    inspectionReportController
        .createInspectionReport

);


// ======================================================
// ADMIN
// GET ALL REPORTS
// ======================================================

router.get(

    "/inspection-reports",

    verifyToken,

    inspectionReportController
        .getAllInspectionReports

);


// ======================================================
// ADMIN
// GET REPORT BY ID
// ======================================================

router.get(

    "/inspection-reports/:reportId",

    verifyToken,

    inspectionReportController
        .getInspectionReportById

);


// ======================================================
// ADMIN
// UPDATE / PUBLISH REPORT
// ======================================================

router.put(

    "/inspection-reports/:reportId",

    verifyToken,

    inspectionReportController
        .updateInspectionReport

);


// ======================================================
// ADMIN
// GENERATE / SAVE PDF
// ======================================================

router.get(

    "/inspection-reports/:reportId/pdf",

    verifyToken,

    inspectionReportController
        .generateAdminInspectionReportPdf

);


// ======================================================
// ADMIN
// SEND PDF TO CUSTOMER
// ======================================================

router.post(

    "/inspection-reports/:reportId/send-email",

    verifyToken,

    inspectionReportController
        .sendInspectionReportEmail

);


// ======================================================
// EXPORT
// ======================================================

module.exports =
    router;