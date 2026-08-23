const db =
    require("../config/db");


// ======================================================
// HELPER
// ======================================================

const query = (
    sql,
    params = []
) => {

    return new Promise(
        (resolve, reject) => {

            db.query(
                sql,
                params,
                (
                    error,
                    result
                ) => {

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
// CHECK COLUMN EXISTS
// ======================================================
//
// Optional fields ke liye use kiya gaya hai.
// Agar column DB mein nahi hai to query fail nahi hogi.
//
// ======================================================

const columnExists = async (
    tableName,
    columnName
) => {

    const rows =
        await query(
            `
                SELECT
                    COUNT(*) AS count

                FROM
                    INFORMATION_SCHEMA.COLUMNS

                WHERE
                    TABLE_SCHEMA = DATABASE()

                AND
                    TABLE_NAME = ?

                AND
                    COLUMN_NAME = ?
            `,
            [
                tableName,
                columnName
            ]
        );


    return Number(
        rows[0]?.count || 0
    ) > 0;
};


// ======================================================
// FIND FIRST EXISTING COLUMN
// ======================================================

const findExistingColumn = async (
    tableName,
    columns
) => {

    for (
        const column
        of columns
    ) {

        if (
            await columnExists(
                tableName,
                column
            )
        ) {

            return column;

        }

    }


    return null;
};


// ======================================================
// NORMALIZE JSON
// ======================================================

const parseJsonValue = (
    value,
    fallback = null
) => {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return fallback;

    }


    if (
        typeof value ===
        "object"
    ) {

        return value;

    }


    try {

        return JSON.parse(
            value
        );

    } catch (error) {

        return fallback;

    }

};


// ======================================================
// NORMALIZE CHECKLIST OPTIONS
// ======================================================

const normalizeSelectedOptions = (
    value
) => {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return [];

    }


    if (
        Array.isArray(value)
    ) {

        return value;

    }


    if (
        typeof value ===
        "object"
    ) {

        return value;

    }


    try {

        return JSON.parse(
            value
        );

    } catch (error) {

        return [
            value
        ];

    }

};


// ======================================================
// GET SINGLE VEHICLE
// ======================================================
//
// GET:
// /api/admin/vehicles/:carId
//
// DATA:
//
// 1. cars
// 2. owners
// 3. inspection_reports
// 4. inspection_checklist
// 5. car_images
//
// ======================================================

const getVehicleById = async (
    carId
) => {

    // ==================================================
    // VEHICLE
    // ==================================================

    const vehicles =
        await query(
            `
                SELECT
                    c.*

                FROM
                    cars c

                WHERE
                    c.car_id = ?

                LIMIT 1
            `,
            [
                carId
            ]
        );


    if (
        !vehicles ||
        vehicles.length === 0
    ) {

        return null;

    }


    const vehicle =
        vehicles[0];


    // ==================================================
    // OWNER
    // ==================================================

    let owner =
        null;


    if (
        vehicle.owner_id
    ) {

        const owners =
            await query(
                `
                    SELECT
                        o.*

                    FROM
                        owners o

                    WHERE
                        o.owner_id = ?

                    LIMIT 1
                `,
                [
                    vehicle.owner_id
                ]
            );


        owner =
            owners[0] ||
            null;

    }


    // ==================================================
    // INSPECTION REPORT
    // ==================================================

    const reports =
        await query(
            `
                SELECT
                    ir.*

                FROM
                    inspection_reports ir

                WHERE
                    ir.car_id = ?

                ORDER BY
                    ir.report_id DESC

                LIMIT 1
            `,
            [
                carId
            ]
        );


    const report =
        reports[0] ||
        null;


    // ==================================================
    // GET VEHICLE IMAGES
    // ==================================================
    //
    // IMPORTANT:
    // Image ka data cars table mein nahi,
    // car_images table mein hai.
    //
    // ==================================================

    const images =
        await query(
            `
                SELECT
                    image_id,
                    car_id,
                    image_type,
                    image_path,
                    is_primary,
                    created_at

                FROM
                    car_images

                WHERE
                    car_id = ?

                ORDER BY
                    is_primary DESC,
                    image_id ASC
            `,
            [
                carId
            ]
        );


    // ==================================================
    // DEFAULT DATA
    // ==================================================

    let inspection =
        null;

    let checklist =
        {};

    let checklistRows =
        [];

    let detailedInspection =
        null;


    // ==================================================
    // NO REPORT
    // ==================================================

    if (!report) {

        return {

            ...vehicle,

            vehicle,

            owner,

            inspection: null,

            checklist: {},

            inspection_checklist: [],

            detailedInspection: null,

            report: null,

            images,

            vehicle_images:
                images

        };

    }


    // ==================================================
    // INSPECTION
    // ==================================================

    let overallScore =
        Number(
            report.overall_score
        );


    /*
     * Frontend score 0-10 hai.
     *
     * Agar DB mein 100-point score
     * save hai to 10-point mein convert.
     */

    if (
        Number.isNaN(
            overallScore
        )
    ) {

        overallScore =
            0;

    } else {

        if (
            overallScore > 10
        ) {

            overallScore =
                overallScore / 10;

        }

    }


    inspection = {

        report_id:
            report.report_id,

        car_id:
            report.car_id,

        engine_remark:
            report.engine_remark ??
            null,

        overall_remark:
            report.overall_remark ??
            null,

        overall_score:
            overallScore,

        publish_status:
            report.publish_status ??
            null,

        pdf_path:
            report.pdf_path ??
            null,

        created_at:
            report.created_at ??
            null,

        customer_email_sent_at:
            report.customer_email_sent_at ??
            null,

        customer_whatsapp_sent_at:
            report.customer_whatsapp_sent_at ??
            null,

        admin_email_sent_at:
            report.admin_email_sent_at ??
            null

    };


    // ==================================================
    // DETAILED INSPECTION
    // ==================================================
    //
    // Existing optional DB columns automatically check.
    //
    // ==================================================

    const detailedColumn =
        await findExistingColumn(
            "inspection_reports",
            [
                "detailed_inspection",
                "detailedInspection",
                "detailed_inspection_json"
            ]
        );


    if (
        detailedColumn &&
        Object.prototype.hasOwnProperty.call(
            report,
            detailedColumn
        )
    ) {

        detailedInspection =
            parseJsonValue(
                report[
                    detailedColumn
                ],
                null
            );

    }


    // ==================================================
    // CHECKLIST
    // ==================================================
    //
    // IMPORTANT FIX:
    //
    // Purane code mein:
    //
    // ORDER BY id ASC
    //
    // tha.
    //
    // Tumhari DB mein id nahi hai.
    //
    // Actual column:
    // checklist_id
    //
    // ==================================================

    checklistRows =
        await query(
            `
                SELECT

                    checklist_id,
                    report_id,
                    category,
                    section,
                    item_name,
                    status,
                    selected_options,
                    remark,
                    created_at

                FROM
                    inspection_checklist

                WHERE
                    report_id = ?

                ORDER BY
                    checklist_id ASC
            `,
            [
                report.report_id
            ]
        );


    // ==================================================
    // CATEGORY MAP
    // ==================================================

    const categoryMap = {

        "Exterior":
            "exterior",

        "Interior & Electricals":
            "interior_electricals",

        "Engine Bay":
            "engine_bay",

        "Transmission System":
            "transmission_system",

        "Suspension & Steering":
            "suspension_steering",

        "Braking System":
            "braking_system",

        "Tires & Wheels":
            "tires_wheels",

        "Electricals & AC":
            "electricals_ac",

        "Documents & Title":
            "documents_title"

    };


    // ==================================================
    // CONVERT CHECKLIST TO FRONTEND STRUCTURE
    // ==================================================

    checklistRows.forEach(
        (row) => {

            const key =
                categoryMap[
                    row.category
                ] ||
                row.category;


            const item = {

                checklist_id:
                    row.checklist_id,

                report_id:
                    row.report_id,

                category:
                    row.category ??
                    "",

                section:
                    row.section ??
                    "",

                item_name:
                    row.item_name ??
                    "",

                status:
                    row.status ??
                    "",

                selected_options:
                    normalizeSelectedOptions(
                        row.selected_options
                    ),

                remark:
                    row.remark ??
                    "",

                created_at:
                    row.created_at ??
                    null

            };


            checklist[key] =
                item;

        }
    );


    // ==================================================
    // RETURN COMPLETE DATA
    // ======================================================

    return {

        // ------------------------------------------------
        // DIRECT VEHICLE DATA
        // ------------------------------------------------

        ...vehicle,


        // ------------------------------------------------
        // NESTED VEHICLE DATA
        // ------------------------------------------------

        vehicle,


        // ------------------------------------------------
        // OWNER
        // ------------------------------------------------

        owner,


        // ------------------------------------------------
        // INSPECTION
        // ------------------------------------------------

        inspection,


        // ------------------------------------------------
        // CHECKLIST OBJECT
        // ------------------------------------------------

        checklist,


        // ------------------------------------------------
        // CHECKLIST ARRAY
        // ------------------------------------------------

        inspection_checklist:
            checklistRows.map(
                (row) => ({

                    checklist_id:
                        row.checklist_id,

                    report_id:
                        row.report_id,

                    category:
                        row.category ??
                        "",

                    section:
                        row.section ??
                        "",

                    item_name:
                        row.item_name ??
                        "",

                    status:
                        row.status ??
                        "",

                    selected_options:
                        normalizeSelectedOptions(
                            row.selected_options
                        ),

                    remark:
                        row.remark ??
                        "",

                    created_at:
                        row.created_at ??
                        null

                })
            ),


        // ------------------------------------------------
        // DETAILED INSPECTION
        // ------------------------------------------------

        detailedInspection,


        // ------------------------------------------------
        // REPORT
        // ------------------------------------------------

        report,


        // ------------------------------------------------
        // IMAGES
        // ------------------------------------------------

        images,


        // ------------------------------------------------
        // ALTERNATE IMAGE NAME
        // ------------------------------------------------

        vehicle_images:
            images

    };

};


// ======================================================
// UPDATE VEHICLE
// ======================================================

const updateVehicle = async (
    carId,
    vehicle
) => {

    // ==================================================
    // STATUS
    // ==================================================

    const allowedStatuses = [

        "Draft",
        "Published",
        "Available",
        "Sold",
        "Inactive"

    ];


    const status =
        allowedStatuses.includes(
            vehicle.status
        )
            ? vehicle.status
            : "Draft";


    // ==================================================
    // PUBLISHED DATE
    // ==================================================

    const publishedAt =
        status === "Published"
            ? new Date()
            : null;


    // ==================================================
    // FIND OPTIONAL VEHICLE COLUMNS
    // ==================================================

    const variantShortNoteColumn =
        await findExistingColumn(
            "cars",
            [
                "variant_short_note"
            ]
        );


    const registrationRtoShortNoteColumn =
        await findExistingColumn(
            "cars",
            [
                "registration_rto_short_note"
            ]
        );


    // ==================================================
    // VEHICLE UPDATE
    // ==================================================

    const vehicleFields = [

        "brand",

        "model",

        "variant",

        "manufacturing_year",

        "price",

        "price_short_note",

        "odometer",

        "city",

        "transmission",

        "fuel_type",

        "owner_classification",

        "registration_number",

        "chassis_number",

        "engine_number",

        "inspection_date",

        "rto",

        "spare_key",

        "insurance_type",

        "insurance_validity",

        "vehicle_note",

        "status",

        "published_at"

    ];


    const vehicleValues = [

        vehicle.brand ??
            null,

        vehicle.model ??
            null,

        vehicle.variant ??
            null,

        vehicle.manufacturing_year ??
            vehicle.manufacturingYear ??
            null,

        vehicle.price ??
            null,

        vehicle.price_short_note ??
            vehicle.priceShortNote ??
            null,

        vehicle.odometer ??
            null,

        vehicle.city ??
            null,

        vehicle.transmission ??
            null,

        vehicle.fuel_type ??
            vehicle.fuelType ??
            null,

        vehicle.owner_classification ??
            vehicle.ownerClassification ??
            null,

        vehicle.registration_number ??
            vehicle.registrationNumber ??
            null,

        vehicle.chassis_number ??
            vehicle.chassisNumber ??
            null,

        vehicle.engine_number ??
            vehicle.engineNumber ??
            null,

        vehicle.inspection_date ??
            vehicle.inspectionDate ??
            null,

        vehicle.rto ??
            null,

        vehicle.spare_key ??
            vehicle.spareKey ??
            null,

        vehicle.insurance_type ??
            vehicle.insuranceType ??
            null,

        vehicle.insurance_validity ??
            vehicle.insuranceValidity ??
            null,

        vehicle.vehicle_note ??
            vehicle.vehicleNote ??
            null,

        status,

        publishedAt

    ];


    // ==================================================
    // OPTIONAL VEHICLE FIELDS
    // ==================================================

    if (
        variantShortNoteColumn
    ) {

        vehicleFields.splice(
            3,
            0,
            variantShortNoteColumn
        );


        vehicleValues.splice(
            3,
            0,
            vehicle.variant_short_note ??
                vehicle.variantShortNote ??
                null
        );

    }


    if (
        registrationRtoShortNoteColumn
    ) {

        const rtoIndex =
            vehicleFields.indexOf(
                "registration_number"
            ) + 1;


        vehicleFields.splice(
            rtoIndex,
            0,
            registrationRtoShortNoteColumn
        );


        vehicleValues.splice(
            rtoIndex,
            0,
            vehicle.registration_rto_short_note ??
                vehicle.registrationRtoShortNote ??
                null
        );

    }


    // ==================================================
    // BUILD VEHICLE SQL
    // ==================================================

    const vehicleSet =
        vehicleFields
            .map(
                field =>
                    `\`${field}\` = ?`
            )
            .join(",\n");


    const vehicleSql = `

        UPDATE cars

        SET
            ${vehicleSet}

        WHERE
            car_id = ?

    `;


    await query(
        vehicleSql,
        [
            ...vehicleValues,
            carId
        ]
    );


    // ==================================================
    // FIND OWNER ID
    // ==================================================

    const carRows =
        await query(
            `
                SELECT
                    owner_id

                FROM
                    cars

                WHERE
                    car_id = ?

                LIMIT 1
            `,
            [
                carId
            ]
        );


    const ownerId =
        carRows[0]?.owner_id ||
        null;


    // ==================================================
    // OWNER UPDATE
    // ==================================================

    if (
        ownerId
    ) {

        const ownerFields = [

            "owner_name",

            "mobile",

            "email",

            "address",

            "city",

            "state",

            "pincode",

            "pan_number"

        ];


        const ownerValues = [

            vehicle.customer_name ??
                vehicle.owner_name ??
                null,

            vehicle.owner_mobile ??
                vehicle.mobile ??
                null,

            vehicle.owner_email ??
                vehicle.email ??
                null,

            vehicle.owner_address ??
                vehicle.address ??
                null,

            vehicle.owner_city ??
                null,

            vehicle.owner_state ??
                null,

            vehicle.owner_pincode ??
                null,

            vehicle.pan_number ??
                null

        ];


        // ==================================================
        // OPTIONAL OWNER COLUMNS
        // ==================================================

        const alternateMobileColumn =
            await findExistingColumn(
                "owners",
                [
                    "alternate_mobile"
                ]
            );


        const aadharColumn =
            await findExistingColumn(
                "owners",
                [
                    "aadhar_number"
                ]
            );


        if (
            alternateMobileColumn
        ) {

            ownerFields.push(
                alternateMobileColumn
            );


            ownerValues.push(
                vehicle.alternate_mobile ??
                    null
            );

        }


        if (
            aadharColumn
        ) {

            ownerFields.push(
                aadharColumn
            );


            ownerValues.push(
                vehicle.aadhar_number ??
                    null
            );

        }


        // ==================================================
        // OWNER SQL
        // ==================================================

        const ownerSet =
            ownerFields
                .map(
                    field =>
                        `\`${field}\` = ?`
                )
                .join(",\n");


        await query(
            `
                UPDATE owners

                SET
                    ${ownerSet}

                WHERE
                    owner_id = ?
            `,
            [
                ...ownerValues,
                ownerId
            ]
        );

    }


    // ==================================================
    // FIND INSPECTION REPORT
    // ==================================================

    const reports =
        await query(
            `
                SELECT
                    report_id

                FROM
                    inspection_reports

                WHERE
                    car_id = ?

                ORDER BY
                    report_id DESC

                LIMIT 1
            `,
            [
                carId
            ]
        );


    // ==================================================
    // IF REPORT DOES NOT EXIST
    // ==================================================

    let reportId =
        null;


    if (
        reports &&
        reports.length > 0
    ) {

        reportId =
            reports[0].report_id;

    } else {

        // ==================================================
        // CREATE REPORT
        // ==================================================

        const reportResult =
            await query(
                `
                    INSERT INTO inspection_reports (

                        car_id,

                        overall_score,

                        engine_remark,

                        overall_remark,

                        publish_status

                    )

                    VALUES (
                        ?,
                        ?,
                        ?,
                        ?,
                        ?
                    )
                `,
                [

                    carId,

                    0,

                    vehicle.engine_remark ??
                        null,

                    vehicle.overall_remark ??
                        null,

                    status === "Published"
                        ? "Yes"
                        : "No"

                ]
            );


        reportId =
            reportResult.insertId;

    }


    // ==================================================
    // INSPECTION SCORE
    // ==================================================

    let score =
        Number(
            vehicle.overall_score ??
            vehicle.overallScore ??
            vehicle.inspection?.overall_score ??
            vehicle.inspection?.overallScore ??
            0
        );


    if (
        Number.isNaN(score)
    ) {

        score =
            0;

    }


    /*
     * Frontend score 0-10 hai.
     * DB 100-point value store karega.
     */

    let overallScore =
        score;


    if (
        score <= 10
    ) {

        overallScore =
            Math.round(
                score * 10
            );

    } else {

        overallScore =
            Math.round(
                score
            );

    }


    // ==================================================
    // FIND DETAILED INSPECTION COLUMN
    // ==================================================

    const detailedColumn =
        await findExistingColumn(
            "inspection_reports",
            [
                "detailed_inspection",
                "detailedInspection",
                "detailed_inspection_json"
            ]
        );


    // ==================================================
    // INSPECTION UPDATE
    // ==================================================

    const inspectionFields = [

        "overall_score",

        "engine_remark",

        "overall_remark",

        "publish_status"

    ];


    const inspectionValues = [

        overallScore,

        vehicle.engine_remark ??
            vehicle.engineRemark ??
            vehicle.inspection?.engine_remark ??
            null,

        vehicle.overall_remark ??
            vehicle.overallRemark ??
            vehicle.inspection?.overall_remark ??
            null,

        status === "Published"
            ? "Yes"
            : "No"

    ];


    // ==================================================
    // DETAILED INSPECTION UPDATE
    // ==================================================

    if (
        detailedColumn &&
        vehicle.detailedInspection !==
            undefined
    ) {

        inspectionFields.push(
            detailedColumn
        );


        inspectionValues.push(
            JSON.stringify(
                vehicle.detailedInspection ??
                {}
            )
        );

    }


    // ==================================================
    // BUILD INSPECTION SQL
    // ==================================================

    const inspectionSet =
        inspectionFields
            .map(
                field =>
                    `\`${field}\` = ?`
            )
            .join(",\n");


    await query(
        `
            UPDATE inspection_reports

            SET
                ${inspectionSet}

            WHERE
                report_id = ?
        `,
        [
            ...inspectionValues,
            reportId
        ]
    );


    // ==================================================
    // CHECKLIST
    // ==================================================

    let checklist =
        vehicle.inspection_checklist ??
        vehicle.inspectionChecklist ??
        vehicle.checklist ??
        null;


    // ==================================================
    // CONVERT CHECKLIST ARRAY TO OBJECT
    // ==================================================

    if (
        Array.isArray(checklist)
    ) {

        const checklistObject =
            {};


        checklist.forEach(
            item => {

                const category =
                    item.category ??
                    "";


                const key =
                    category
                        .toLowerCase()
                        .replace(
                            /&/g,
                            "and"
                        )
                        .replace(
                            /[^a-z0-9]+/g,
                            "_"
                        )
                        .replace(
                            /^_+|_+$/g,
                            ""
                        );


                checklistObject[key] =
                    item;

            }
        );


        checklist =
            checklistObject;

    }


    // ==================================================
    // CHECKLIST SAVE
    // ==================================================

    if (
        checklist &&
        typeof checklist ===
            "object"
    ) {

        // ==================================================
        // CATEGORY MAP
        // ==================================================

        const categoryMap = {

            exterior:
                "Exterior",

            interior_electricals:
                "Interior & Electricals",

            engine_bay:
                "Engine Bay",

            transmission_system:
                "Transmission System",

            suspension_steering:
                "Suspension & Steering",

            braking_system:
                "Braking System",

            tires_wheels:
                "Tires & Wheels",

            electricals_ac:
                "Electricals & AC",

            documents_title:
                "Documents & Title"

        };


        // ==================================================
        // DELETE OLD CHECKLIST
        // ==================================================

        await query(
            `
                DELETE FROM
                    inspection_checklist

                WHERE
                    report_id = ?
            `,
            [
                reportId
            ]
        );


        // ==================================================
        // PREPARE NEW CHECKLIST
        // ==================================================

        const rows =
            [];


        Object.keys(
            categoryMap
        ).forEach(
            key => {

                const item =
                    checklist[key] ||
                    {};


                // ------------------------------------------
                // SELECTED OPTIONS
                // ------------------------------------------

                let selectedOptions =
                    item.selected_options ??
                    item.selectedOptions ??
                    [];


                if (
                    typeof selectedOptions !==
                    "string"
                ) {

                    selectedOptions =
                        JSON.stringify(
                            selectedOptions
                        );

                }


                // ------------------------------------------
                // VALUES
                // ------------------------------------------

                rows.push([

                    reportId,

                    categoryMap[key],

                    item.section ??
                        "",

                    item.item_name ??
                        item.itemName ??
                        "",

                    item.status ??
                        "",

                    selectedOptions,

                    item.remark ??
                        ""

                ]);

            }
        );


        // ==================================================
        // INSERT CHECKLIST
        // ==================================================

        if (
            rows.length > 0
        ) {

            await query(
                `
                    INSERT INTO
                        inspection_checklist
                    (
                        report_id,
                        category,
                        section,
                        item_name,
                        status,
                        selected_options,
                        remark
                    )

                    VALUES ?
                `,
                [
                    rows
                ]
            );

        }

    }


    // ==================================================
    // FINAL RESPONSE
    // ==================================================

    return {

        carId,

        reportId,

        message:
            "Vehicle, owner, inspection, checklist, images and detailed inspection updated successfully.",

        detailedInspectionSaved:
            !!(
                detailedColumn &&
                vehicle.detailedInspection !==
                    undefined
            ),

        checklistSaved:
            !!(
                checklist &&
                typeof checklist ===
                    "object"
            )

    };

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    getVehicleById,

    updateVehicle

};