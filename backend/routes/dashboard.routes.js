const express = require("express");

const dashboardController = require(
    "../controllers/dashboard.controller"
);

const {
    verifyToken
} = require(
    "../middlewares/auth.middleware"
);

const router = express.Router();


// ======================================================
// ADMIN DASHBOARD
// PROTECTED
// ======================================================

// GET
//
// /api/admin/dashboard

router.get(
    "/dashboard",
    verifyToken,
    dashboardController.getAdminDashboard
);


// ======================================================
// EXPORT
// ======================================================

module.exports = router;