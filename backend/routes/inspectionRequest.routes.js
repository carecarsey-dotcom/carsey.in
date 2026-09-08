const express = require("express");
const router = express.Router();

const inspectionRequestController =
    require("../controllers/inspectionRequest.controller");

const {
    verifyToken,
    requireAdmin,
    requireEmployee,
    requireAdminOrEmployee
} = require("../middlewares/auth.middleware");

const upload = require("../middlewares/upload.middleware");

// ======================================================
// EMPLOYEE
// ======================================================

router.get(
    "/inspection-requests/employee/my-requests",
    verifyToken,
    requireEmployee,
    inspectionRequestController.getEmployeeRequests
);

router.get(
    "/inspection-requests/request/:requestId",
    verifyToken,
    requireAdminOrEmployee,
    inspectionRequestController.getRequestById
);

router.patch(
    "/inspection-requests/request/:requestId/accept",
    verifyToken,
    requireEmployee,
    inspectionRequestController.acceptRequest
);

router.patch(
    "/inspection-requests/request/:requestId/reject",
    verifyToken,
    requireEmployee,
    inspectionRequestController.rejectRequest
);

router.patch(
    "/inspection-requests/request/:requestId/start",
    verifyToken,
    requireEmployee,
    inspectionRequestController.startInspection
);

// Employee submit contains:
// - 10 vehicle photos
// - optional detailed inspection row images
// Therefore this endpoint allows more than 10 files.
router.patch(
    "/inspection-requests/request/:requestId/submit",
    verifyToken,
    requireEmployee,
    upload.array("vehicleImages", 100),
    inspectionRequestController.submitInspection
);

// ======================================================
// ADMIN
// ======================================================

router.get(
    "/inspection-requests",
    verifyToken,
    requireAdmin,
    inspectionRequestController.getAdminRequests
);

router.patch(
    "/inspection-requests/request/:requestId/approve",
    verifyToken,
    requireAdmin,
    inspectionRequestController.approveRequest
);

router.patch(
    "/inspection-requests/request/:requestId/reject-admin",
    verifyToken,
    requireAdmin,
    inspectionRequestController.adminRejectRequest
);

router.patch(
    "/inspection-requests/request/:requestId/publish",
    verifyToken,
    requireAdmin,
    inspectionRequestController.markRequestPublished
);

// ======================================================
// REPORT
// ======================================================

router.get(
    "/inspection-requests/request/:requestId/report",
    verifyToken,
    requireAdminOrEmployee,
    inspectionRequestController.getRequestReport
);

router.get(
    "/inspection-requests/report/:reportId/request",
    verifyToken,
    requireAdminOrEmployee,
    inspectionRequestController.getRequestByReportId
);

module.exports = router;
