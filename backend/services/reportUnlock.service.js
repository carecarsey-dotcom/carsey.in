const reportUnlockRepository = require(
    "../repositories/reportUnlock.repository"
);


// ======================================================
// CREATE REPORT UNLOCK REQUEST
// ======================================================

const createReportUnlockRequest = async (
    requestData
) => {

    // ==================================================
    // CAR ID
    // ==================================================

    const carId =
        Number(requestData.carId);


    if (
        !Number.isInteger(carId) ||
        carId <= 0
    ) {

        throw new Error(
            "Valid vehicle ID is required."
        );

    }


    // ==================================================
    // NAME
    // ==================================================

    const name =
        requestData.name?.trim();


    if (!name) {

        throw new Error(
            "Name is required."
        );

    }


    if (
        !/^[A-Za-z ]+$/.test(name)
    ) {

        throw new Error(
            "Name must contain only letters."
        );

    }


    if (
        name.length < 2 ||
        name.length > 100
    ) {

        throw new Error(
            "Name must be between 2 and 100 characters."
        );

    }


    // ==================================================
    // MOBILE
    // EXACTLY 10 DIGITS
    // ==================================================

    const mobile =
        String(
            requestData.mobile || ""
        ).trim();


    if (
        !/^[0-9]{10}$/.test(
            mobile
        )
    ) {

        throw new Error(
            "Mobile number must contain exactly 10 digits."
        );

    }


    // ==================================================
    // EMAIL
    // ==================================================

    const email =
        requestData.email
            ?.trim()
            .toLowerCase();


    if (
        !email
    ) {

        throw new Error(
            "Email is required."
        );

    }


    if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            email
        )
    ) {

        throw new Error(
            "Please enter a valid email address."
        );

    }


    // ==================================================
    // PREPARE DATA
    // ==================================================

    const data = {

        carId,

        name,

        mobile,

        email

    };


    // ==================================================
    // SAVE DATABASE
    // ==================================================

    const result =
        await reportUnlockRepository
            .createReportUnlockRequest(
                data
            );


    // ==================================================
    // RETURN
    // ==================================================

    return {

        requestId:
            result.requestId,

        message:
            "Inspection report unlock request submitted successfully."

    };

};


// ======================================================
// GET REQUESTS
// ======================================================

const getReportUnlockRequests =
    async () => {

        const requests =
            await reportUnlockRepository
                .getReportUnlockRequests();


        return {

            requests

        };

    };


// ======================================================
// UPDATE STATUS
// ======================================================

const updateReportUnlockRequestStatus =
    async (
        requestId,
        status
    ) => {

        const numericRequestId =
            Number(requestId);


        if (
            !Number.isInteger(
                numericRequestId
            ) ||
            numericRequestId <= 0
        ) {

            throw new Error(
                "Invalid report unlock request ID."
            );

        }


        const allowedStatuses = [

            "Approved",

            "Rejected"

        ];


        if (
            !allowedStatuses.includes(
                status
            )
        ) {

            throw new Error(
                "Status must be Approved or Rejected."
            );

        }


        const result =
            await reportUnlockRepository
                .updateReportUnlockRequestStatus(
                    numericRequestId,
                    status
                );


        return {

            requestId:
                result.requestId,

            status:
                result.status,

            message:
                `Report unlock request ${status.toLowerCase()} successfully.`

        };

    };


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    createReportUnlockRequest,

    getReportUnlockRequests,

    updateReportUnlockRequestStatus

};