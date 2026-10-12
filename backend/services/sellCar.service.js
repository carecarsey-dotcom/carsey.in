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
    // OWNER NAME (OPTIONAL)
    // ==================================================

    const ownerName =
        typeof requestData.ownerName === "string" && requestData.ownerName.trim()
            ? requestData.ownerName.trim()
            : null;

    // Ownership is optional when it is not supplied by the form.
    const allowedOwnerClassifications = [
        "First Owner",
        "Second Owner",
        "Third Owner"
    ];

    const ownerClassification =
        typeof requestData.ownerClassification === "string"
            ? requestData.ownerClassification.trim()
            : null;

    if (ownerClassification && !allowedOwnerClassifications.includes(ownerClassification)) {
        throw new Error(
            "Ownership must be First Owner, Second Owner, or Third Owner."
        );
    }


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
    // Only four exterior images are required.
    // ==================================================

    const requiredImages = [
        { field: "frontImage", label: "Front image" },
        { field: "backImage", label: "Rear image" },
        { field: "leftImage", label: "Left side image" },
        { field: "rightImage", label: "Right side image" }
    ];

    for (const image of requiredImages) {
        const imagePath = requestData[image.field];

        if (typeof imagePath !== "string" || !imagePath.trim()) {
            throw new Error(`${image.label} is required.`);
        }
    }


    // ==================================================
    // PREPARE DATA
    // ==================================================

    const data = {

        sellerName:
            requestData.sellerName.trim(),

        ownerName,

        ownerClassification,

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
            requestData.interiorFrontImage || null,

        interiorRearImage:
            requestData.interiorRearImage || null,

        openDickyImage:
            requestData.openDickyImage || null,

        openBonnetImage:
            requestData.openBonnetImage || null,

        odometerImage:
            requestData.odometerImage || null,

        dashboardImage:
            requestData.dashboardImage || null,

        // Additional image (requires extra_image DB column).
        extraImage:
            requestData.extraImage || null,


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

        ownerClassification:
            request.owner_classification,

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

        extraImage:
            request.extra_image,


        status:
            request.status,

        assignedEmployeeId:
            request.assigned_employee_id,

        workflowStatus:
            request.workflow_status,

        correctionNote:
            request.correction_note,

        submittedForApprovalAt:
            request.submitted_for_approval_at,

        createdAt:
            request.created_at

    };

};


// ======================================================
// UPDATE SELL CAR REQUEST STATUS
// Admin
// ======================================================

const updateSellCarRequestStatus = async (sellId, status) => {
    const numericSellId = Number(sellId);
    if (!Number.isInteger(numericSellId) || numericSellId <= 0) {
        throw new Error("Invalid sell request ID.");
    }
    if (status !== "Approved" && status !== "Rejected") {
        throw new Error("Status must be Approved or Rejected.");
    }

    const existingRequest = await sellCarRepository.getSellCarRequestById(numericSellId);
    if (!existingRequest) throw new Error("Sell car request not found.");
    if (existingRequest.workflow_status !== "Pending Approval") {
        throw new Error("Only requests pending Admin approval can be approved or rejected.");
    }

    const method = status === "Approved"
        ? sellCarRepository.approveSellCarRequest
        : sellCarRepository.rejectSellCarRequest;
    if (typeof method !== "function") {
        throw new Error(`Repository method for ${status.toLowerCase()} is missing.`);
    }

    const result = await method(numericSellId);
    if (!result || result.affectedRows === 0) {
        throw new Error("Request status was not changed. It may no longer be pending approval.");
    }

    return {
        sellId: numericSellId,
        status,
        workflowStatus: status,
        message: status === "Approved"
            ? "Sell Car request approved successfully. It can now be published."
            : "Sell Car request rejected successfully."
    };
};


// ======================================================
// ASSIGN SELL CAR REQUEST TO EMPLOYEE
// Admin only (route must use verifyToken + requireAdmin)
// ======================================================

const assignSellCarRequest = async (sellId, employeeId) => {
    const numericSellId = Number(sellId);
    const numericEmployeeId = Number(employeeId);

    if (!Number.isInteger(numericSellId) || numericSellId <= 0) {
        throw new Error("Invalid sell request ID.");
    }

    if (!Number.isInteger(numericEmployeeId) || numericEmployeeId <= 0) {
        throw new Error("Valid employee ID is required.");
    }

    const request = await sellCarRepository.getSellCarRequestById(numericSellId);
    if (!request) throw new Error("Sell car request not found.");

    // Never allow a completed request to be reassigned.
    if (["Approved", "Rejected"].includes(String(request.workflow_status || ""))) {
        throw new Error("Approved or rejected requests cannot be reassigned.");
    }

    if (typeof sellCarRepository.getEmployeeById !== "function") {
        throw new Error("Repository method getEmployeeById(employeeId) is missing.");
    }

    const employee = await sellCarRepository.getEmployeeById(numericEmployeeId);
    if (!employee || employee.role !== "Employee") {
        throw new Error("Selected employee was not found.");
    }

    const result = await sellCarRepository.assignSellCarRequest(
        numericSellId,
        numericEmployeeId
    );

    if (!result || result.affectedRows === 0) {
        throw new Error("Unable to assign sell car request.");
    }

    return {
        sellId: numericSellId,
        assignedEmployeeId: numericEmployeeId,
        workflowStatus: "Assigned",
        message: "Sell car request assigned successfully."
    };
};

// ======================================================
// GET REQUESTS ASSIGNED TO EMPLOYEE
// Employee ID must come from verified JWT in controller.
// ======================================================

const getAssignedSellCarRequests = async (employeeId) => {
    const numericEmployeeId = Number(employeeId);
    if (!Number.isInteger(numericEmployeeId) || numericEmployeeId <= 0) {
        throw new Error("Invalid employee ID.");
    }

    const requests = await sellCarRepository.getAssignedSellCarRequests(numericEmployeeId);
    return { requests };
};

// ======================================================
// UPDATE ASSIGNED REQUEST
// Only the assigned employee should be allowed by route/controller.
// ======================================================

const updateAssignedSellCarRequest = async (sellId, employeeId, requestData) => {
    const numericSellId = Number(sellId);
    const numericEmployeeId = Number(employeeId);

    if (!Number.isInteger(numericSellId) || numericSellId <= 0) {
        throw new Error("Invalid sell request ID.");
    }
    if (!Number.isInteger(numericEmployeeId) || numericEmployeeId <= 0) {
        throw new Error("Invalid employee ID.");
    }

    const current = await sellCarRepository.getSellCarRequestById(numericSellId);
    if (!current) throw new Error("Sell car request not found.");
    if (Number(current.assigned_employee_id) !== numericEmployeeId) {
        throw new Error("You are not assigned to this sell car request.");
    }
    if (!["Assigned", "Correction Required"].includes(current.workflow_status)) {
        throw new Error("This request cannot be edited in its current workflow status.");
    }

    // Keep previously saved values when a field is omitted from the update.
    const value = (camel, snake) => requestData[camel] ?? current[snake];
    const normalized = {
        sellerName: String(value("sellerName", "seller_name") || "").trim(),
        mobile: String(value("mobile", "mobile") || "").trim(),
        email: String(value("email", "email") || "").trim().toLowerCase(),
        city: String(value("city", "city") || "").trim(),
        brand: String(value("brand", "brand") || "").trim(),
        model: String(value("model", "model") || "").trim(),
        variant: String(value("variant", "variant") || "").trim(),
        vehicleNumber: String(value("vehicleNumber", "vehicle_number") || "").trim().toUpperCase().replace(/\s+/g, ""),
        manufacturingYear: Number(value("manufacturingYear", "manufacturing_year")),
        fuelType: String(value("fuelType", "fuel_type") || "").trim(),
        transmission: String(value("transmission", "transmission") || "").trim(),
        kmDriven: Number(value("kmDriven", "km_driven")),
        expectedPrice: Number(value("expectedPrice", "expected_price")),
        frontImage: requestData.frontImage || current.front_image,
        backImage: requestData.backImage || current.back_image,
        leftImage: requestData.leftImage || current.left_image,
        rightImage: requestData.rightImage || current.right_image,

        // Optional images: preserve the existing DB paths when no new file is uploaded.
        interiorFrontImage: requestData.interiorFrontImage || current.interior_front_image || null,
        interiorRearImage: requestData.interiorRearImage || current.interior_rear_image || null,
        odometerImage: requestData.odometerImage || current.odometer_image || null,
        extraImage: requestData.extraImage || current.extra_image || null,

        // Legacy images are preserved and are not repurposed for the new image slots.
        openDickyImage: current.open_dicky_image || null,
        openBonnetImage: current.open_bonnet_image || null,
        dashboardImage: current.dashboard_image || null
    };

    for (const field of ["sellerName", "mobile", "email", "city", "brand", "model", "variant", "vehicleNumber", "fuelType", "transmission"]) {
        if (!normalized[field]) throw new Error(`${field} is required.`);
    }
    if (!/^[0-9]{10,15}$/.test(normalized.mobile)) throw new Error("Invalid mobile number.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email)) throw new Error("Invalid email address.");
    if (!/^[A-Z0-9-]{4,20}$/.test(normalized.vehicleNumber)) throw new Error("Invalid vehicle number.");
    if (!Number.isInteger(normalized.manufacturingYear) || normalized.manufacturingYear < 1900 || normalized.manufacturingYear > new Date().getFullYear()) throw new Error("Invalid manufacturing year.");
    if (!Number.isInteger(normalized.kmDriven) || normalized.kmDriven < 0) throw new Error("Invalid kilometers driven.");
    if (!Number.isFinite(normalized.expectedPrice) || normalized.expectedPrice <= 0) throw new Error("Expected price must be greater than 0.");
    for (const key of ["frontImage", "backImage", "leftImage", "rightImage"]) {
        if (typeof normalized[key] !== "string" || !normalized[key].trim()) throw new Error(`${key} is required.`);
    }

    const result = await sellCarRepository.updateAssignedSellCarRequest(
        numericSellId,
        numericEmployeeId,
        normalized
    );
    if (!result || result.affectedRows === 0) {
        throw new Error("Request could not be updated. Check assignment and workflow status.");
    }
    return { sellId: numericSellId, message: "Sell car request updated successfully." };
};

// ======================================================
// SUBMIT REQUEST FOR ADMIN APPROVAL
// ======================================================

const submitSellCarRequestForApproval = async (sellId, employeeId) => {
    const numericSellId = Number(sellId);
    const numericEmployeeId = Number(employeeId);
    if (!Number.isInteger(numericSellId) || numericSellId <= 0) throw new Error("Invalid sell request ID.");
    if (!Number.isInteger(numericEmployeeId) || numericEmployeeId <= 0) throw new Error("Invalid employee ID.");

    const request = await sellCarRepository.getSellCarRequestById(numericSellId);
    if (!request) throw new Error("Sell car request not found.");
    if (Number(request.assigned_employee_id) !== numericEmployeeId) throw new Error("You are not assigned to this sell car request.");
    if (!["Assigned", "Correction Required"].includes(request.workflow_status)) throw new Error("This request cannot be submitted in its current workflow status.");

    for (const [field, label] of [["front_image", "Front image"], ["back_image", "Rear image"], ["left_image", "Left image"], ["right_image", "Right image"]]) {
        if (!request[field]) throw new Error(`${label} is required before submission.`);
    }

    const result = await sellCarRepository.submitSellCarRequestForApproval(numericSellId, numericEmployeeId);
    if (!result || result.affectedRows === 0) throw new Error("Request could not be submitted for approval.");
    return { sellId: numericSellId, workflowStatus: "Pending Approval", message: "Request submitted for Admin approval." };
};

// ======================================================
// SEND REQUEST FOR CORRECTION
// Admin only (route must use requireAdmin)
// ======================================================

const sendSellCarRequestForCorrection = async (sellId, correctionNote) => {
    const numericSellId = Number(sellId);
    if (!Number.isInteger(numericSellId) || numericSellId <= 0) throw new Error("Invalid sell request ID.");
    if (typeof correctionNote !== "string" || !correctionNote.trim()) throw new Error("Correction note is required.");

    const request = await sellCarRepository.getSellCarRequestById(numericSellId);
    if (!request) throw new Error("Sell car request not found.");
    if (request.workflow_status !== "Pending Approval") throw new Error("Only requests pending approval can be returned for correction.");

    const result = await sellCarRepository.sendSellCarRequestForCorrection(numericSellId, correctionNote.trim());
    if (!result || result.affectedRows === 0) throw new Error("Request could not be returned for correction.");
    return { sellId: numericSellId, workflowStatus: "Correction Required", correctionNote: correctionNote.trim(), message: "Request returned to employee for correction." };
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