const sellCarService = require("../services/sellCar.service");

// ======================================================
// CREATE SELL CAR REQUEST
// Customer
// POST /api/vehicles/sell-car
// ======================================================

const createSellCarRequest = async (req, res) => {
    try {
        const {
            sellerName,
            mobile,
            email,
            city,
            brand,
            model,
            variant,
            vehicleNumber,
            manufacturingYear,
            fuelType,
            transmission,
            kmDriven,
            expectedPrice,
            ownerName,
            ownerClassification
        } = req.body;

        const files = req.files || {};

        const getImagePath = (fieldName) =>
            files[fieldName] && files[fieldName][0]
                ? `/uploads/sell-cars/${files[fieldName][0].filename}`
                : null;

        const requestData = {
            sellerName,
            mobile,
            email,
            city,
            brand,
            model,
            variant,
            vehicleNumber,
            manufacturingYear,
            fuelType,
            transmission,
            kmDriven,
            expectedPrice,
            ownerName,
            ownerClassification,

            frontImage: getImagePath("frontImage"),
            backImage: getImagePath("backImage"),
            leftImage: getImagePath("leftImage"),
            rightImage: getImagePath("rightImage"),
            interiorFrontImage: getImagePath("interiorFrontImage"),
            interiorRearImage: getImagePath("interiorRearImage"),
            openDickyImage: getImagePath("openDickyImage"),
            openBonnetImage: getImagePath("openBonnetImage"),
            odometerImage: getImagePath("odometerImage"),
            dashboardImage: getImagePath("dashboardImage")
        };

        const data = await sellCarService.createSellCarRequest(requestData);

        return res.status(201).json({
            success: true,
            message: "Sell Car Request Submitted Successfully",
            data
        });
    } catch (error) {
        console.error("Create Sell Car Request Error:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Unable to submit sell car request"
        });
    }
};

// ======================================================
// GET ALL SELL CAR REQUESTS
// Admin
// GET /api/admin/sell-car-requests
// ======================================================

const getAllSellCarRequests = async (req, res) => {
    try {
        const data = await sellCarService.getAllSellCarRequests();

        return res.status(200).json({
            success: true,
            message: "Sell Car Requests Fetched Successfully",
            data
        });
    } catch (error) {
        console.error("Get Sell Car Requests Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Unable to fetch sell car requests"
        });
    }
};

// ======================================================
// GET SELL CAR REQUEST BY ID
// Admin
// GET /api/admin/sell-car-requests/:sellId
// ======================================================

const getSellCarRequestById = async (req, res) => {
    try {
        const { sellId } = req.params;
        const data = await sellCarService.getSellCarRequestById(sellId);

        return res.status(200).json({
            success: true,
            message: "Sell Car Request Fetched Successfully",
            data
        });
    } catch (error) {
        console.error("Get Sell Car Request Error:", error);

        return res.status(404).json({
            success: false,
            message: error.message || "Sell car request not found"
        });
    }
};

// ======================================================
// UPDATE SELL CAR REQUEST STATUS
// Admin
// PATCH /api/admin/sell-car-requests/:sellId/status
// ======================================================

const updateSellCarRequestStatus = async (req, res) => {
    try {
        const { sellId } = req.params;
        const { status } = req.body;

        const data = await sellCarService.updateSellCarRequestStatus(
            sellId,
            status
        );

        return res.status(200).json({
            success: true,
            message: "Sell Car Request Status Updated Successfully",
            data
        });
    } catch (error) {
        console.error("Update Sell Car Request Status Error:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Unable to update sell car request status"
        });
    }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
    createSellCarRequest,
    getAllSellCarRequests,
    getSellCarRequestById,
    updateSellCarRequestStatus
};
