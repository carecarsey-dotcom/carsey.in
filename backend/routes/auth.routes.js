const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

// Admin Login
router.post("/login", authController.login);

// Admin Profile
router.get("/profile", verifyToken, authController.profile);

// Change Password
router.put(
    "/change-password",
    verifyToken,
    authController.changePassword
);

module.exports = router;