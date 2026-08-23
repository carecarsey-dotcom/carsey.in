const testDriveService = require(
    "../services/testDrive.service"
);


// ======================================================
// CREATE TEST DRIVE REQUEST
// Customer
// ======================================================

// POST
// /api/vehicles/:carId/test-drive

const createTestDriveRequest = async (
    req,
    res
) => {

    try {

        // ------------------------------------------
        // Get Car ID
        // ------------------------------------------

        const {
            carId
        } = req.params;


        // ------------------------------------------
        // Customer Data
        // ------------------------------------------

        const {

            name,

            mobile,

            email,

            city,

            preferredDate,

            preferredTime

        } = req.body;


        // ------------------------------------------
        // Prepare Data
        // ------------------------------------------

        const requestData = {

            carId,

            name,

            mobile,

            email,

            city,

            preferredDate,

            preferredTime

        };


        // ------------------------------------------
        // Service
        // ------------------------------------------

        const data =
            await testDriveService
                .createTestDriveRequest(
                    requestData
                );


        // ------------------------------------------
        // Response
        // ------------------------------------------

        return res.status(201).json({

            success: true,

            message:
                "Test Drive Request Submitted Successfully",

            data

        });

    } catch (error) {

        console.error(
            "Create Test Drive Request Error:",
            error
        );


        return res.status(400).json({

            success: false,

            message:
                error.message ||
                "Unable to submit test drive request"

        });

    }

};


// ======================================================
// GET ALL TEST DRIVE REQUESTS
// Admin
// ======================================================

// GET
// /api/admin/test-drive-requests

const getAllTestDriveRequests = async (
    req,
    res
) => {

    try {

        const data =
            await testDriveService
                .getAllTestDriveRequests();


        return res.status(200).json({

            success: true,

            message:
                "Test Drive Requests Fetched Successfully",

            data

        });

    } catch (error) {

        console.error(
            "Get Test Drive Requests Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to fetch test drive requests"

        });

    }

};


// ======================================================
// GET TEST DRIVE REQUEST BY ID
// Admin
// ======================================================

// GET
// /api/admin/test-drive-requests/:requestId

const getTestDriveRequestById = async (
    req,
    res
) => {

    try {

        const {
            requestId
        } = req.params;


        const data =
            await testDriveService
                .getTestDriveRequestById(
                    requestId
                );


        return res.status(200).json({

            success: true,

            message:
                "Test Drive Request Fetched Successfully",

            data

        });

    } catch (error) {

        console.error(
            "Get Test Drive Request Error:",
            error
        );


        return res.status(404).json({

            success: false,

            message:
                error.message ||
                "Test drive request not found"

        });

    }

};


// ======================================================
// UPDATE TEST DRIVE STATUS
// Admin
// ======================================================

// PATCH
// /api/admin/test-drive-requests/:requestId/status

const updateTestDriveStatus = async (
    req,
    res
) => {

    try {

        const {
            requestId
        } = req.params;


        const {
            status
        } = req.body;


        if (!status) {

            return res.status(400).json({

                success: false,

                message:
                    "Status is required."

            });

        }


        const data =
            await testDriveService
                .updateTestDriveStatus(
                    requestId,
                    status
                );


        return res.status(200).json({

            success: true,

            message:
                "Test Drive Request Status Updated Successfully",

            data

        });

    } catch (error) {

        console.error(
            "Update Test Drive Status Error:",
            error
        );


        return res.status(400).json({

            success: false,

            message:
                error.message ||
                "Unable to update test drive request"

        });

    }

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    createTestDriveRequest,

    getAllTestDriveRequests,

    getTestDriveRequestById,

    updateTestDriveStatus

};