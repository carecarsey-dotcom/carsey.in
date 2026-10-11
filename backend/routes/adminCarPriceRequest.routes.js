const express = require("express");
const router = express.Router();

const {
  verifyToken,
  requireAdmin,
} = require("../middlewares/auth.middleware");

const {
  getCarPriceRequests,
  updateCarPriceRequestStatus,
} = require("../controllers/adminCarPriceRequest.controller");

// Get all car price requests
router.get("/", verifyToken, requireAdmin, getCarPriceRequests);

// Update request status
router.patch(
  "/:id/status",
  verifyToken,
  requireAdmin,
  updateCarPriceRequestStatus
);

module.exports = router;