const express = require("express");

const router = express.Router();

const authController =
    require("../controllers/auth.controller");

const {
    verifyToken,
    requireAdmin
} = require("../middlewares/auth.middleware");


// ======================================================
// LOGIN
// ADMIN + EMPLOYEE
// PUBLIC
// ======================================================

// POST
// /api/auth/login

router.post(
    "/login",
    authController.login
);


// ======================================================
// PROFILE
// ADMIN + EMPLOYEE
// PROTECTED
// ======================================================

// GET
// /api/auth/profile

router.get(
    "/profile",
    verifyToken,
    authController.profile
);


// ======================================================
// CHANGE PASSWORD
// ADMIN + EMPLOYEE
// PROTECTED
// ======================================================

// PUT
// /api/auth/change-password

router.put(
    "/change-password",
    verifyToken,
    authController.changePassword
);


// ======================================================
// EMPLOYEE MANAGEMENT
// ADMIN ONLY
// ======================================================


// ======================================================
// CREATE EMPLOYEE
// ======================================================

// POST
// /api/auth/employees

router.post(
    "/employees",
    verifyToken,
    requireAdmin,
    authController.createEmployee
);


// ======================================================
// GET ALL EMPLOYEES
// ======================================================

// GET
// /api/auth/employees

router.get(
    "/employees",
    verifyToken,
    requireAdmin,
    authController.getEmployees
);


// ======================================================
// GET SINGLE EMPLOYEE
// ======================================================

// GET
// /api/auth/employees/:employeeId

router.get(
    "/employees/:employeeId",
    verifyToken,
    requireAdmin,
    authController.getEmployee
);


// ======================================================
// UPDATE EMPLOYEE STATUS
// ======================================================

// PATCH
// /api/auth/employees/:employeeId/status

router.patch(
    "/employees/:employeeId/status",
    verifyToken,
    requireAdmin,
    authController.updateEmployeeStatus
);


// ======================================================
// EXPORT
// ======================================================

module.exports = router;