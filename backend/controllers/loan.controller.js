const loanService = require(
    "../services/loan.service"
);

// ======================================================
// CREATE LOAN REQUEST
// Customer
// ======================================================

const createLoanRequest = async (
    req,
    res
) => {

    try {

        const result =
            await loanService
                .createLoanRequest(
                    req.body
                );


        return res.status(201).json({

            success: true,

            message:
                "Loan Eligibility Request Submitted Successfully",

            data: result

        });

    } catch (error) {

        console.error(
            "Create Loan Request Error:",
            error
        );


        return res.status(400).json({

            success: false,

            message:
                error.message ||
                "Unable to submit loan request."

        });

    }

};


// ======================================================
// GET ALL LOAN REQUESTS
// Admin
// ======================================================

const getAllLoanRequests = async (
    req,
    res
) => {

    try {

        const result =
            await loanService
                .getAllLoanRequests();


        return res.status(200).json({

            success: true,

            message:
                "Loan Requests Retrieved Successfully",

            data: result

        });

    } catch (error) {

        console.error(
            "Get Loan Requests Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to fetch loan requests."

        });

    }

};


// ======================================================
// GET SINGLE LOAN REQUEST
// Admin
// ======================================================

const getLoanRequestById = async (
    req,
    res
) => {

    try {

        const result =
            await loanService
                .getLoanRequestById(
                    req.params.loanId
                );


        return res.status(200).json({

            success: true,

            message:
                "Loan Request Retrieved Successfully",

            data: result

        });

    } catch (error) {

        console.error(
            "Get Loan Request Error:",
            error
        );


        const statusCode =
            error.message ===
            "Loan request not found."
                ? 404
                : 400;


        return res.status(
            statusCode
        ).json({

            success: false,

            message:
                error.message ||
                "Unable to fetch loan request."

        });

    }

};


// ======================================================
// UPDATE LOAN REQUEST STATUS
// Admin
// ======================================================

const updateLoanRequestStatus = async (
    req,
    res
) => {

    try {

        const result =
            await loanService
                .updateLoanRequestStatus(

                    req.params.loanId,

                    req.body.status

                );


        return res.status(200).json({

            success: true,

            message:
                "Loan Request Status Updated Successfully",

            data: result

        });

    } catch (error) {

        console.error(
            "Update Loan Request Status Error:",
            error
        );


        const statusCode =
            error.message ===
            "Loan request not found."
                ? 404
                : 400;


        return res.status(
            statusCode
        ).json({

            success: false,

            message:
                error.message ||
                "Unable to update loan request status."

        });

    }

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