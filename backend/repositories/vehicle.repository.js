const db = require("../config/db");


// ======================================================
// VEHICLE REPOSITORY
// ======================================================
//
// IMPORTANT FIX:
// Inspection report publish_status is synchronized with
// vehicle status so that:
// Published Vehicle
//        ↓
// Inspection Report publish_status = Yes
//
// Existing functionality is preserved.
// ======================================================


// ======================================================
// HELPER
// ======================================================

const normalizeValue = (value) => {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return null;
    }

    return value;
};


// ======================================================
// GET CONNECTION
// ======================================================

const getConnection = async () => {

    if (
        db &&
        typeof db.getConnection === "function"
    ) {
        return await db.getConnection();
    }

    return db;
};


// ======================================================
// RELEASE CONNECTION
// ======================================================

const releaseConnection = (connection) => {

    if (
        connection &&
        typeof connection.release === "function"
    ) {
        connection.release();
    }
};


// ======================================================
// QUERY
// ======================================================

const query = async (
    sql,
    params = []
) => {

    const connection =
        await getConnection();

    try {

        const result =
            await connection.query(
                sql,
                params
            );

        if (
            Array.isArray(result) &&
            result.length === 2
        ) {
            return result[0];
        }

        return result;

    }
    finally {

        releaseConnection(
            connection
        );
    }
};


// ======================================================
// GET VEHICLE BY ID
// ======================================================

const getVehicleById = async (
    carId
) => {

    const rows =
        await query(
            `
            SELECT *
            FROM vehicles
            WHERE car_id = ?
            LIMIT 1
            `,
            [
                carId
            ]
        );

    return rows &&
        rows.length
        ? rows[0]
        : null;
};


// ======================================================
// GET ALL VEHICLES
// ======================================================

const getAllVehicles = async () => {

    return await query(
        `
        SELECT *
        FROM vehicles
        ORDER BY car_id DESC
        `
    );
};


// ======================================================
// GET ALL ADMIN VEHICLES
// ======================================================

const getAllAdminVehicles = async () => {

    return await query(
        `
        SELECT *
        FROM vehicles
        ORDER BY car_id DESC
        `
    );
};


// ======================================================
// GET PUBLISHED VEHICLES
// ======================================================

const getPublishedVehicles = async (
    filters = {}
) => {

    let sql = `
        SELECT *
        FROM vehicles
        WHERE status = 'Published'
    `;

    const params = [];

    // ==================================================
    // BRAND
    // ==================================================

    if (
        filters.brand !== undefined &&
        filters.brand !== null &&
        filters.brand !== ""
    ) {

        sql += `
            AND brand = ?
        `;

        params.push(
            filters.brand
        );
    }


    // ==================================================
    // MODEL
    // ==================================================

    if (
        filters.model !== undefined &&
        filters.model !== null &&
        filters.model !== ""
    ) {

        sql += `
            AND model = ?
        `;

        params.push(
            filters.model
        );
    }


    // ==================================================
    // CITY
    // ==================================================

    if (
        filters.city !== undefined &&
        filters.city !== null &&
        filters.city !== ""
    ) {

        sql += `
            AND city = ?
        `;

        params.push(
            filters.city
        );
    }


    // ==================================================
    // FUEL TYPE
    // ==================================================

    if (
        filters.fuel_type !== undefined &&
        filters.fuel_type !== null &&
        filters.fuel_type !== ""
    ) {

        sql += `
            AND fuel_type = ?
        `;

        params.push(
            filters.fuel_type
        );
    }


    // ==================================================
    // TRANSMISSION
    // ==================================================

    if (
        filters.transmission !== undefined &&
        filters.transmission !== null &&
        filters.transmission !== ""
    ) {

        sql += `
            AND transmission = ?
        `;

        params.push(
            filters.transmission
        );
    }


    // ==================================================
    // ORDER
    // ==================================================

    sql += `
        ORDER BY car_id DESC
    `;


    return await query(
        sql,
        params
    );
};


// ======================================================
// INSERT VEHICLE
// ======================================================

const createVehicle = async (
    vehicle
) => {

    const {

        brand,
        model,
        variant,
        manufacturing_year,
        price,
        odometer,
        city,
        transmission,
        fuel_type,

        customer_name,
        owner_mobile,
        owner_email,

        registration_number,
        color,
        insurance_validity,
        registration_year,

        status,

        overall_score,

        description,

        front_image,
        back_image,
        left_image,
        right_image,

        main_image,

        image_1,
        image_2,
        image_3,
        image_4,

        // ==================================================
        // INSPECTION / ADDITIONAL DATA
        // ==================================================

        inspection_data,
        checklist_data,

        section,

        // ==================================================
        // OTHER FORM DATA
        // ==================================================

        ...rest

    } = vehicle || {};


    // ======================================================
    // DYNAMIC COLUMN BUILD
    // ======================================================

    const columns = [];
    const values = [];
    const placeholders = [];


    const addColumn = (
        column,
        value
    ) => {

        if (
            value === undefined
        ) {
            return;
        }

        columns.push(
            `\`${column}\``
        );

        values.push(
            normalizeValue(value)
        );

        placeholders.push(
            "?"
        );
    };


    // ======================================================
    // BASIC VEHICLE DATA
    // ======================================================

    addColumn(
        "brand",
        brand
    );

    addColumn(
        "model",
        model
    );

    addColumn(
        "variant",
        variant
    );

    addColumn(
        "manufacturing_year",
        manufacturing_year
    );

    addColumn(
        "price",
        price
    );

    addColumn(
        "odometer",
        odometer
    );

    addColumn(
        "city",
        city
    );

    addColumn(
        "transmission",
        transmission
    );

    addColumn(
        "fuel_type",
        fuel_type
    );


    // ======================================================
    // CUSTOMER DATA
    // ======================================================

    addColumn(
        "customer_name",
        customer_name
    );

    addColumn(
        "owner_mobile",
        owner_mobile
    );

    addColumn(
        "owner_email",
        owner_email
    );


    // ======================================================
    // REGISTRATION
    // ======================================================

    addColumn(
        "registration_number",
        registration_number
    );

    addColumn(
        "color",
        color
    );

    addColumn(
        "insurance_validity",
        insurance_validity
    );

    addColumn(
        "registration_year",
        registration_year
    );


    // ======================================================
    // STATUS
    // ======================================================

    addColumn(
        "status",
        status || "Draft"
    );


    // ======================================================
    // SCORE
    // ======================================================

    addColumn(
        "overall_score",
        overall_score
    );


    // ======================================================
    // DESCRIPTION
    // ======================================================

    addColumn(
        "description",
        description
    );


    // ======================================================
    // VEHICLE IMAGES
    // ======================================================

    addColumn(
        "front_image",
        front_image
    );

    addColumn(
        "back_image",
        back_image
    );

    addColumn(
        "left_image",
        left_image
    );

    addColumn(
        "right_image",
        right_image
    );

    addColumn(
        "main_image",
        main_image
    );

    addColumn(
        "image_1",
        image_1
    );

    addColumn(
        "image_2",
        image_2
    );

    addColumn(
        "image_3",
        image_3
    );

    addColumn(
        "image_4",
        image_4
    );


    // ======================================================
    // IMPORTANT:
    // DO NOT INSERT `section`
    //
    // Production DB does not contain section column.
    // This was the source of:
    //
    // Unknown column 'section' in 'field list'
    //
    // ======================================================


    // ======================================================
    // SAFE EXTRA COLUMNS
    // ======================================================
    //
    // Existing fields are preserved only when they are
    // explicitly part of the known vehicle table structure.
    //
    // ======================================================

    const allowedExtraColumns = [

        "body_type",
        "doors",
        "seating_capacity",
        "engine",
        "engine_capacity",
        "power",
        "torque",
        "mileage",
        "ground_clearance",
        "wheelbase",
        "tyre_condition",
        "battery_condition",
        "service_history",
        "rc_available",
        "insurance_type",
        "insurance_number",
        "pollution_validity",
        "hypothecation",
        "finance_status",
        "location",
        "seller_type",
        "ownership",
        "description_short",

        "air_conditioning",
        "power_windows",
        "central_locking",
        "abs",
        "airbags",
        "rear_camera",
        "parking_sensors",
        "sunroof",
        "alloy_wheels",

        "inspection_date",
        "inspection_by",

        "pdf_path",
        "pdf_url",

        "created_by"

    ];


    allowedExtraColumns.forEach(
        (column) => {

            if (
                Object.prototype.hasOwnProperty.call(
                    rest,
                    column
                )
            ) {

                addColumn(
                    column,
                    rest[column]
                );
            }
        }
    );


    // ======================================================
    // SAFETY
    // ======================================================

    if (
        columns.length === 0
    ) {

        throw new Error(
            "No vehicle data provided."
        );
    }


    // ======================================================
    // INSERT
    // ======================================================

    const sql = `
        INSERT INTO vehicles
        (
            ${columns.join(", ")}
        )
        VALUES
        (
            ${placeholders.join(", ")}
        )
    `;


    const result =
        await query(
            sql,
            values
        );


    return {

        insertId:
            result.insertId,

        affectedRows:
            result.affectedRows

    };
};


// ======================================================
// UPDATE VEHICLE
// ======================================================

const updateVehicle = async (
    carId,
    vehicle
) => {

    const allowedColumns = [

        "brand",
        "model",
        "variant",
        "manufacturing_year",
        "price",
        "odometer",
        "city",
        "transmission",
        "fuel_type",

        "customer_name",
        "owner_mobile",
        "owner_email",

        "registration_number",
        "color",
        "insurance_validity",
        "registration_year",

        "status",

        "overall_score",

        "description",

        "front_image",
        "back_image",
        "left_image",
        "right_image",

        "main_image",
        "image_1",
        "image_2",
        "image_3",
        "image_4",

        "body_type",
        "doors",
        "seating_capacity",
        "engine",
        "engine_capacity",
        "power",
        "torque",
        "mileage",
        "ground_clearance",
        "wheelbase",

        "tyre_condition",
        "battery_condition",
        "service_history",

        "rc_available",
        "insurance_type",
        "insurance_number",
        "pollution_validity",

        "hypothecation",
        "finance_status",

        "location",
        "seller_type",
        "ownership",

        "inspection_date",
        "inspection_by",

        "pdf_path",
        "pdf_url",

        "created_by"

    ];


    const updates = [];
    const values = [];


    allowedColumns.forEach(
        (column) => {

            if (
                Object.prototype.hasOwnProperty.call(
                    vehicle || {},
                    column
                )
            ) {

                updates.push(
                    `\`${column}\` = ?`
                );

                values.push(
                    normalizeValue(
                        vehicle[column]
                    )
                );
            }
        }
    );


    if (
        !updates.length
    ) {

        throw new Error(
            "No vehicle fields provided for update."
        );
    }


    values.push(
        carId
    );


    const result =
        await query(
            `
            UPDATE vehicles
            SET
                ${updates.join(", ")}
            WHERE car_id = ?
            `,
            values
        );


    return result;
};


// ======================================================
// DELETE VEHICLE
// ======================================================

const deleteVehicle = async (
    carId
) => {

    return await query(
        `
        DELETE FROM vehicles
        WHERE car_id = ?
        `,
        [
            carId
        ]
    );
};


// ======================================================
// GET OWNER / CUSTOMER DATA
// ======================================================

const getVehicleOwner = async (
    carId
) => {

    const rows =
        await query(
            `
            SELECT
                car_id,
                customer_name,
                owner_mobile,
                owner_email
            FROM vehicles
            WHERE car_id = ?
            LIMIT 1
            `,
            [
                carId
            ]
        );

    return rows &&
        rows.length
        ? rows[0]
        : null;
};


// ======================================================
// CREATE INSPECTION REPORT
// ======================================================

const createInspectionReport = async (
    connection,
    reportData
) => {

    // ==================================================
    // IMPORTANT
    // ==================================================
    //
    // NEVER send `section` to inspection_reports unless
    // the actual production DB contains that column.
    //
    // ==================================================

    const {

        car_id,

        customer_name,
        owner_mobile,
        owner_email,

        overall_score,

        status,

        report_status,

        pdf_path,

        inspection_date,

        checklist_data,

        inspection_data

    } = reportData || {};


    // ==================================================
    // PUBLISH STATUS FIX
    // ==================================================

    const publishStatus =
        (
            status === "Published" ||
            report_status === "Published"
        )
            ? "Yes"
            : "No";


    // ==================================================
    // SQL
    // ==================================================

    const sql = `
        INSERT INTO inspection_reports
        (
            car_id,
            customer_name,
            owner_mobile,
            owner_email,
            overall_score,
            status,
            publish_status,
            pdf_path,
            inspection_date,
            checklist_data,
            inspection_data
        )
        VALUES
        (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
        )
    `;


    const params = [

        normalizeValue(
            car_id
        ),

        normalizeValue(
            customer_name
        ),

        normalizeValue(
            owner_mobile
        ),

        normalizeValue(
            owner_email
        ),

        normalizeValue(
            overall_score
        ),

        normalizeValue(
            status
        ) || "Draft",

        publishStatus,

        normalizeValue(
            pdf_path
        ),

        normalizeValue(
            inspection_date
        ),

        normalizeValue(
            checklist_data
        ),

        normalizeValue(
            inspection_data
        )

    ];


    const result =
        await connection.query(
            sql,
            params
        );


    const rows =
        Array.isArray(result) &&
        result.length === 2
            ? result[0]
            : result;


    return {

        reportId:
            rows.insertId

    };
};


// ======================================================
// UPDATE INSPECTION REPORT PDF PATH
// ======================================================

const updateInspectionReportPdfPath = async (
    reportId,
    pdfPath
) => {

    return await query(
        `
        UPDATE inspection_reports
        SET
            pdf_path = ?
        WHERE report_id = ?
        `,
        [
            pdfPath,
            reportId
        ]
    );
};


// ======================================================
// IMPORTANT PUBLISH FIX
// ======================================================
//
// Whenever vehicle is Published, inspection report is
// also marked Published.
//
// This fixes:
//
// "Inspection report is not published."
//
// ======================================================

const publishInspectionReport = async (
    reportId
) => {

    if (
        !reportId
    ) {

        throw new Error(
            "Valid inspection report ID is required."
        );
    }


    return await query(
        `
        UPDATE inspection_reports
        SET
            publish_status = 'Yes',
            status = 'Published'
        WHERE report_id = ?
        `,
        [
            reportId
        ]
    );
};


// ======================================================
// GET INSPECTION REPORT
// ======================================================

const getInspectionReportById = async (
    reportId
) => {

    const rows =
        await query(
            `
            SELECT *
            FROM inspection_reports
            WHERE report_id = ?
            LIMIT 1
            `,
            [
                reportId
            ]
        );


    return rows &&
        rows.length
        ? rows[0]
        : null;
};


// ======================================================
// GET INSPECTION REPORT BY VEHICLE
// ======================================================

const getInspectionReportByVehicleId = async (
    carId
) => {

    const rows =
        await query(
            `
            SELECT *
            FROM inspection_reports
            WHERE car_id = ?
            ORDER BY report_id DESC
            LIMIT 1
            `,
            [
                carId
            ]
        );


    return rows &&
        rows.length
        ? rows[0]
        : null;
};


// ======================================================
// GET COMPLETE VEHICLE DATA
// ======================================================

const getCompleteVehicleData = async (
    carId
) => {

    const vehicle =
        await getVehicleById(
            carId
        );


    if (!vehicle) {

        return null;
    }


    const report =
        await getInspectionReportByVehicleId(
            carId
        );


    return {

        vehicle,

        report

    };
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    getVehicleById,

    getAllVehicles,

    getAllAdminVehicles,

    getPublishedVehicles,

    createVehicle,

    updateVehicle,

    deleteVehicle,

    getVehicleOwner,

    createInspectionReport,

    updateInspectionReportPdfPath,

    publishInspectionReport,

    getInspectionReportById,

    getInspectionReportByVehicleId,

    getCompleteVehicleData

};