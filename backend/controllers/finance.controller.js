const financeService = require(
    "../services/finance.service"
);


// ======================================================
// CREATE FINANCE REQUEST
// Customer API
// ======================================================

// POST
// /api/vehicles/:carId/finance

const createFinanceRequest = async (
    req,
    res
) => {

    try {

        // ==================================================
        // GET CAR ID
        // ==================================================

        const {
            carId
        } = req.params;


        // ==================================================
        // GET BODY DATA
        // ==================================================

        const {

            name,

            mobile,

            email,

            occupation,

            monthlyIncome,

            downPayment

        } = req.body;


        // ==================================================
        // PREPARE DATA
        // ==================================================

        const financeData = {

            carId,

            name,

            mobile,

            email,

            occupation,

            monthlyIncome,

            downPayment

        };


        // ==================================================
        // SERVICE CALL
        // ==================================================

        const data =
            await financeService
                .createFinanceRequest(
                    financeData
                );


        // ==================================================
        // SUCCESS RESPONSE
        // ==================================================

        return res.status(201).json({

            success: true,

            message:
                "Finance Request Submitted Successfully",

            data

        });

    } catch (error) {

        // ==================================================
        // ERROR LOG
        // ==================================================

        console.error(
            "Create Finance Request Error:",
            error
        );


        // ==================================================
        // ERROR RESPONSE
        // ==================================================

        return res.status(400).json({

            success: false,

            message:
                error.message ||
                "Unable to submit finance request"

        });

    }

};


// ======================================================
// GET ALL FINANCE REQUESTS
// Admin API
// ======================================================

// GET
// /api/admin/finance-requests

const getAllFinanceRequests = async (
    req,
    res
) => {

    try {

        // ==================================================
        // SERVICE CALL
        // ==================================================

        const data =
            await financeService
                .getAllFinanceRequests();


        // ==================================================
        // SUCCESS RESPONSE
        // ==================================================

        return res.status(200).json({

            success: true,

            message:
                "Finance Requests Fetched Successfully",

            data

        });

    } catch (error) {

        // ==================================================
        // ERROR LOG
        // ==================================================

        console.error(
            "Get Finance Requests Error:",
            error
        );


        // ==================================================
        // ERROR RESPONSE
        // ==================================================

        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to fetch finance requests"

        });

    }

};


// ======================================================
// GET FINANCE REQUEST BY ID
// Admin API
// ======================================================

// GET
// /api/admin/finance-requests/:financeId

const getFinanceRequestById = async (
    req,
    res
) => {

    try {

        // ==================================================
        // GET FINANCE ID
        // ==================================================

        const {
            financeId
        } = req.params;


        // ==================================================
        // SERVICE CALL
        // ==================================================

        const data =
            await financeService
                .getFinanceRequestById(
                    financeId
                );


        // ==================================================
        // SUCCESS RESPONSE
        // ==================================================

        return res.status(200).json({

            success: true,

            message:
                "Finance Request Fetched Successfully",

            data

        });

    } catch (error) {

        // ==================================================
        // ERROR LOG
        // ==================================================

        console.error(
            "Get Finance Request Error:",
            error
        );


        // ==================================================
        // ERROR RESPONSE
        // ==================================================

        return res.status(404).json({

            success: false,

            message:
                error.message ||
                "Finance request not found"

        });

    }

};


// ======================================================
// UPDATE FINANCE REQUEST STATUS
// Admin API
// ======================================================

// PATCH
// /api/admin/finance-requests/:financeId/status

const updateFinanceRequestStatus = async (
    req,
    res
) => {

    try {

        // ==================================================
        // GET FINANCE ID
        // ==================================================

        const {
            financeId
        } = req.params;


        // ==================================================
        // GET STATUS
        // ==================================================

        const {
            status
        } = req.body;


        // ==================================================
        // VALIDATE STATUS
        // ==================================================

        if (!status) {

            return res.status(400).json({

                success: false,

                message:
                    "Status is required."

            });

        }


        // ==================================================
        // SERVICE CALL
        // ==================================================

        const data =
            await financeService
                .updateFinanceRequestStatus(
                    financeId,
                    status
                );


        // ==================================================
        // SUCCESS RESPONSE
        // ==================================================

        return res.status(200).json({

            success: true,

            message:
                "Finance Request Status Updated Successfully",

            data

        });

    } catch (error) {

        // ==================================================
        // ERROR LOG
        // ==================================================

        console.error(
            "Update Finance Request Status Error:",
            error
        );


        // ==================================================
        // ERROR RESPONSE
        // ==================================================

        return res.status(400).json({

            success: false,

            message:
                error.message ||
                "Unable to update finance request status"

        });

    }

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    createFinanceRequest,

    getAllFinanceRequests,

    getFinanceRequestById,

    updateFinanceRequestStatus

};