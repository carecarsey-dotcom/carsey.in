const exchangeService = require(
    "../services/exchange.service"
);


// ======================================================
// CREATE EXCHANGE REQUEST
// Customer
// ======================================================

// POST
// /api/vehicles/exchange

const createExchangeRequest = async (
    req,
    res
) => {

    try {

        // ==================================================
        // GET FORM DATA
        // ==================================================

        const {

            name,

            mobile,

            email,

            currentBrand,

            currentModel,

            currentYear,

            currentVehiclePrice,

            preferredBrand,

            preferredModel,

            preferredVariant,

            budget

        } = req.body;


        // ==================================================
        // GET UPLOADED IMAGE
        // ==================================================

        let vehicleImage = null;


        if (req.file) {

            vehicleImage =
                `uploads/exchange/${req.file.filename}`;

        }


        // ==================================================
        // PREPARE DATA
        // ==================================================

        const exchangeData = {

            name,

            mobile,

            email,

            currentBrand,

            currentModel,

            currentYear,

            currentVehiclePrice,

            preferredBrand,

            preferredModel,

            preferredVariant,

            budget,

            vehicleImage

        };


        // ==================================================
        // SERVICE
        // ==================================================

        const data =
            await exchangeService
                .createExchangeRequest(
                    exchangeData
                );


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.status(201).json({

            success: true,

            message:
                "Exchange Request Submitted Successfully",

            data

        });

    } catch (error) {

        console.error(
            "Create Exchange Request Error:",
            error
        );


        return res.status(400).json({

            success: false,

            message:
                error.message ||
                "Unable to submit exchange request"

        });

    }

};


// ======================================================
// GET ALL EXCHANGE REQUESTS
// Admin
// ======================================================

// GET
// /api/admin/exchange-requests

const getAllExchangeRequests = async (
    req,
    res
) => {

    try {

        // ==================================================
        // GET REQUESTS
        // ==================================================

        const data =
            await exchangeService
                .getAllExchangeRequests();


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.status(200).json({

            success: true,

            message:
                "Exchange Requests Fetched Successfully",

            data

        });

    } catch (error) {

        console.error(
            "Get Exchange Requests Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to fetch exchange requests"

        });

    }

};


// ======================================================
// GET EXCHANGE REQUEST BY ID
// Admin
// ======================================================

// GET
// /api/admin/exchange-requests/:exchangeId

const getExchangeRequestById = async (
    req,
    res
) => {

    try {

        // ==================================================
        // GET ID
        // ==================================================

        const {
            exchangeId
        } = req.params;


        // ==================================================
        // SERVICE
        // ==================================================

        const data =
            await exchangeService
                .getExchangeRequestById(
                    exchangeId
                );


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.status(200).json({

            success: true,

            message:
                "Exchange Request Fetched Successfully",

            data

        });

    } catch (error) {

        console.error(
            "Get Exchange Request By ID Error:",
            error
        );


        return res.status(404).json({

            success: false,

            message:
                error.message ||
                "Exchange request not found"

        });

    }

};


// ======================================================
// UPDATE EXCHANGE REQUEST STATUS
// Admin
// ======================================================

// PATCH
// /api/admin/exchange-requests/:exchangeId/status

const updateExchangeRequestStatus = async (
    req,
    res
) => {

    try {

        // ==================================================
        // GET ID
        // ==================================================

        const {
            exchangeId
        } = req.params;


        // ==================================================
        // GET STATUS
        // ==================================================

        const {
            status
        } = req.body;


        // ==================================================
        // SERVICE
        // ==================================================

        const data =
            await exchangeService
                .updateExchangeRequestStatus(
                    exchangeId,
                    status
                );


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.status(200).json({

            success: true,

            message:
                "Exchange Request Status Updated Successfully",

            data

        });

    } catch (error) {

        console.error(
            "Update Exchange Request Status Error:",
            error
        );


        return res.status(400).json({

            success: false,

            message:
                error.message ||
                "Unable to update exchange request status"

        });

    }

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    createExchangeRequest,

    getAllExchangeRequests,

    getExchangeRequestById,

    updateExchangeRequestStatus

};