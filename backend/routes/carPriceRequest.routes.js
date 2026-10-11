const express = require("express");
const router = express.Router();

const {
    submitCarPriceRequest
} = require("../controllers/carPriceRequest.controller");

// POST /api/car-price-requests/:carId
router.post("/:carId", submitCarPriceRequest);

module.exports = router;
