const db = require("../config/db");


// ======================================================
// HELPER
// MYSQL CALLBACK QUERY KO PROMISE ME CONVERT KARNA
// ======================================================

const executeQuery = (
    query,
    values = []
) => {

    return new Promise(
        (resolve, reject) => {

            db.query(
                query,
                values,
                (error, result) => {

                    if (error) {
                        return reject(error);
                    }

                    resolve(result);

                }
            );

        }
    );

};


// ======================================================
// CREATE INSPECTION BOOKING
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


    const query = `
        INSERT INTO inspection_bookings
        (
            name,
            mobile,
            email,
            city,
            vehicle_number,
            brand,
            model,
            address,
            booking_date,
            time_slot,
            status
        )
        VALUES
        (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending'
        )
    `;


    const result =
        await executeQuery(
            query,
            [
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
            ]
        );


    return result;

};


// ======================================================
// GET ALL BOOKINGS
// ======================================================

// ======================================================
// GET ALL BOOKINGS
// ======================================================

const getAllBookings = async () => {

    const query = `
        SELECT

            ib.booking_id,
            ib.name,
            ib.mobile,
            ib.email,
            ib.city,
            ib.vehicle_number,
            ib.brand,
            ib.model,
            ib.address,
            ib.booking_date,
            ib.time_slot,
            ib.status,
            ib.created_at,

            ir.request_id,
            ir.employee_id,
            ir.report_id,
            ir.status AS inspection_request_status,

            employee.name AS employee_name,
            employee.email AS employee_email

        FROM inspection_bookings ib

        LEFT JOIN inspection_requests ir
            ON ir.request_id = (
                SELECT ir2.request_id
                FROM inspection_requests ir2
                WHERE ir2.booking_id = ib.booking_id
                ORDER BY ir2.request_id DESC
                LIMIT 1
            )

        LEFT JOIN admins employee
            ON employee.admin_id = ir.employee_id
            AND employee.role = 'Employee'

        ORDER BY ib.booking_id DESC
    `;


    const rows =
        await executeQuery(query);


    return rows;

};


// ======================================================
// GET BOOKING BY ID
// ======================================================

const getBookingById = async (
    bookingId
) => {

    const query = `
        SELECT

            ib.booking_id,
            ib.name,
            ib.mobile,
            ib.email,
            ib.city,
            ib.vehicle_number,
            ib.brand,
            ib.model,
            ib.address,
            ib.booking_date,
            ib.time_slot,
            ib.status,
            ib.created_at,

            ir.request_id,
            ir.employee_id,
            ir.report_id,
            ir.status AS inspection_request_status,
            ir.employee_remark,
            ir.admin_remark,
            ir.assigned_at,
            ir.accepted_at,
            ir.rejected_at,
            ir.started_at,
            ir.submitted_at,
            ir.admin_reviewed_at,
            ir.approved_at,
            ir.published_at,

            employee.name AS employee_name,
            employee.email AS employee_email

        FROM inspection_bookings ib

        LEFT JOIN inspection_requests ir
            ON ir.request_id = (
                SELECT ir2.request_id
                FROM inspection_requests ir2
                WHERE ir2.booking_id = ib.booking_id
                ORDER BY ir2.request_id DESC
                LIMIT 1
            )

        LEFT JOIN admins employee
            ON employee.admin_id = ir.employee_id
            AND employee.role = 'Employee'

        WHERE ib.booking_id = ?

        LIMIT 1
    `;


    const rows =
        await executeQuery(
            query,
            [
                bookingId
            ]
        );


    return rows[0] || null;

};


// ======================================================
// UPDATE BOOKING STATUS
// ======================================================

const updateBookingStatus = async (
    bookingId,
    status
) => {

    const query = `
        UPDATE inspection_bookings
        SET status = ?
        WHERE booking_id = ?
    `;


    const result =
        await executeQuery(
            query,
            [
                status,
                bookingId
            ]
        );


    return result;

};


// ======================================================
// FIND EMPLOYEE
// ======================================================

const findEmployeeById = async (
    employeeId
) => {

    const query = `
        SELECT
            admin_id,
            name,
            email,
            role,
            status
        FROM admins
        WHERE admin_id = ?
        LIMIT 1
    `;


    const rows =
        await executeQuery(
            query,
            [
                employeeId
            ]
        );


    return rows[0] || null;

};


// ======================================================
// FIND LATEST INSPECTION REQUEST BY BOOKING
// ======================================================

const findInspectionRequestByBookingId = async (
    bookingId
) => {

    const query = `
        SELECT

            request_id,
            booking_id,
            employee_id,
            report_id,
            status,
            employee_remark,
            admin_remark,
            assigned_at,
            accepted_at,
            rejected_at,
            started_at,
            submitted_at,
            admin_reviewed_at,
            approved_at,
            published_at,
            created_at,
            updated_at

        FROM inspection_requests

        WHERE booking_id = ?

        ORDER BY request_id DESC

        LIMIT 1
    `;


    const rows =
        await executeQuery(
            query,
            [
                bookingId
            ]
        );


    return rows[0] || null;

};


// ======================================================
// CREATE INSPECTION REQUEST
// ======================================================

const createInspectionRequest = async (
    bookingId,
    employeeId
) => {

    const query = `
        INSERT INTO inspection_requests
        (
            booking_id,
            employee_id,
            status,
            assigned_at
        )
        VALUES
        (
            ?,
            ?,
            'Assigned',
            CURRENT_TIMESTAMP
        )
    `;


    const result =
        await executeQuery(
            query,
            [
                bookingId,
                employeeId
            ]
        );


    return result;

};


// ======================================================
// REASSIGN INSPECTION REQUEST
// ======================================================
//
// IMPORTANT:
// Purane rejected request ko overwrite nahi karna.
// Is function ko compatibility ke liye rakha gaya hai.
//
// Actual reassignment ke liye NEW inspection request
// create ki jayegi. Service layer next step mein is
// function ka use accordingly handle karegi.
//
// ======================================================

const reassignInspectionRequest = async (
    requestId,
    employeeId
) => {

    const oldRequestQuery = `
        SELECT
            request_id,
            booking_id,
            status
        FROM inspection_requests
        WHERE request_id = ?
        LIMIT 1
    `;


    const oldRows =
        await executeQuery(
            oldRequestQuery,
            [
                requestId
            ]
        );


    if (!oldRows[0]) {
        throw new Error(
            "Inspection request not found."
        );
    }


    const oldRequest =
        oldRows[0];


    if (
        oldRequest.status !== "Rejected" &&
        oldRequest.status !== "Admin Rejected"
    ) {
        throw new Error(
            "Only rejected inspection requests can be reassigned."
        );
    }


    const query = `
        INSERT INTO inspection_requests
        (
            booking_id,
            employee_id,
            status,
            assigned_at
        )
        VALUES
        (
            ?,
            ?,
            'Assigned',
            CURRENT_TIMESTAMP
        )
    `;


    const result =
        await executeQuery(
            query,
            [
                oldRequest.booking_id,
                employeeId
            ]
        );


    return result;

};


// ======================================================
// GET EMPLOYEE ASSIGNMENTS
// ======================================================

const getEmployeeAssignments = async (
    employeeId
) => {

    const query = `
        SELECT

            ir.request_id,
            ir.booking_id,
            ir.employee_id,
            ir.report_id,
            ir.status,
            ir.employee_remark,
            ir.admin_remark,
            ir.assigned_at,
            ir.accepted_at,
            ir.rejected_at,
            ir.started_at,
            ir.submitted_at,
            ir.admin_reviewed_at,
            ir.approved_at,
            ir.published_at,
            ir.created_at,
            ir.updated_at,

            ib.name AS customer_name,
            ib.mobile AS customer_mobile,
            ib.email AS customer_email,
            ib.city AS customer_city,
            ib.vehicle_number,
            ib.brand,
            ib.model,
            ib.address,
            ib.booking_date,
            ib.time_slot,
            ib.status AS booking_status

        FROM inspection_requests ir

        INNER JOIN inspection_bookings ib
            ON ib.booking_id = ir.booking_id

        WHERE ir.employee_id = ?

        ORDER BY ir.request_id DESC
    `;


    const rows =
        await executeQuery(
            query,
            [
                employeeId
            ]
        );


    return rows;

};


// ======================================================
// GET INSPECTION REQUEST BY ID
// ======================================================

const getInspectionRequestById = async (
    requestId
) => {

    const query = `
        SELECT

            ir.request_id,
            ir.booking_id,
            ir.employee_id,
            ir.report_id,
            ir.status,
            ir.employee_remark,
            ir.admin_remark,
            ir.assigned_at,
            ir.accepted_at,
            ir.rejected_at,
            ir.started_at,
            ir.submitted_at,
            ir.admin_reviewed_at,
            ir.approved_at,
            ir.published_at,
            ir.created_at,
            ir.updated_at,

            ib.name AS customer_name,
            ib.mobile AS customer_mobile,
            ib.email AS customer_email,
            ib.city AS customer_city,
            ib.vehicle_number,
            ib.brand,
            ib.model,
            ib.address,
            ib.booking_date,
            ib.time_slot,
            ib.status AS booking_status

        FROM inspection_requests ir

        INNER JOIN inspection_bookings ib
            ON ib.booking_id = ir.booking_id

        WHERE ir.request_id = ?

        LIMIT 1
    `;


    const rows =
        await executeQuery(
            query,
            [
                requestId
            ]
        );


    return rows[0] || null;

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    createBooking,

    getAllBookings,

    getBookingById,

    updateBookingStatus,

    findEmployeeById,

    findInspectionRequestByBookingId,

    createInspectionRequest,

    reassignInspectionRequest,

    getEmployeeAssignments,

    getInspectionRequestById

};