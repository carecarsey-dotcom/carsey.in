const inspectionBookingRepository =
    require(
        "../repositories/inspectionBooking.repository"
    );


// ======================================================
// CUSTOMER-FACING BOOKING ID
// ======================================================

const getBookingCode = (bookingId) => {
    const id = Number(bookingId);

    if (!Number.isInteger(id) || id <= 0) {
        return null;
    }

    return `CAR-${String(id).padStart(6, "0")}`;
};


// ======================================================
// CREATE BOOKING
// ======================================================

const createBooking = async (
    bookingData
) => {

    const {
        name,
        mobile,
        email,
        city,
        vehicleNumber,
        brand,
        model,
        address,
        bookingDate,
        timeSlot
    } = bookingData;


    // ==================================================
    // REQUIRED VALIDATION
    // ==================================================

    if (!name) {
        throw new Error(
            "Name is required."
        );
    }

    if (!mobile) {
        throw new Error(
            "Mobile number is required."
        );
    }

    if (!email) {
        throw new Error(
            "Email is required."
        );
    }

    if (!city) {
        throw new Error(
            "City is required."
        );
    }

    if (!vehicleNumber) {
        throw new Error(
            "Vehicle number is required."
        );
    }

    if (!brand) {
        throw new Error(
            "Vehicle brand is required."
        );
    }

    if (!model) {
        throw new Error(
            "Vehicle model is required."
        );
    }

    if (!address) {
        throw new Error(
            "Address is required."
        );
    }

    if (!bookingDate) {
        throw new Error(
            "Booking date is required."
        );
    }

    if (!timeSlot) {
        throw new Error(
            "Time slot is required."
        );
    }


    // ==================================================
    // CREATE DATABASE RECORD
    // ==================================================

    const result =
        await inspectionBookingRepository.createBooking(
            bookingData
        );


    return result.insertId;

};


// ======================================================
// GET ALL BOOKINGS
// ======================================================

const getAllBookings = async () => {

    const bookings =
        await inspectionBookingRepository
            .getAllBookings();

    return bookings.map((booking) => ({
        ...booking,
        booking_code:
            getBookingCode(booking?.booking_id)
    }));

};


// ======================================================
// GET SINGLE BOOKING
// ======================================================

const getBookingById = async (
    bookingId
) => {

    if (!bookingId) {
        throw new Error(
            "Booking ID is required."
        );
    }


    const booking =
        await
            inspectionBookingRepository
                .getBookingById(
                    bookingId
                );


    if (!booking) {
        throw new Error(
            "Inspection booking not found."
        );
    }


    return {
        ...booking,
        booking_code:
            getBookingCode(booking?.booking_id)
    };

};


// ======================================================
// UPDATE BOOKING STATUS
// ======================================================

const updateBookingStatus = async (
    bookingId,
    status
) => {

    const allowedStatuses = [
        "Pending",
        "Approved",
        "Rejected"
    ];


    if (!bookingId) {
        throw new Error(
            "Booking ID is required."
        );
    }


    if (!allowedStatuses.includes(status)) {
        throw new Error(
            "Invalid booking status."
        );
    }


    const booking =
        await
            inspectionBookingRepository
                .getBookingById(
                    bookingId
                );


    if (!booking) {
        throw new Error(
            "Inspection booking not found."
        );
    }


    await
        inspectionBookingRepository
            .updateBookingStatus(
                bookingId,
                status
            );


    return {

        bookingId,

        bookingCode: getBookingCode(bookingId),

        status

    };

};


// ======================================================
// ASSIGN INSPECTION TO EMPLOYEE
// ADMIN ONLY
// ======================================================

const assignInspection = async (
    bookingId,
    employeeId
) => {

    // ==================================================
    // VALIDATION
    // ==================================================

    if (!bookingId) {
        throw new Error(
            "Booking ID is required."
        );
    }


    if (!employeeId) {
        throw new Error(
            "Employee ID is required."
        );
    }


    // ==================================================
    // CHECK BOOKING
    // ==================================================

    const booking =
        await
            inspectionBookingRepository
                .getBookingById(
                    bookingId
                );


    if (!booking) {
        throw new Error(
            "Inspection booking not found."
        );
    }


    // ==================================================
    // CHECK EMPLOYEE
    // ==================================================

    const employee =
        await
            inspectionBookingRepository
                .findEmployeeById(
                    employeeId
                );


    if (!employee) {
        throw new Error(
            "Employee not found."
        );
    }


    // ==================================================
    // EMPLOYEE ROLE CHECK
    // ==================================================

    if (
        employee.role !== "Employee"
    ) {

        throw new Error(
            "Selected account is not an Employee."
        );

    }


    // ==================================================
    // EMPLOYEE STATUS CHECK
    // ==================================================

    if (
        employee.status !== "Active"
    ) {

        throw new Error(
            "Selected Employee account is inactive."
        );

    }


    // ==================================================
    // CHECK LATEST INSPECTION REQUEST
    // ==================================================

    const existingRequest =
        await
            inspectionBookingRepository
                .findInspectionRequestByBookingId(
                    bookingId
                );


    // ==================================================
    // IF REQUEST ALREADY EXISTS
    // ==================================================

    if (existingRequest) {

        // ------------------------------------------------
        // ACTIVE / COMPLETED REQUEST
        // ------------------------------------------------

        const blockedStatuses = [
            "Assigned",
            "Accepted",
            "In Progress",
            "Submitted",
            "Approved",
            "Published"
        ];


        if (
            blockedStatuses.includes(
                existingRequest.status
            )
        ) {

            throw new Error(
                `This booking is already assigned. Current inspection status: ${existingRequest.status}`
            );

        }


        // ------------------------------------------------
        // REJECTED REQUEST
        // ------------------------------------------------
        //
        // IMPORTANT:
        // Old request ko update/reset nahi karna.
        //
        // New inspection request create hogi.
        // Isse rejection history safe rahegi.
        //
        // Allowed:
        // Rejected
        // Admin Rejected
        //
        // ------------------------------------------------

        if (
            existingRequest.status === "Rejected" ||
            existingRequest.status === "Admin Rejected"
        ) {

            const result =
                await
                    inspectionBookingRepository
                        .createInspectionRequest(
                            bookingId,
                            employeeId
                        );


            const requestId =
                result.insertId;


            return {

                requestId,

                bookingId,

                bookingCode: getBookingCode(bookingId),

                employeeId,

                employeeName:
                    employee.name,

                employeeEmail:
                    employee.email,

                status:
                    "Assigned",

                previousRequestId:
                    existingRequest.request_id,

                previousStatus:
                    existingRequest.status,

                message:
                    "Inspection reassigned to Employee successfully."

            };

        }


        // ------------------------------------------------
        // SAFETY FALLBACK
        // ------------------------------------------------

        throw new Error(
            `Inspection cannot be assigned. Current status: ${existingRequest.status}`
        );

    }


    // ==================================================
    // CREATE FIRST INSPECTION REQUEST
    // ==================================================

    const result =
        await
            inspectionBookingRepository
                .createInspectionRequest(
                    bookingId,
                    employeeId
                );


    const requestId =
        result.insertId;


    return {

        requestId,

        bookingId,

        bookingCode: getBookingCode(bookingId),

        employeeId,

        employeeName:
            employee.name,

        employeeEmail:
            employee.email,

        status:
            "Assigned",

        message:
            "Inspection assigned to Employee successfully."

    };

};


// ======================================================
// GET EMPLOYEE ASSIGNMENTS
// EMPLOYEE ONLY
// ======================================================

const getEmployeeAssignments = async (
    employeeId
) => {

    if (!employeeId) {
        throw new Error(
            "Employee ID is required."
        );
    }


    const employee =
        await
            inspectionBookingRepository
                .findEmployeeById(
                    employeeId
                );


    if (!employee) {
        throw new Error(
            "Employee not found."
        );
    }


    if (
        employee.role !== "Employee"
    ) {

        throw new Error(
            "Selected account is not an Employee."
        );

    }


    const assignments =
        await inspectionBookingRepository
            .getEmployeeAssignments(
                employeeId
            );

    return assignments.map((assignment) => ({
        ...assignment,
        booking_code:
            getBookingCode(assignment?.booking_id)
    }));

};


// ======================================================
// GET INSPECTION REQUEST
// ======================================================

const getInspectionRequestById = async (
    requestId
) => {

    if (!requestId) {
        throw new Error(
            "Request ID is required."
        );
    }


    const request =
        await
            inspectionBookingRepository
                .getInspectionRequestById(
                    requestId
                );


    if (!request) {
        throw new Error(
            "Inspection request not found."
        );
    }


    return {
        ...request,
        booking_code:
            getBookingCode(request?.booking_id)
    };

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    createBooking,

    getAllBookings,

    getBookingById,

    updateBookingStatus,

    assignInspection,

    getEmployeeAssignments,

    getInspectionRequestById,

    getBookingCode

};