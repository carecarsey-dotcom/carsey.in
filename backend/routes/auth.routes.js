const express = require("express");

const router = express.Router();

const authController = require(
    "../controllers/auth.controller"
);

const {
    verifyToken,
    requireAdmin
} = require("../middlewares/auth.middleware");

// ======================================================
// LOGIN
// ADMIN + EMPLOYEE
// PUBLIC
// ======================================================

router.post(
    "/login",
    authController.login
);

// ======================================================
// PROFILE
// ADMIN + EMPLOYEE
// PROTECTED
// ======================================================

router.get(
    "/profile",
    verifyToken,
    authController.profile
);

// ======================================================
// EXISTING CHANGE PASSWORD
// ADMIN + EMPLOYEE
// CURRENT PASSWORD REQUIRED
// ======================================================

router.put(
    "/change-password",
    verifyToken,
    authController.changePassword
);

// ======================================================
// SET OWN PASSWORD
// ADMIN ONLY
// OLD PASSWORD NOT REQUIRED
// ======================================================

router.put(
    "/set-password",
    verifyToken,
    requireAdmin,
    authController.setOwnPassword
);

// ======================================================
// EMPLOYEE MANAGEMENT
// ADMIN ONLY
// ======================================================

// CREATE EMPLOYEE

router.post(
    "/employees",
    verifyToken,
    requireAdmin,
    authController.createEmployee
);

// GET ALL EMPLOYEES

router.get(
    "/employees",
    verifyToken,
    requireAdmin,
    authController.getEmployees
);

// GET SINGLE EMPLOYEE

router.get(
    "/employees/:employeeId",
    verifyToken,
    requireAdmin,
    authController.getEmployee
);

// UPDATE EMPLOYEE STATUS

router.patch(
    "/employees/:employeeId/status",
    verifyToken,
    requireAdmin,
    authController.updateEmployeeStatus
);

// ======================================================
// CHANGE EMPLOYEE PASSWORD
// ADMIN ONLY
// ======================================================

router.put(
    "/employees/:employeeId/password",
    verifyToken,
    requireAdmin,
    authController.changeEmployeePassword
);

// ======================================================
// EXPORT
// ======================================================

module.exports = router;