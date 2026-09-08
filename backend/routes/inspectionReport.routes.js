const express = require("express");

const router = express.Router();

const inspectionReportController =
    require("../controllers/inspectionReport.controller");

const {
    verifyToken,
    requireAdmin,
    requireAdminOrEmployee
} = require("../middlewares/auth.middleware");

// CUSTOMER
router.get(
    "/:carId/inspection-report",
    inspectionReportController.getUnlockedInspectionReport
);

// CUSTOMER
router.get(
    "/:carId/inspection-report/pdf",
    inspectionReportController.generateInspectionReportPdf
);

// ADMIN
router.post(
    "/inspection-reports",
    verifyToken,
    requireAdmin,
    inspectionReportController.createInspectionReport
);

// ADMIN
router.get(
    "/inspection-reports",
    verifyToken,
    requireAdmin,
    inspectionReportController.getAllInspectionReports
);

// ADMIN
router.get(
    "/inspection-reports/:reportId",
    verifyToken,
    requireAdmin,
    inspectionReportController.getInspectionReportById
);

// ADMIN
router.put(
    "/inspection-reports/:reportId",
    verifyToken,
    requireAdmin,
    inspectionReportController.updateInspectionReport
);

// ADMIN + EMPLOYEE
// Employee uses this only after Submit to generate/save the
// same backend PDF. This endpoint does NOT publish the vehicle.
router.get(
    "/inspection-reports/:reportId/pdf",
    verifyToken,
    requireAdminOrEmployee,
    inspectionReportController.generateAdminInspectionReportPdf
);

// ADMIN
router.post(
    "/inspection-reports/:reportId/send-email",
    verifyToken,
    requireAdmin,
    inspectionReportController.sendInspectionReportEmail
);

module.exports = router;
