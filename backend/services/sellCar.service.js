const sellCarRepository = require(
    "../repositories/sellCar.repository"
);


// ======================================================
// CREATE SELL CAR REQUEST
// Customer
// ======================================================

const createSellCarRequest = async (requestData) => {

    // ==================================================
    // SELLER NAME
    // ==================================================

    if (
        !requestData.sellerName ||
        !requestData.sellerName.trim()
    ) {

        throw new Error(
            "Seller name is required."
        );

    }


    // ==================================================
    // OWNER NAME — NEW FIELD
    // ==================================================

    if (
        typeof requestData.ownerName !== "string" ||
        !requestData.ownerName.trim()
    ) {

        throw new Error(
            "Owner name is required."
        );

    }


    const ownerName =
        requestData.ownerName.trim();


    // ==================================================
    // MOBILE
    // ==================================================

    if (
        !requestData.mobile ||
        !requestData.mobile.trim()
    ) {

        throw new Error(
            "Mobile number is required."
        );

    }


    const mobile =
        requestData.mobile.trim();


    if (
        !/^[0-9]{10,15}$/.test(mobile)
    ) {

        throw new Error(
            "Invalid mobile number."
        );

    }


    // ==================================================
    // EMAIL
    // ==================================================

    if (
        !requestData.email ||
        !requestData.email.trim()
    ) {

        throw new Error(
            "Email is required."
        );

    }


    const email =
        requestData.email.trim().toLowerCase();


    if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {

        throw new Error(
            "Invalid email address."
        );

    }


    // ==================================================
    // CITY
    // ==================================================

    if (
        !requestData.city ||
        !requestData.city.trim()
    ) {

        throw new Error(
            "City is required."
        );

    }


    const city =
        requestData.city.trim();


    // ==================================================
    // BRAND
    // ==================================================

    if (
        !requestData.brand ||
        !requestData.brand.trim()
    ) {

        throw new Error(
            "Vehicle brand is required."
        );

    }


    // ==================================================
    // MODEL
    // ==================================================

    if (
        !requestData.model ||
        !requestData.model.trim()
    ) {

        throw new Error(
            "Vehicle model is required."
        );

    }


    // ==================================================
    // VARIANT
    // ==================================================

    if (
        !requestData.variant ||
        !requestData.variant.trim()
    ) {

        throw new Error(
            "Vehicle variant is required."
        );

    }


    // ==================================================
    // VEHICLE NUMBER
    // ==================================================

    if (
        !requestData.vehicleNumber ||
        !requestData.vehicleNumber.trim()
    ) {

        throw new Error(
            "Vehicle number is required."
        );

    }


    const vehicleNumber =
        requestData.vehicleNumber
            .trim()
            .toUpperCase()
            .replace(/\s+/g, "");


    // ==================================================
    // VALIDATE VEHICLE NUMBER
    // ==================================================

    if (
        !/^[A-Z0-9-]{4,20}$/.test(vehicleNumber)
    ) {

        throw new Error(
            "Invalid vehicle number."
        );

    }


    // ==================================================
    // MANUFACTURING YEAR
    // ==================================================

    const manufacturingYear =
        Number(requestData.manufacturingYear);


    const currentYear =
        new Date().getFullYear();


    if (
        !Number.isInteger(manufacturingYear) ||
        manufacturingYear < 1900 ||
        manufacturingYear > currentYear
    ) {

        throw new Error(
            "Invalid manufacturing year."
        );

    }


    // ==================================================
    // FUEL TYPE
    // ==================================================

    if (
        !requestData.fuelType ||
        !requestData.fuelType.trim()
    ) {

        throw new Error(
            "Fuel type is required."
        );

    }


    // ==================================================
    // TRANSMISSION
    // ==================================================

    if (
        !requestData.transmission ||
        !requestData.transmission.trim()
    ) {

        throw new Error(
            "Transmission is required."
        );

    }


    // ==================================================
    // KM DRIVEN
    // ==================================================

    const kmDriven =
        Number(requestData.kmDriven);


    if (
        !Number.isInteger(kmDriven) ||
        kmDriven < 0
    ) {

        throw new Error(
            "Invalid kilometers driven."
        );

    }


    // ==================================================
    // EXPECTED PRICE
    // ==================================================

    const expectedPrice =
        Number(requestData.expectedPrice);


    if (
        !Number.isFinite(expectedPrice) ||
        expectedPrice <= 0
    ) {

        throw new Error(
            "Expected price must be greater than 0."
        );

    }


    // ==================================================
    // REQUIRED IMAGE VALIDATION
    // EXISTING + NEW IMAGES
    // ==================================================

    const requiredImages = [

        {
            field: "frontImage",
            label: "Front image"
        },

        {
            field: "backImage",
            label: "Back image"
        },

        {
            field: "leftImage",
            label: "Left side image"
        },

        {
            field: "rightImage",
            label: "Right side image"
        },

        {
            field: "interiorFrontImage",
            label: "Interior front image"
        },

        {
            field: "interiorRearImage",
            label: "Interior rear image"
        },

        {
            field: "openDickyImage",
            label: "Open dicky image"
        },

        {
            field: "openBonnetImage",
            label: "Open bonnet image"
        },

        {
            field: "odometerImage",
            label: "Odometer image"
        },

        {
            field: "dashboardImage",
            label: "Dashboard image"
        }

    ];


    for (const image of requiredImages) {

        const imagePath =
            requestData[image.field];


        if (
            typeof imagePath !== "string" ||
            !imagePath.trim()
        ) {

            throw new Error(
                `${image.label} is required.`
            );

        }

    }


    // ==================================================
    // PREPARE DATA
    // ==================================================

    const data = {

        sellerName:
            requestData.sellerName.trim(),

        ownerName,

        mobile,

        email,

        city,

        brand:
            requestData.brand.trim(),

        model:
            requestData.model.trim(),

        variant:
            requestData.variant.trim(),

        vehicleNumber,

        manufacturingYear,

        fuelType:
            requestData.fuelType.trim(),

        transmission:
            requestData.transmission.trim(),

        kmDriven,

        expectedPrice,


        // EXISTING IMAGES

        frontImage:
            requestData.frontImage,

        backImage:
            requestData.backImage,

        leftImage:
            requestData.leftImage,

        rightImage:
            requestData.rightImage,


        // NEW IMAGES

        interiorFrontImage:
            requestData.interiorFrontImage,

        interiorRearImage:
            requestData.interiorRearImage,

        openDickyImage:
            requestData.openDickyImage,

        openBonnetImage:
            requestData.openBonnetImage,

        odometerImage:
            requestData.odometerImage,

        dashboardImage:
            requestData.dashboardImage,


        status:
            "Pending"

    };


    // ==================================================
    // SAVE REQUEST
    // ==================================================

    const result =
        await sellCarRepository.createSellCarRequest(
            data
        );


    // ==================================================
    // RETURN
    // ==================================================

    return {

        sellId:
            result.sellId,

        message:
            "Sell car request submitted successfully."

    };

};


// ======================================================
// GET ALL SELL CAR REQUESTS
// Admin
// ======================================================

const getAllSellCarRequests = async () => {

    const requests =
        await sellCarRepository.getAllSellCarRequests();


    return {

        requests

    };

};


// ======================================================
// GET SELL CAR REQUEST BY ID
// Admin
// ======================================================

const getSellCarRequestById = async (sellId) => {

    const numericSellId =
        Number(sellId);


    // ==================================================
    // VALIDATE ID
    // ==================================================

    if (
        !Number.isInteger(numericSellId) ||
        numericSellId <= 0
    ) {

        throw new Error(
            "Invalid sell request ID."
        );

    }


    // ==================================================
    // GET REQUEST
    // ==================================================

    const request =
        await sellCarRepository.getSellCarRequestById(
            numericSellId
        );


    if (!request) {

        throw new Error(
            "Sell car request not found."
        );

    }


    // ==================================================
    // RETURN
    // ==================================================

    return {

        sellId:
            request.sell_id,

        sellerName:
            request.seller_name,

        ownerName:
            request.owner_name,

        mobile:
            request.mobile,

        email:
            request.email,

        city:
            request.city,

        brand:
            request.brand,

        model:
            request.model,

        variant:
            request.variant,

        vehicleNumber:
            request.vehicle_number,

        manufacturingYear:
            request.manufacturing_year,

        fuelType:
            request.fuel_type,

        transmission:
            request.transmission,

        kmDriven:
            request.km_driven,

        expectedPrice:
            request.expected_price,


        // EXISTING IMAGES

        frontImage:
            request.front_image,

        backImage:
            request.back_image,

        leftImage:
            request.left_image,

        rightImage:
            request.right_image,


        // NEW IMAGES

        interiorFrontImage:
            request.interior_front_image,

        interiorRearImage:
            request.interior_rear_image,

        openDickyImage:
            request.open_dicky_image,

        openBonnetImage:
            request.open_bonnet_image,

        odometerImage:
            request.odometer_image,

        dashboardImage:
            request.dashboard_image,


        status:
            request.status,

        createdAt:
            request.created_at

    };

};


// ======================================================
// UPDATE SELL CAR REQUEST STATUS
// Admin
// ======================================================

const updateSellCarRequestStatus = async (
    sellId,
    status
) => {

    const numericSellId =
        Number(sellId);


    // ==================================================
    // VALIDATE ID
    // ==================================================

    if (
        !Number.isInteger(numericSellId) ||
        numericSellId <= 0
    ) {

        throw new Error(
            "Invalid sell request ID."
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
        await sellCarRepository.getSellCarRequestById(
            numericSellId
        );


    if (!existingRequest) {

        throw new Error(
            "Sell car request not found."
        );

    }


    // ==================================================
    // UPDATE STATUS
    // ==================================================

    await sellCarRepository.updateSellCarRequestStatus(
        numericSellId,
        status
    );


    // ==================================================
    // RETURN
    // ==================================================

    return {

        sellId:
            numericSellId,

        status,

        message:
            "Sell car request status updated successfully."

    };

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    createSellCarRequest,

    getAllSellCarRequests,

    getSellCarRequestById,

    updateSellCarRequestStatus

};