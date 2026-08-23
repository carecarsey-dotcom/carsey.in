const exchangeRepository = require(
    "../repositories/exchange.repository"
);


// ======================================================
// CREATE EXCHANGE REQUEST
// Customer
// ======================================================

const createExchangeRequest = async (
    exchangeData
) => {

    // ==================================================
    // NAME VALIDATION
    // ==================================================

    if (
        !exchangeData.name ||
        !exchangeData.name.trim()
    ) {

        throw new Error(
            "Name is required."
        );

    }


    // ==================================================
    // MOBILE VALIDATION
    // ==================================================

    if (
        !exchangeData.mobile ||
        !/^[0-9]{10,15}$/.test(
            String(exchangeData.mobile)
        )
    ) {

        throw new Error(
            "Valid mobile number is required."
        );

    }


    // ==================================================
    // EMAIL VALIDATION
    // ==================================================

    if (
        !exchangeData.email ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            exchangeData.email
        )
    ) {

        throw new Error(
            "Valid email is required."
        );

    }


    // ==================================================
    // CURRENT BRAND
    // ==================================================

    if (
        !exchangeData.currentBrand ||
        !exchangeData.currentBrand.trim()
    ) {

        throw new Error(
            "Current vehicle brand is required."
        );

    }


    // ==================================================
    // CURRENT MODEL
    // ==================================================

    if (
        !exchangeData.currentModel ||
        !exchangeData.currentModel.trim()
    ) {

        throw new Error(
            "Current vehicle model is required."
        );

    }


    // ==================================================
    // CURRENT YEAR
    // ==================================================

    const currentYear = Number(
        exchangeData.currentYear
    );

    if (
        !Number.isInteger(currentYear) ||
        currentYear < 1900 ||
        currentYear > new Date().getFullYear()
    ) {

        throw new Error(
            "Valid current vehicle year is required."
        );

    }


    // ==================================================
    // CURRENT VEHICLE PRICE
    // ==================================================

    const currentVehiclePrice = Number(
        exchangeData.currentVehiclePrice
    );

    if (
        !Number.isFinite(currentVehiclePrice) ||
        currentVehiclePrice < 0
    ) {

        throw new Error(
            "Valid current vehicle price is required."
        );

    }


    // ==================================================
    // PREFERRED BRAND
    // ==================================================

    if (
        !exchangeData.preferredBrand ||
        !exchangeData.preferredBrand.trim()
    ) {

        throw new Error(
            "Preferred vehicle brand is required."
        );

    }


    // ==================================================
    // PREFERRED MODEL
    // ==================================================

    if (
        !exchangeData.preferredModel ||
        !exchangeData.preferredModel.trim()
    ) {

        throw new Error(
            "Preferred vehicle model is required."
        );

    }


    // ==================================================
    // PREFERRED VARIANT
    // ==================================================

    if (
        !exchangeData.preferredVariant ||
        !exchangeData.preferredVariant.trim()
    ) {

        throw new Error(
            "Preferred vehicle variant is required."
        );

    }


    // ==================================================
    // BUDGET
    // ==================================================

    const budget = Number(
        exchangeData.budget
    );

    if (
        !Number.isFinite(budget) ||
        budget <= 0
    ) {

        throw new Error(
            "Valid budget is required."
        );

    }


    // ==================================================
    // PREPARE DATA
    // ==================================================

    const data = {

        name:
            exchangeData.name.trim(),

        mobile:
            String(exchangeData.mobile).trim(),

        email:
            exchangeData.email.trim().toLowerCase(),

        currentBrand:
            exchangeData.currentBrand.trim(),

        currentModel:
            exchangeData.currentModel.trim(),

        currentYear,

        currentVehiclePrice,

        preferredBrand:
            exchangeData.preferredBrand.trim(),

        preferredModel:
            exchangeData.preferredModel.trim(),

        preferredVariant:
            exchangeData.preferredVariant.trim(),

        budget,

        vehicleImage:
            exchangeData.vehicleImage || null,

        status:
            "Pending"

    };


    // ==================================================
    // SAVE DATABASE
    // ==================================================

    const result =
        await exchangeRepository
            .createExchangeRequest(
                data
            );


    // ==================================================
    // RETURN
    // ==================================================

    return {

        exchangeId:
            result.exchangeId,

        message:
            "Exchange request submitted successfully."

    };

};


// ======================================================
// GET ALL EXCHANGE REQUESTS
// Admin
// ======================================================

const getAllExchangeRequests = async () => {

    const requests =
        await exchangeRepository
            .getAllExchangeRequests();


    return {

        requests

    };

};


// ======================================================
// GET EXCHANGE REQUEST BY ID
// Admin
// ======================================================

const getExchangeRequestById = async (
    exchangeId
) => {

    // ==================================================
    // VALIDATE ID
    // ==================================================

    const numericExchangeId =
        Number(exchangeId);


    if (
        !Number.isInteger(
            numericExchangeId
        ) ||
        numericExchangeId <= 0
    ) {

        throw new Error(
            "Invalid exchange request ID."
        );

    }


    // ==================================================
    // GET REQUEST
    // ==================================================

    const request =
        await exchangeRepository
            .getExchangeRequestById(
                numericExchangeId
            );


    // ==================================================
    // NOT FOUND
    // ==================================================

    if (!request) {

        throw new Error(
            "Exchange request not found."
        );

    }


    // ==================================================
    // RETURN
    // ==================================================

    return {

        exchangeId:
            request.exchange_id,

        name:
            request.name,

        mobile:
            request.mobile,

        email:
            request.email,

        currentBrand:
            request.current_brand,

        currentModel:
            request.current_model,

        currentYear:
            request.current_year,

        currentVehiclePrice:
            request.current_vehicle_price,

        preferredBrand:
            request.preferred_brand,

        preferredModel:
            request.preferred_model,

        preferredVariant:
            request.preferred_variant,

        budget:
            request.budget,

        vehicleImage:
            request.vehicle_image,

        status:
            request.status,

        createdAt:
            request.created_at

    };

};


// ======================================================
// UPDATE EXCHANGE REQUEST STATUS
// Admin
// ======================================================

const updateExchangeRequestStatus = async (
    exchangeId,
    status
) => {

    // ==================================================
    // VALIDATE ID
    // ==================================================

    const numericExchangeId =
        Number(exchangeId);


    if (
        !Number.isInteger(
            numericExchangeId
        ) ||
        numericExchangeId <= 0
    ) {

        throw new Error(
            "Invalid exchange request ID."
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

    const existingRequest =
        await exchangeRepository
            .getExchangeRequestById(
                numericExchangeId
            );


    if (!existingRequest) {

        throw new Error(
            "Exchange request not found."
        );

    }


    // ==================================================
    // UPDATE STATUS
    // ==================================================

    await exchangeRepository
        .updateExchangeRequestStatus(
            numericExchangeId,
            status
        );


    // ==================================================
    // RETURN
    // ==================================================

    return {

        exchangeId:
            numericExchangeId,

        status,

        message:
            "Exchange request status updated successfully."

    };

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    createExchangeRequest,

    getAllExchangeRequests,

    getExchangeRequestById,

    updateExchangeRequestStatus

};