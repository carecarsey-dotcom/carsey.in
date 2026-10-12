const express = require("express");

const router = express.Router();

// ======================================================
// CONTROLLERS
// ======================================================

const sellCarController = require("../controllers/sellCar.controller");

const sellCarPublishController = require("../controllers/sellCarPublish.controller");

// ======================================================
// AUTH MIDDLEWARE
// ======================================================

const {
    verifyToken,
    requireAdmin,
    requireEmployee
} = require("../middlewares/auth.middleware");

// ======================================================
// MULTER MIDDLEWARE
// ======================================================

const {
    uploadSellCarImages
} = require("../middlewares/sellCarUpload.middleware");

// ======================================================
// IMAGE UPLOAD FIELDS
// ======================================================

const sellCarImageFields = [
    { name: "frontImage", maxCount: 1 },
    { name: "backImage", maxCount: 1 },
    { name: "leftImage", maxCount: 1 },
    { name: "rightImage", maxCount: 1 },

    // Existing image fields retained for compatibility.
    { name: "interiorFrontImage", maxCount: 1 },
    { name: "interiorRearImage", maxCount: 1 },
    { name: "openDickyImage", maxCount: 1 },
    { name: "openBonnetImage", maxCount: 1 },
    { name: "odometerImage", maxCount: 1 },
    { name: "dashboardImage", maxCount: 1 }
];

// ======================================================
// CUSTOMER - CREATE SELL CAR REQUEST
// POST /api/vehicles/sell-car
// ======================================================

router.post(
    "/sell-car",
    uploadSellCarImages.fields(sellCarImageFields),
    sellCarController.createSellCarRequest
);

// ======================================================
// ADMIN - GET ALL SELL CAR REQUESTS
// GET /api/admin/sell-car-requests
// ======================================================

router.get(
    "/sell-car-requests",
    verifyToken,
    requireAdmin,
    sellCarController.getAllSellCarRequests
);

// ======================================================
// ADMIN - GET SELL CAR REQUEST BY ID
// GET /api/admin/sell-car-requests/:sellId
// ======================================================

router.get(
    "/sell-car-requests/:sellId",
    verifyToken,
    requireAdmin,
    sellCarController.getSellCarRequestById
);

// ======================================================
// ADMIN - ASSIGN REQUEST TO EMPLOYEE
// PATCH /api/admin/sell-car-requests/:sellId/assign
// Body: { "employeeId": 123 }
// ======================================================

router.patch(
    "/sell-car-requests/:sellId/assign",
    verifyToken,
    requireAdmin,
    sellCarController.assignSellCarRequest
);

// ======================================================
// ADMIN - SEND REQUEST FOR CORRECTION
// PATCH /api/admin/sell-car-requests/:sellId/correction
// Body: { "correctionNote": "Update vehicle details." }
// ======================================================

router.patch(
    "/sell-car-requests/:sellId/correction",
    verifyToken,
    requireAdmin,
    sellCarController.sendSellCarRequestForCorrection
);

// ======================================================
// ADMIN - UPDATE REQUEST STATUS
// PATCH /api/admin/sell-car-requests/:sellId/status
// ======================================================

router.patch(
    "/sell-car-requests/:sellId/status",
    verifyToken,
    requireAdmin,
    sellCarController.updateSellCarRequestStatus
);

// ======================================================
// EMPLOYEE - GET ASSIGNED REQUESTS
// GET /api/employee/sell-car-requests
// ======================================================

router.get(
    "/employee/sell-car-requests",
    verifyToken,
    requireEmployee,
    sellCarController.getAssignedSellCarRequests
);

// ======================================================
// EMPLOYEE - UPDATE ASSIGNED REQUEST
// PATCH /api/employee/sell-car-requests/:sellId
// Content-Type: multipart/form-data
// ======================================================

router.patch(
    "/employee/sell-car-requests/:sellId",
    verifyToken,
    requireEmployee,
    uploadSellCarImages.fields(sellCarImageFields),
    sellCarController.updateAssignedSellCarRequest
);

// ======================================================
// EMPLOYEE - SUBMIT FOR ADMIN APPROVAL
// POST /api/employee/sell-car-requests/:sellId/submit
// ======================================================

router.post(
    "/employee/sell-car-requests/:sellId/submit",
    verifyToken,
    requireEmployee,
    sellCarController.submitSellCarRequestForApproval
);

// ======================================================
// ADMIN - PUBLISH VEHICLE FROM SELL CAR REQUEST
// POST /api/admin/vehicles/from-sell-car/:sellId
// ======================================================

router.post(
    "/vehicles/from-sell-car/:sellId",
    verifyToken,
    requireAdmin,
    uploadSellCarImages.fields(sellCarImageFields),
    sellCarPublishController.publishFromSellCar
);

// ======================================================
// EXPORT
// ======================================================

module.exports = router;