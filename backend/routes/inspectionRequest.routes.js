
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

// ======================================================
// SHARED INSPECTION DRAFT
// ADMIN + ASSIGNED EMPLOYEE
// ======================================================

router.get(
    "/inspection-requests/request/:requestId/draft",
    verifyToken,
    requireAdminOrEmployee,
    inspectionRequestController.getSharedDraft
);

router.put(
    "/inspection-requests/request/:requestId/draft",
    verifyToken,
    requireAdminOrEmployee,
    inspectionRequestController.saveSharedDraft
);

// ======================================================
// EMPLOYEE ACTIONS
// ======================================================

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

// ======================================================
// SUBMIT INSPECTION
// ADMIN + EMPLOYEE
//
// IMPORTANT:
// Controller and service must also authorize Admin
// and Employee correctly.
// ======================================================

router.patch(
    "/inspection-requests/request/:requestId/submit",
    verifyToken,
    requireAdminOrEmployee,
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

// ======================================================
// EXPORT
// ======================================================

module.exports = router;

