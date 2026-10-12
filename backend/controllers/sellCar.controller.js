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
            ownerName: ownerName || null,
            ownerClassification: ownerClassification || null,
            frontImage: getImagePath("frontImage"),
            backImage: getImagePath("backImage"),
            leftImage: getImagePath("leftImage"),
            rightImage: getImagePath("rightImage"),
            // Optional legacy image fields retained for compatibility.
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
// GET ALL SELL CAR REQUESTS (Admin)
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
// GET SELL CAR REQUEST BY ID (Admin)
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
// ASSIGN REQUEST TO EMPLOYEE (Admin)
// PATCH /api/admin/sell-car-requests/:sellId/assign
// Route must use verifyToken + requireAdmin.
// ======================================================

const assignSellCarRequest = async (req, res) => {
    try {
        const { sellId } = req.params;
        const { employeeId } = req.body;
        const data = await sellCarService.assignSellCarRequest(sellId, employeeId);

        return res.status(200).json({
            success: true,
            message: "Sell Car Request Assigned Successfully",
            data
        });
    } catch (error) {
        console.error("Assign Sell Car Request Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Unable to assign sell car request"
        });
    }
};

// ======================================================
// GET REQUESTS ASSIGNED TO LOGGED-IN EMPLOYEE
// GET /api/employee/sell-car-requests
// Route must use verifyToken + requireEmployee.
// ======================================================

const getAssignedSellCarRequests = async (req, res) => {
    try {
        const employeeId = Number(
            req.admin?.admin_id ?? req.admin?.adminId ?? req.admin?.id
        );

        if (!Number.isInteger(employeeId) || employeeId <= 0) {
            return res.status(401).json({
                success: false,
                message: "Employee identity is missing from the token."
            });
        }

        const data = await sellCarService.getAssignedSellCarRequests(employeeId);
        return res.status(200).json({
            success: true,
            message: "Assigned Sell Car Requests Fetched Successfully",
            data
        });
    } catch (error) {
        console.error("Get Assigned Sell Car Requests Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Unable to fetch assigned requests"
        });
    }
};

// ======================================================
// UPDATE ASSIGNED REQUEST (Employee)
// PATCH /api/employee/sell-car-requests/:sellId
// Route must use verifyToken + requireEmployee + upload middleware.
// ======================================================

const updateAssignedSellCarRequest = async (req, res) => {
    try {
        const { sellId } = req.params;
        const employeeId = Number(
            req.admin?.admin_id ?? req.admin?.adminId ?? req.admin?.id
        );

        if (!Number.isInteger(employeeId) || employeeId <= 0) {
            return res.status(401).json({
                success: false,
                message: "Employee identity is missing from the token."
            });
        }

        const files = req.files || {};
        const getImagePath = (fieldName) =>
            files[fieldName] && files[fieldName][0]
                ? `/uploads/sell-cars/${files[fieldName][0].filename}`
                : undefined;

        const requestData = {
            ...req.body,
            frontImage: getImagePath("frontImage"),
            backImage: getImagePath("backImage"),
            leftImage: getImagePath("leftImage"),
            rightImage: getImagePath("rightImage")
        };

        const data = await sellCarService.updateAssignedSellCarRequest(
            sellId,
            employeeId,
            requestData
        );

        return res.status(200).json({
            success: true,
            message: "Assigned Sell Car Request Updated Successfully",
            data
        });
    } catch (error) {
        console.error("Update Assigned Sell Car Request Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Unable to update assigned request"
        });
    }
};

// ======================================================
// SUBMIT REQUEST FOR ADMIN APPROVAL (Employee)
// POST /api/employee/sell-car-requests/:sellId/submit
// Route must use verifyToken + requireEmployee.
// ======================================================

const submitSellCarRequestForApproval = async (req, res) => {
    try {
        const { sellId } = req.params;
        const employeeId = Number(
            req.admin?.admin_id ?? req.admin?.adminId ?? req.admin?.id
        );

        if (!Number.isInteger(employeeId) || employeeId <= 0) {
            return res.status(401).json({
                success: false,
                message: "Employee identity is missing from the token."
            });
        }

        const data = await sellCarService.submitSellCarRequestForApproval(
            sellId,
            employeeId
        );

        return res.status(200).json({
            success: true,
            message: "Sell Car Request Submitted for Admin Approval",
            data
        });
    } catch (error) {
        console.error("Submit Sell Car Request for Approval Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Unable to submit request for approval"
        });
    }
};

// ======================================================
// SEND REQUEST BACK FOR CORRECTIONS (Admin)
// PATCH /api/admin/sell-car-requests/:sellId/correction
// Route must use verifyToken + requireAdmin.
// ======================================================

const sendSellCarRequestForCorrection = async (req, res) => {
    try {
        const { sellId } = req.params;
        const { correctionNote } = req.body;
        const data = await sellCarService.sendSellCarRequestForCorrection(
            sellId,
            correctionNote
        );

        return res.status(200).json({
            success: true,
            message: "Sell Car Request Sent Back for Correction",
            data
        });
    } catch (error) {
        console.error("Send Sell Car Request for Correction Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Unable to send request for correction"
        });
    }
};

// ======================================================
// UPDATE SELL CAR REQUEST STATUS (Existing Admin API)
// PATCH /api/admin/sell-car-requests/:sellId/status
// Route must use verifyToken + requireAdmin.
// ======================================================

const updateSellCarRequestStatus = async (req, res) => {
    try {
        const { sellId } = req.params;
        const { status } = req.body;
        const data = await sellCarService.updateSellCarRequestStatus(sellId, status);

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
    assignSellCarRequest,
    getAssignedSellCarRequests,
    updateAssignedSellCarRequest,
    submitSellCarRequestForApproval,
    sendSellCarRequestForCorrection,
    updateSellCarRequestStatus
};
