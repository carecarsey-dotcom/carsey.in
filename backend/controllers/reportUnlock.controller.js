const reportUnlockService = require(
    "../services/reportUnlock.service"
);


// ======================================================
// CREATE REPORT UNLOCK REQUEST
// Customer Public API
// ======================================================

const createReportUnlockRequest = async (
    req,
    res
) => {

    try {

        // ------------------------------------------
        // Get Vehicle ID From URL
        // ------------------------------------------

        const { carId } = req.params;


        // ------------------------------------------
        // Get Customer Details
        // ------------------------------------------

        const {
            name,
            mobile,
            email
        } = req.body;


        // ------------------------------------------
        // Prepare Request Data
        // ------------------------------------------

        const requestData = {

            carId: Number(carId),

            name,

            mobile,

            email

        };


        // ------------------------------------------
        // Service Call
        // ------------------------------------------

        const data =
            await reportUnlockService.createReportUnlockRequest(
                requestData
            );


        // ------------------------------------------
        // Success Response
        // ------------------------------------------

        return res.status(201).json({

            success: true,

            message:
                "Inspection Report Unlock Request Submitted Successfully",

            data

        });

    } catch (error) {

        console.error(
            "Report Unlock Request Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Internal Server Error"

        });

    }

};


// ======================================================
// GET REPORT UNLOCK REQUESTS
// Admin Only
// ======================================================

const getReportUnlockRequests = async (
    req,
    res
) => {

    try {

        // ------------------------------------------
        // Service Call
        // ------------------------------------------

        const data =
            await reportUnlockService.getReportUnlockRequests();


        // ------------------------------------------
        // Success Response
        // ------------------------------------------

        return res.status(200).json({

            success: true,

            message:
                "Report Unlock Requests Fetched Successfully",

            data

        });

    } catch (error) {

        console.error(
            "Get Report Unlock Requests Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Internal Server Error"

        });

    }

};


// ======================================================
// UPDATE REPORT UNLOCK REQUEST STATUS
// Admin Only
// ======================================================

const updateReportUnlockRequestStatus = async (
    req,
    res
) => {

    try {

        // ------------------------------------------
        // Get Request ID
        // ------------------------------------------

        const { requestId } = req.params;


        // ------------------------------------------
        // Get Status
        // ------------------------------------------

        const { status } = req.body;


        // ------------------------------------------
        // Service Call
        // ------------------------------------------

        const data =
            await reportUnlockService
                .updateReportUnlockRequestStatus(
                    requestId,
                    status
                );


        // ------------------------------------------
        // Success Response
        // ------------------------------------------

        return res.status(200).json({

            success: true,

            message:
                "Report Unlock Request Status Updated Successfully",

            data

        });

    } catch (error) {

        console.error(
            "Update Report Unlock Request Status Error:",
            error
        );

        return res.status(400).json({

            success: false,

            message:
                error.message ||
                "Unable to update request status"

        });

    }

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    createReportUnlockRequest,

    getReportUnlockRequests,

    updateReportUnlockRequestStatus

};