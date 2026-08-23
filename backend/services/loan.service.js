const loanRepository = require(
    "../repositories/loan.repository"
);

// ======================================================
// CREATE LOAN REQUEST
// Customer
// ======================================================

const createLoanRequest = async (
    loanData
) => {

    // ==================================================
    // NAME
    // ==================================================

    if (
        !loanData.name ||
        !loanData.name.trim()
    ) {

        throw new Error(
            "Name is required."
        );

    }


    const name =
        loanData.name.trim();


    if (name.length < 2) {

        throw new Error(
            "Name must contain at least 2 characters."
        );

    }


    // ==================================================
    // MOBILE
    // ==================================================

    if (
        !loanData.mobile ||
        !String(loanData.mobile).trim()
    ) {

        throw new Error(
            "Mobile number is required."
        );

    }


    const mobile =
        String(
            loanData.mobile
        ).trim();


    if (
        !/^[0-9]{10,15}$/.test(
            mobile
        )
    ) {

        throw new Error(
            "Mobile number must contain 10 to 15 digits."
        );

    }


    // ==================================================
    // EMAIL
    // ==================================================

    if (
        !loanData.email ||
        !loanData.email.trim()
    ) {

        throw new Error(
            "Email is required."
        );

    }


    const email =
        loanData.email
            .trim()
            .toLowerCase();


    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
        !emailPattern.test(email)
    ) {

        throw new Error(
            "Invalid email address."
        );

    }


    // ==================================================
    // EMPLOYMENT TYPE
    // ==================================================

    if (
        !loanData.employmentType ||
        !loanData.employmentType.trim()
    ) {

        throw new Error(
            "Employment type is required."
        );

    }


    const employmentType =
        loanData.employmentType.trim();


    // ==================================================
    // MONTHLY INCOME
    // ==================================================

    const monthlyIncome =
        Number(
            loanData.monthlyIncome
        );


    if (
        !Number.isFinite(monthlyIncome) ||
        monthlyIncome <= 0
    ) {

        throw new Error(
            "Monthly income must be greater than 0."
        );

    }


    // ==================================================
    // VEHICLE REQUIRED
    // ==================================================

    if (
        !loanData.vehicleRequired ||
        !loanData.vehicleRequired.trim()
    ) {

        throw new Error(
            "Required vehicle is required."
        );

    }


    const vehicleRequired =
        loanData.vehicleRequired.trim();


    // ==================================================
    // BUDGET
    // ==================================================

    const budget =
        Number(
            loanData.budget
        );


    if (
        !Number.isFinite(budget) ||
        budget <= 0
    ) {

        throw new Error(
            "Budget must be greater than 0."
        );

    }


    // ==================================================
    // CAR MODEL
    // Optional
    // ==================================================

    let carModel = null;


    if (
        loanData.carModel &&
        loanData.carModel.trim()
    ) {

        carModel =
            loanData.carModel.trim();

    }


    // ==================================================
    // PREPARE DATA
    // ==================================================

    const data = {

        name,

        mobile,

        email,

        employmentType,

        monthlyIncome,

        vehicleRequired,

        budget,

        carModel,

        status: "Pending"

    };


    // ==================================================
    // SAVE DATABASE
    // ==================================================

    const result =
        await loanRepository
            .createLoanRequest(
                data
            );


    // ==================================================
    // RESPONSE
    // ==================================================

    return {

        loanId:
            result.loanId,

        message:
            "Loan eligibility request submitted successfully."

    };

};


// ======================================================
// GET ALL LOAN REQUESTS
// Admin
// ======================================================

const getAllLoanRequests = async () => {

    const loans =
        await loanRepository
            .getAllLoanRequests();


    return {

        loans

    };

};


// ======================================================
// GET LOAN REQUEST BY ID
// Admin
// ======================================================

const getLoanRequestById = async (
    loanId
) => {

    const numericLoanId =
        Number(loanId);


    if (
        !Number.isInteger(
            numericLoanId
        ) ||
        numericLoanId <= 0
    ) {

        throw new Error(
            "Invalid loan request ID."
        );

    }


    const loan =
        await loanRepository
            .getLoanRequestById(
                numericLoanId
            );


    if (!loan) {

        throw new Error(
            "Loan request not found."
        );

    }


    return {

        loanId:
            loan.loan_id,

        name:
            loan.name,

        mobile:
            loan.mobile,

        email:
            loan.email,

        employmentType:
            loan.employment_type,

        monthlyIncome:
            loan.monthly_income,

        vehicleRequired:
            loan.vehicle_required,

        budget:
            loan.budget,

        carModel:
            loan.car_model,

        status:
            loan.status,

        createdAt:
            loan.created_at

    };

};


// ======================================================
// UPDATE LOAN REQUEST STATUS
// Admin
// ======================================================

const updateLoanRequestStatus = async (
    loanId,
    status
) => {

    // ==================================================
    // VALIDATE ID
    // ==================================================

    const numericLoanId =
        Number(loanId);


    if (
        !Number.isInteger(
            numericLoanId
        ) ||
        numericLoanId <= 0
    ) {

        throw new Error(
            "Invalid loan request ID."
        );

    }


    // ==================================================
    // VALIDATE STATUS
    // ==================================================

    if (
        status !== "Approved" &&
        status !== "Rejected"
    ) {

        throw new Error(
            "Status must be Approved or Rejected."
        );

    }


    // ==================================================
    // CHECK REQUEST EXISTS
    // ==================================================

    const existingLoan =
        await loanRepository
            .getLoanRequestById(
                numericLoanId
            );


    if (!existingLoan) {

        throw new Error(
            "Loan request not found."
        );

    }


    // ==================================================
    // UPDATE
    // ==================================================

    await loanRepository
        .updateLoanRequestStatus(
            numericLoanId,
            status
        );


    // ==================================================
    // RESPONSE
    // ==================================================

    return {

        loanId:
            numericLoanId,

        status,

        message:
            "Loan request status updated successfully."

    };

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    createLoanRequest,

    getAllLoanRequests,

    getLoanRequestById,

    updateLoanRequestStatus

};