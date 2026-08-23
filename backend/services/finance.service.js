const financeRepository = require(
    "../repositories/finance.repository"
);


// ======================================================
// CREATE FINANCE REQUEST
// Customer
// ======================================================

const createFinanceRequest = async (
    financeData
) => {

    // ==================================================
    // VALIDATE CAR ID
    // ==================================================

    const carId =
        Number(financeData.carId);


    if (
        !Number.isInteger(carId) ||
        carId <= 0
    ) {

        throw new Error(
            "Invalid car ID."
        );

    }


    // ==================================================
    // VALIDATE NAME
    // ==================================================

    if (
        !financeData.name ||
        typeof financeData.name !== "string" ||
        !financeData.name.trim()
    ) {

        throw new Error(
            "Name is required."
        );

    }


    const name =
        financeData.name.trim();


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
    // VALIDATE MOBILE
    // EXACTLY 10 DIGITS
    // ==================================================

    if (
        !financeData.mobile
    ) {

        throw new Error(
            "Mobile number is required."
        );

    }


    const mobile =
        String(
            financeData.mobile
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
    // VALIDATE EMAIL
    // ==================================================

    if (
        !financeData.email ||
        typeof financeData.email !== "string" ||
        !financeData.email.trim()
    ) {

        throw new Error(
            "Email is required."
        );

    }


    const email =
        financeData.email
            .trim()
            .toLowerCase();


    if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            email
        )
    ) {

        throw new Error(
            "Invalid email address."
        );

    }


    // ==================================================
    // VALIDATE OCCUPATION
    // ==================================================

    if (
        !financeData.occupation ||
        typeof financeData.occupation !== "string" ||
        !financeData.occupation.trim()
    ) {

        throw new Error(
            "Occupation is required."
        );

    }


    const occupation =
        financeData.occupation.trim();


    // ==================================================
    // VALIDATE MONTHLY INCOME
    // ==================================================

    const monthlyIncome =
        Number(
            financeData.monthlyIncome
        );


    if (
        !Number.isFinite(
            monthlyIncome
        ) ||
        monthlyIncome <= 0
    ) {

        throw new Error(
            "Monthly income must be greater than 0."
        );

    }


    // ==================================================
    // VALIDATE DOWN PAYMENT
    // ==================================================

    const downPayment =
        Number(
            financeData.downPayment
        );


    if (
        !Number.isFinite(
            downPayment
        ) ||
        downPayment < 0
    ) {

        throw new Error(
            "Down payment cannot be negative."
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

        occupation,

        monthlyIncome,

        downPayment,

        status:
            "Pending"

    };


    // ==================================================
    // SAVE REQUEST
    // ==================================================

    const result =
        await financeRepository
            .createFinanceRequest(
                data
            );


    // ==================================================
    // RETURN
    // ==================================================

    return {

        financeId:
            result.financeId,

        message:
            "Finance request submitted successfully."

    };

};


// ======================================================
// GET ALL FINANCE REQUESTS
// Admin
// ======================================================

const getAllFinanceRequests =
    async () => {

        const requests =
            await financeRepository
                .getAllFinanceRequests();


        return {

            requests

        };

    };


// ======================================================
// GET FINANCE REQUEST BY ID
// Admin
// ======================================================

const getFinanceRequestById =
    async (
        financeId
    ) => {

        const numericFinanceId =
            Number(financeId);


        if (
            !Number.isInteger(
                numericFinanceId
            ) ||
            numericFinanceId <= 0
        ) {

            throw new Error(
                "Invalid finance request ID."
            );

        }


        const request =
            await financeRepository
                .getFinanceRequestById(
                    numericFinanceId
                );


        if (!request) {

            throw new Error(
                "Finance request not found."
            );

        }


        return {

            financeId:
                request.finance_id,

            carId:
                request.car_id,

            name:
                request.name,

            mobile:
                request.mobile,

            email:
                request.email,

            occupation:
                request.occupation,

            monthlyIncome:
                request.monthly_income,

            downPayment:
                request.down_payment,

            status:
                request.status,

            createdAt:
                request.created_at

        };

    };


// ======================================================
// UPDATE FINANCE REQUEST STATUS
// Admin
// ======================================================

const updateFinanceRequestStatus =
    async (
        financeId,
        status
    ) => {

        const numericFinanceId =
            Number(financeId);


        if (
            !Number.isInteger(
                numericFinanceId
            ) ||
            numericFinanceId <= 0
        ) {

            throw new Error(
                "Invalid finance request ID."
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
            await financeRepository
                .getFinanceRequestById(
                    numericFinanceId
                );


        if (!existingRequest) {

            throw new Error(
                "Finance request not found."
            );

        }


        await financeRepository
            .updateFinanceRequestStatus(
                numericFinanceId,
                status
            );


        return {

            financeId:
                numericFinanceId,

            status,

            message:
                "Finance request status updated successfully."

        };

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