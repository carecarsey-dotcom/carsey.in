const inspectionRequestService =
    require("../services/inspectionRequest.service");


// ======================================================
// GET REQUEST BY ID
// ADMIN + EMPLOYEE
// ======================================================

const getRequestById = async (
    req,
    res
) => {

    try {

        const requestId =
            req.params.requestId;

        const request =
            await inspectionRequestService
                .getRequestById(
                    requestId
                );

        // Employee can only view his own request

        if (
            req.admin.role ===
            "Employee" &&
            Number(request.employee_id) !==
            Number(req.admin.admin_id)
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Access denied. This inspection is not assigned to you."
            });
        }

        return res.status(200).json({

            success: true,

            message:
                "Inspection request fetched successfully",

            data:
                request
        });

    } catch (error) {

        console.error(
            "GET INSPECTION REQUEST ERROR:",
            error
        );

        return res.status(400).json({

            success: false,

            message:
                error.message
        });
    }
};


// ======================================================
// GET EMPLOYEE REQUESTS
// EMPLOYEE ONLY
// ======================================================

const getEmployeeRequests = async (
    req,
    res
) => {

    try {

        const employeeId =
            req.admin.admin_id;

        const status =
            req.query.status ||
            null;

        const requests =
            await inspectionRequestService
                .getEmployeeRequests(
                    employeeId,
                    status
                );

        return res.status(200).json({

            success: true,

            message:
                "Employee inspection requests fetched successfully",

            data:
                requests
        });

    } catch (error) {

        console.error(
            "GET EMPLOYEE REQUESTS ERROR:",
            error
        );

        return res.status(400).json({

            success: false,

            message:
                error.message
        });
    }
};


// ======================================================
// GET ADMIN REQUESTS
// ADMIN ONLY
// ======================================================

const getAdminRequests = async (
    req,
    res
) => {

    try {

        const status =
            req.query.status ||
            null;

        const requests =
            await inspectionRequestService
                .getAdminRequests(
                    status
                );

        return res.status(200).json({

            success: true,

            message:
                "Admin inspection requests fetched successfully",

            data:
                requests
        });

    } catch (error) {

        console.error(
            "GET ADMIN REQUESTS ERROR:",
            error
        );

        return res.status(400).json({

            success: false,

            message:
                error.message
        });
    }
};


// ======================================================
// EMPLOYEE ACCEPT REQUEST
// ======================================================

const acceptRequest = async (
    req,
    res
) => {

    try {

        const requestId =
            req.params.requestId;

        const employeeId =
            req.admin.admin_id;

        const request =
            await inspectionRequestService
                .acceptRequest(
                    requestId,
                    employeeId
                );

        return res.status(200).json({

            success: true,

            message:
                "Inspection request accepted successfully",

            data:
                request
        });

    } catch (error) {

        console.error(
            "ACCEPT INSPECTION REQUEST ERROR:",
            error
        );

        return res.status(400).json({

            success: false,

            message:
                error.message
        });
    }
};


// ======================================================
// EMPLOYEE REJECT REQUEST
// ======================================================

const rejectRequest = async (
    req,
    res
) => {

    try {

        const requestId =
            req.params.requestId;

        const employeeId =
            req.admin.admin_id;

        const employeeRemark =
            req.body?.employeeRemark ||
            req.body?.remark ||
            null;

        const request =
            await inspectionRequestService
                .rejectRequest(
                    requestId,
                    employeeId,
                    employeeRemark
                );

        return res.status(200).json({

            success: true,

            message:
                "Inspection request rejected successfully",

            data:
                request
        });

    } catch (error) {

        console.error(
            "REJECT INSPECTION REQUEST ERROR:",
            error
        );

        return res.status(400).json({

            success: false,

            message:
                error.message
        });
    }
};


// ======================================================
// EMPLOYEE START INSPECTION
// ======================================================

const startInspection = async (
    req,
    res
) => {

    try {

        const requestId =
            req.params.requestId;

        const employeeId =
            req.admin.admin_id;

        const request =
            await inspectionRequestService
                .startInspection(
                    requestId,
                    employeeId
                );

        return res.status(200).json({

            success: true,

            message:
                "Inspection started successfully",

            data:
                request
        });

    } catch (error) {

        console.error(
            "START INSPECTION ERROR:",
            error
        );

        return res.status(400).json({

            success: false,

            message:
                error.message
        });
    }
};


// ======================================================
// EMPLOYEE SUBMIT INSPECTION
// ======================================================
// COMPLETE EMPLOYEE PAYLOAD IS PASSED TO SERVICE.
//
// Employee cannot set price/publish because service
// removes price and forces Draft status.
// ======================================================

const submitInspection = async (
    req,
    res
) => {

    try {

        const requestId =
            req.params.requestId;

        const employeeId =
            req.admin.admin_id;

        let inspectionData = req.body || {};

        if (typeof inspectionData.inspectionData === "string") {
            try {
                inspectionData = JSON.parse(inspectionData.inspectionData);
            } catch (parseError) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid inspectionData JSON."
                });
            }
        }

        const result =
            await inspectionRequestService
                .submitInspection(
                    requestId,
                    employeeId,
                    inspectionData,
                    req.files || []
                );

        return res.status(200).json({

            success: true,

            message:
                result?.message ||
                "Inspection submitted successfully",

            data: {

                request:
                    result?.request ||
                    null,

                vehicleId:
                    result?.vehicleId ||
                    result?.carId ||
                    null,

                carId:
                    result?.carId ||
                    result?.vehicleId ||
                    null,

                reportId:
                    result?.reportId ||
                    null,

                status:
                    result?.status ||
                    "Submitted"
            }
        });

    } catch (error) {

        console.error(
            "SUBMIT INSPECTION ERROR:",
            error
        );

        return res.status(400).json({

            success: false,

            message:
                error.message
        });
    }
};


// ======================================================
// ADMIN APPROVE REQUEST
// ======================================================

const approveRequest = async (
    req,
    res
) => {

    try {

        const requestId =
            req.params.requestId;

        const adminRemark =
            req.body?.adminRemark ||
            req.body?.remark ||
            null;

        const request =
            await inspectionRequestService
                .approveRequest(
                    requestId,
                    adminRemark
                );

        return res.status(200).json({

            success: true,

            message:
                "Inspection request approved successfully",

            data:
                request
        });

    } catch (error) {

        console.error(
            "APPROVE INSPECTION REQUEST ERROR:",
            error
        );

        return res.status(400).json({

            success: false,

            message:
                error.message
        });
    }
};


// ======================================================
// ADMIN REJECT REQUEST
// ======================================================

const adminRejectRequest = async (
    req,
    res
) => {

    try {

        const requestId =
            req.params.requestId;

        const adminRemark =
            req.body?.adminRemark ||
            req.body?.remark ||
            null;

        const request =
            await inspectionRequestService
                .adminRejectRequest(
                    requestId,
                    adminRemark
                );

        return res.status(200).json({

            success: true,

            message:
                "Inspection request rejected by admin",

            data:
                request
        });

    } catch (error) {

        console.error(
            "ADMIN REJECT INSPECTION REQUEST ERROR:",
            error
        );

        return res.status(400).json({

            success: false,

            message:
                error.message
        });
    }
};


// ======================================================
// ADMIN PUBLISH REQUEST
// ======================================================
// Route SAME rahega:
//
// PATCH /inspection-requests/request/:requestId/publish
//
// Body:
//
// {
//     "price": 550000
// }
//
// Price sirf Admin publish stage par save hoga.
// ======================================================

const markRequestPublished = async (
    req,
    res
) => {

    try {

        const requestId =
            req.params.requestId;

        const price =
            req.body?.price;

        const request =
            await inspectionRequestService
                .markRequestPublished(
                    requestId,
                    price
                );

        return res.status(200).json({

            success: true,

            message:
                "Inspection request published successfully",

            data:
                request
        });

    } catch (error) {

        console.error(
            "PUBLISH INSPECTION REQUEST ERROR:",
            error
        );

        return res.status(400).json({

            success: false,

            message:
                error.message
        });
    }
};


// ======================================================
// GET REQUEST REPORT
// ADMIN + EMPLOYEE
// ======================================================

const getRequestReport = async (
    req,
    res
) => {

    try {

        const requestId =
            req.params.requestId;

        const request =
            await inspectionRequestService
                .getRequestById(
                    requestId
                );

        // Employee can only access own request

        if (
            req.admin.role ===
            "Employee" &&
            Number(request.employee_id) !==
            Number(req.admin.admin_id)
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Access denied. This inspection is not assigned to you."
            });
        }

        const report =
            await inspectionRequestService
                .getRequestReport(
                    requestId
                );

        return res.status(200).json({

            success: true,

            message:
                "Inspection report fetched successfully",

            data:
                report
        });

    } catch (error) {

        console.error(
            "GET INSPECTION REPORT ERROR:",
            error
        );

        return res.status(400).json({

            success: false,

            message:
                error.message
        });
    }
};


// ======================================================
// GET REQUEST BY REPORT ID
// ADMIN + EMPLOYEE
// ======================================================

const getRequestByReportId = async (
    req,
    res
) => {

    try {

        const reportId =
            req.params.reportId;

        const request =
            await inspectionRequestService
                .getRequestByReportId(
                    reportId
                );

        if (!request) {

            return res.status(404).json({

                success: false,

                message:
                    "Inspection request for this report not found"
            });
        }

        // Employee can only access own request

        if (
            req.admin.role ===
            "Employee" &&
            Number(request.employee_id) !==
            Number(req.admin.admin_id)
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Access denied. This inspection is not assigned to you."
            });
        }

        return res.status(200).json({

            success: true,

            message:
                "Inspection request fetched successfully",

            data:
                request
        });

    } catch (error) {

        console.error(
            "GET REQUEST BY REPORT ID ERROR:",
            error
        );

        return res.status(400).json({

            success: false,

            message:
                error.message
        });
    }
};


// ======================================================
// EXPORTS
// ======================================================

module.exports = {

    getRequestById,
    getEmployeeRequests,
    getAdminRequests,

    acceptRequest,
    rejectRequest,
    startInspection,
    submitInspection,

    approveRequest,
    adminRejectRequest,
    markRequestPublished,

    getRequestReport,
    getRequestByReportId
};