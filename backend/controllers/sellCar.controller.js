const sellCarService = require(
    "../services/sellCar.service"
);


// ======================================================
// CREATE SELL CAR REQUEST
// Customer
// ======================================================
// POST
// /api/vehicles/sell-car

const createSellCarRequest = async (req, res) => {
    try {

        // ==================================================
        // REQUEST BODY
        // ==================================================

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

            // NEW FIELD
            ownerName

        } = req.body;


        // ==================================================
        // GET UPLOADED FILES
        // ==================================================

        const files = req.files || {};


        // ==================================================
        // EXISTING IMAGE PATHS
        // ==================================================

        const frontImage =
            files.frontImage && files.frontImage[0]
                ? `/uploads/sell-cars/${files.frontImage[0].filename}`
                : null;


        const backImage =
            files.backImage && files.backImage[0]
                ? `/uploads/sell-cars/${files.backImage[0].filename}`
                : null;


        const leftImage =
            files.leftImage && files.leftImage[0]
                ? `/uploads/sell-cars/${files.leftImage[0].filename}`
                : null;


        const rightImage =
            files.rightImage && files.rightImage[0]
                ? `/uploads/sell-cars/${files.rightImage[0].filename}`
                : null;


        // ==================================================
        // NEW IMAGE PATHS
        // ==================================================

        const interiorFrontImage =
            files.interiorFrontImage &&
            files.interiorFrontImage[0]
                ? `/uploads/sell-cars/${files.interiorFrontImage[0].filename}`
                : null;


        const interiorRearImage =
            files.interiorRearImage &&
            files.interiorRearImage[0]
                ? `/uploads/sell-cars/${files.interiorRearImage[0].filename}`
                : null;


        const openDickyImage =
            files.openDickyImage &&
            files.openDickyImage[0]
                ? `/uploads/sell-cars/${files.openDickyImage[0].filename}`
                : null;


        const openBonnetImage =
            files.openBonnetImage &&
            files.openBonnetImage[0]
                ? `/uploads/sell-cars/${files.openBonnetImage[0].filename}`
                : null;


        const odometerImage =
            files.odometerImage &&
            files.odometerImage[0]
                ? `/uploads/sell-cars/${files.odometerImage[0].filename}`
                : null;


        const dashboardImage =
            files.dashboardImage &&
            files.dashboardImage[0]
                ? `/uploads/sell-cars/${files.dashboardImage[0].filename}`
                : null;


        // ==================================================
        // PREPARE DATA
        // ==================================================

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

            // NEW FIELD
            ownerName,

            // EXISTING IMAGES
            frontImage,
            backImage,
            leftImage,
            rightImage,

            // NEW IMAGES
            interiorFrontImage,
            interiorRearImage,
            openDickyImage,
            openBonnetImage,
            odometerImage,
            dashboardImage

        };


        // ==================================================
        // SERVICE
        // ==================================================

        const data =
            await sellCarService.createSellCarRequest(
                requestData
            );


        // ==================================================
        // SUCCESS
        // ==================================================

        return res.status(201).json({

            success: true,

            message:
                "Sell Car Request Submitted Successfully",

            data

        });

    } catch (error) {

        console.error(
            "Create Sell Car Request Error:",
            error
        );


        return res.status(400).json({

            success: false,

            message:
                error.message ||
                "Unable to submit sell car request"

        });

    }
};


// ======================================================
// GET ALL SELL CAR REQUESTS
// Admin
// ======================================================
// GET
// /api/admin/sell-car-requests

const getAllSellCarRequests = async (req, res) => {

    try {

        const data =
            await sellCarService.getAllSellCarRequests();


        return res.status(200).json({

            success: true,

            message:
                "Sell Car Requests Fetched Successfully",

            data

        });

    } catch (error) {

        console.error(
            "Get Sell Car Requests Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to fetch sell car requests"

        });

    }

};


// ======================================================
// GET SELL CAR REQUEST BY ID
// Admin
// ======================================================
// GET
// /api/admin/sell-car-requests/:sellId

const getSellCarRequestById = async (req, res) => {

    try {

        const { sellId } = req.params;


        const data =
            await sellCarService.getSellCarRequestById(
                sellId
            );


        return res.status(200).json({

            success: true,

            message:
                "Sell Car Request Fetched Successfully",

            data

        });

    } catch (error) {

        console.error(
            "Get Sell Car Request Error:",
            error
        );


        return res.status(404).json({

            success: false,

            message:
                error.message ||
                "Sell car request not found"

        });

    }

};


// ======================================================
// UPDATE SELL CAR REQUEST STATUS
// Admin
// ======================================================
// PATCH
// /api/admin/sell-car-requests/:sellId/status

const updateSellCarRequestStatus = async (req, res) => {

    try {

        const { sellId } = req.params;

        const { status } = req.body;


        const data =
            await sellCarService.updateSellCarRequestStatus(
                sellId,
                status
            );


        return res.status(200).json({

            success: true,

            message:
                "Sell Car Request Status Updated Successfully",

            data

        });

    } catch (error) {

        console.error(
            "Update Sell Car Request Status Error:",
            error
        );


        return res.status(400).json({

            success: false,

            message:
                error.message ||
                "Unable to update sell car request status"

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