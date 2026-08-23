const testDriveRepository = require(
    "../repositories/testDrive.repository"
);


// ======================================================
// CREATE TEST DRIVE REQUEST
// ======================================================

const createTestDriveRequest = async (
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
            "Invalid car ID."
        );

    }


    // ==================================================
    // CHECK CAR
    // ==================================================

    const carExists =
        await testDriveRepository
            .checkCarExists(carId);


    if (!carExists) {

        throw new Error(
            "Vehicle not found."
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
        !email ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            email
        )
    ) {

        throw new Error(
            "Please provide a valid email address."
        );

    }


    // ==================================================
    // CITY
    // ==================================================

    const city =
        requestData.city?.trim();


    if (!city) {

        throw new Error(
            "City is required."
        );

    }


    if (
        !/^[A-Za-z ]+$/.test(city)
    ) {

        throw new Error(
            "City must contain only letters."
        );

    }


    // ==================================================
    // DATE
    // ==================================================

    const preferredDate =
        requestData.preferredDate;


    if (!preferredDate) {

        throw new Error(
            "Preferred date is required."
        );

    }


    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(
            preferredDate
        )
    ) {

        throw new Error(
            "Preferred date must be in YYYY-MM-DD format."
        );

    }


    const selectedDate =
        new Date(
            `${preferredDate}T00:00:00`
        );


    if (
        Number.isNaN(
            selectedDate.getTime()
        )
    ) {

        throw new Error(
            "Invalid preferred date."
        );

    }


    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    if (
        selectedDate < today
    ) {

        throw new Error(
            "Preferred date cannot be in the past."
        );

    }


    // ==================================================
    // TIME
    // ==================================================

    const preferredTime =
        requestData.preferredTime?.trim();


    if (!preferredTime) {

        throw new Error(
            "Preferred time is required."
        );

    }


    // ==================================================
    // PREPARE DATA
    // ==================================================

    const data = {

        carId,

        name,

        mobile,

        email,

        city,

        preferredDate,

        preferredTime

    };


    // ==================================================
    // SAVE
    // ==================================================

    const result =
        await testDriveRepository
            .createTestDriveRequest(
                data
            );


    // ==================================================
    // RETURN
    // ==================================================

    return {

        requestId:
            result.requestId,

        message:
            "Test drive request submitted successfully."

    };

};


// ======================================================
// GET ALL
// ======================================================

const getAllTestDriveRequests =
    async () => {

        const requests =
            await testDriveRepository
                .getAllTestDriveRequests();


        return {

            requests

        };

    };


// ======================================================
// GET BY ID
// ======================================================

const getTestDriveRequestById =
    async (
        requestId
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
                "Invalid test drive request ID."
            );

        }


        const request =
            await testDriveRepository
                .getTestDriveRequestById(
                    numericRequestId
                );


        if (!request) {

            throw new Error(
                "Test drive request not found."
            );

        }


        return {

            request

        };

    };


// ======================================================
// UPDATE STATUS
// ======================================================

const updateTestDriveStatus =
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
                "Invalid test drive request ID."
            );

        }


        if (
            status !== "Pending" &&
            status !== "Approved" &&
            status !== "Rejected"
        ) {

            throw new Error(
                "Status must be Pending, Approved or Rejected."
            );

        }


        const existingRequest =
            await testDriveRepository
                .getTestDriveRequestById(
                    numericRequestId
                );


        if (!existingRequest) {

            throw new Error(
                "Test drive request not found."
            );

        }


        await testDriveRepository
            .updateTestDriveStatus(
                numericRequestId,
                status
            );


        return {

            requestId:
                numericRequestId,

            status,

            message:
                "Test drive request status updated successfully."

        };

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