const db = require("../config/db");

// ======================================================
// UNIVERSAL DATABASE QUERY HELPER
// ======================================================

const executeQuery = async (
    sql,
    params = []
) => {

    // ==================================================
    // MYSQL2 PROMISE POOL
    // ==================================================

    if (
        db &&
        typeof db.promise === "function"
    ) {

        const promiseDb =
            db.promise();

        const result =
            await promiseDb.execute(
                sql,
                params
            );

        return Array.isArray(result)
            ? result[0]
            : result;

    }

    // ==================================================
    // MYSQL2/PROMISE CONNECTION / POOL
    // ==================================================

    if (
        db &&
        typeof db.execute === "function"
    ) {

        const result =
            await db.execute(
                sql,
                params
            );

        return Array.isArray(result)
            ? result[0]
            : result;

    }

    // ==================================================
    // MYSQL2 CALLBACK STYLE
    // ==================================================

    if (
        db &&
        typeof db.query === "function"
    ) {

        return new Promise(
            (
                resolve,
                reject
            ) => {

                db.query(
                    sql,
                    params,
                    (
                        error,
                        result
                    ) => {

                        if (error) {

                            console.error(
                                "Database Query Error:",
                                error.message
                            );

                            return reject(
                                error
                            );

                        }

                        resolve(
                            result
                        );

                    }
                );

            }
        );

    }

    throw new Error(
        "Database connection is not configured correctly."
    );

};


// ======================================================
// GET TABLE COLUMNS
// ======================================================

const getTableColumns = async (
    tableName
) => {

    try {

        const rows =
            await executeQuery(

                `
                SELECT
                    COLUMN_NAME

                FROM
                    INFORMATION_SCHEMA.COLUMNS

                WHERE
                    TABLE_SCHEMA = DATABASE()

                    AND TABLE_NAME = ?
                `,

                [
                    tableName
                ]

            );

        return Array.isArray(rows)
            ? rows.map(
                row =>
                    row.COLUMN_NAME
            )
            : [];

    } catch (error) {

        console.error(
            `Get ${tableName} Columns Error:`,
            error.message
        );

        return [];

    }

};


// ======================================================
// GET CARS TABLE COLUMNS
// ======================================================

const getCarsColumns = async () => {

    return await getTableColumns(
        "cars"
    );

};

// ======================================================
// GET OWNERS TABLE COLUMNS
// ======================================================

const getOwnersColumns = async () => {

    return await getTableColumns(
        "owners"
    );

};


// ======================================================
// GET INSPECTION REPORT COLUMNS
// ======================================================

const getInspectionReportColumns =
    async () => {

        return await getTableColumns(
            "inspection_reports"
        );

    };


// ======================================================
// GET CHECKLIST COLUMNS
// ======================================================

const getChecklistColumns =
    async () => {

        return await getTableColumns(
            "inspection_checklist"
        );

    };


// ======================================================
// GET CAR IMAGES COLUMNS
// ======================================================

const getCarImagesColumns =
    async () => {

        return await getTableColumns(
            "car_images"
        );

    };


// ======================================================
// PICK VALUE
// ======================================================

const pickValue = (
    object,
    keys
) => {

    if (
        !object ||
        typeof object !== "object"
    ) {

        return undefined;

    }

    for (
        const key of keys
    ) {

        if (
            object[key] !== undefined &&
            object[key] !== null &&
            object[key] !== ""
        ) {

            return object[key];

        }

    }

    return undefined;

};


// ======================================================
// BUILD CARS DATA
// ======================================================

const buildCarsData = async (
    vehicle
) => {

    const columns =
        await getCarsColumns();

    const data = {};


    // ==================================================
    // POSSIBLE DATABASE FIELDS
    // ==================================================

    const possibleFields = {

        brand: [
            "brand"
        ],

        model: [
            "model"
        ],

        variant: [
            "variant"
        ],

        manufacturing_year: [
            "manufacturing_year",
            "manufacturingYear",
            "year"
        ],

        price: [
            "price"
        ],

        price_short_note: [
            "price_short_note",
            "priceShortNote"
        ],

        odometer: [
            "odometer",
            "kmDriven",
            "kms",
            "kilometers"
        ],

        city: [
            "city"
        ],

        transmission: [
            "transmission"
        ],

        fuel_type: [
            "fuel_type",
            "fuelType"
        ],

        owner_classification: [
            "owner_classification",
            "ownerClassification"
        ],

        registration_number: [
            "registration_number",
            "registrationNumber"
        ],

        chassis_number: [
            "chassis_number",
            "chassisNumber"
        ],

        engine_number: [
            "engine_number",
            "engineNumber"
        ],

        inspection_date: [
            "inspection_date",
            "inspectionDate"
        ],

        rto: [
            "rto"
        ],

        spare_key: [
            "spare_key",
            "spareKey"
        ],

        insurance_type: [
            "insurance_type",
            "insuranceType"
        ],

        insurance_validity: [
            "insurance_validity",
            "insuranceValidity"
        ],

        variant_short_note: [
            "variant_short_note",
            "variantShortNote"
        ],

        registration_rto_short_note: [
            "registration_rto_short_note",
            "registrationRtoShortNote",
            "registration_rto_note"
        ],

        vehicle_note: [
            "vehicle_note",
            "vehicleNote",
            "notes",
            "note"
        ],

        status: [
            "status"
        ],

        published_at: [
            "published_at",
            "publishedAt"
        ],

        owner_id: [
            "owner_id",
            "ownerId"
        ],

        // ==================================================
        // OWNER / CUSTOMER DETAILS - FIX
        // ==================================================

        customer_name: [
            "customer_name",
            "customerName",
            "owner_name",
            "ownerName",
            "name",
            "full_name",
            "fullName"
        ],

        owner_name: [
            "owner_name",
            "ownerName",
            "customer_name",
            "customerName",
            "name",
            "full_name",
            "fullName"
        ],

        owner_mobile: [
            "owner_mobile",
            "ownerMobile",
            "customer_mobile",
            "customerMobile",
            "mobile",
            "phone",
            "phone_number",
            "phoneNumber"
        ],

        owner_email: [
            "owner_email",
            "ownerEmail",
            "customer_email",
            "customerEmail",
            "email"
        ],

        owner_address: [
            "owner_address",
            "ownerAddress",
            "customer_address",
            "customerAddress",
            "address",
            "full_address",
            "fullAddress"
        ]

    };


    // ==================================================
    // SOURCE - FIX
    // ==================================================

    const source =
        vehicle &&
        vehicle.vehicle &&
        typeof vehicle.vehicle === "object"

            ? {
                ...vehicle,
                ...vehicle.vehicle,

                ...(vehicle.owner &&
                typeof vehicle.owner === "object"
                    ? vehicle.owner
                    : {})
            }

            : {
                ...(vehicle || {}),

                ...(vehicle?.owner &&
                typeof vehicle.owner === "object"
                    ? vehicle.owner
                    : {})
            };


    // ==================================================
    // MAP DATABASE COLUMNS
    // ==================================================

    for (
        const [
            column,
            keys
        ]
        of Object.entries(
            possibleFields
        )
    ) {

        if (
            columns.includes(
                column
            )
        ) {

            const value =
                pickValue(
                    source,
                    keys
                );

            if (
                value !== undefined
            ) {

                data[column] =
                    value;

            }

        }

    }


    // ==================================================
    // DEFAULT STATUS
    // ==================================================

    if (
        columns.includes("status") &&
        data.status === undefined
    ) {

        data.status =
            pickValue(
                source,
                [
                    "status"
                ]
            ) ||
            "Draft";

    }


    return data;

};


// ======================================================
// ADD VEHICLE
// ======================================================

const addVehicle = async (
    vehicle
) => {

    if (
        !vehicle ||
        typeof vehicle !== "object"
    ) {

        throw new Error(
            "Vehicle data is required."
        );

    }


    // ==================================================
    // BUILD CAR DATA
    // ==================================================

    const carsData =
        await buildCarsData(
            vehicle
        );


    if (
        Object.keys(
            carsData
        ).length === 0
    ) {

        throw new Error(
            "No valid vehicle fields were provided."
        );

    }


    // ==================================================
    // INSERT CAR
    // ==================================================

    const carColumns =
        Object.keys(
            carsData
        );

    const placeholders =
        carColumns
            .map(
                () => "?"
            )
            .join(", ");

    const values =
        carColumns.map(
            column =>
                carsData[column]
        );


    const result =
        await executeQuery(

            `
            INSERT INTO cars
            (
                ${carColumns.join(", ")}
            )

            VALUES
            (
                ${placeholders}
            )
            `,

            values

        );


    const vehicleId =
        result.insertId;


    if (!vehicleId) {

        throw new Error(
            "Vehicle ID was not generated."
        );

    }


    // ==================================================
    // SAVE OWNER / CUSTOMER DATA
    // ==================================================
    //
    // The Add Vehicle form sends customer/owner fields along
    // with the vehicle payload. Some installations keep those
    // fields in the owners table and only store owner_id in cars.
    // Save them here and link the new owner back to the car.
    // Nothing is removed from the existing cars insert flow.
    //

    try {

        const ownerColumns =
            await getOwnersColumns();

        if (ownerColumns.length > 0) {

            const ownerSource =
                vehicle.owner &&
                typeof vehicle.owner === "object"
                    ? {
                        ...vehicle,
                        ...vehicle.owner
                    }
                    : {
                        ...vehicle
                    };

            const ownerFieldMap = {

                name: [
                    "customer_name",
                    "customerName",
                    "owner_name",
                    "ownerName",
                    "name",
                    "full_name",
                    "fullName"
                ],

                owner_name: [
                    "owner_name",
                    "ownerName",
                    "customer_name",
                    "customerName",
                    "name",
                    "full_name",
                    "fullName"
                ],

                customer_name: [
                    "customer_name",
                    "customerName",
                    "owner_name",
                    "ownerName",
                    "name",
                    "full_name",
                    "fullName"
                ],

                mobile: [
                    "owner_mobile",
                    "ownerMobile",
                    "customer_mobile",
                    "customerMobile",
                    "mobile",
                    "phone",
                    "phone_number",
                    "phoneNumber"
                ],

                owner_mobile: [
                    "owner_mobile",
                    "ownerMobile",
                    "customer_mobile",
                    "customerMobile",
                    "mobile",
                    "phone",
                    "phone_number",
                    "phoneNumber"
                ],

                customer_mobile: [
                    "customer_mobile",
                    "customerMobile",
                    "owner_mobile",
                    "ownerMobile",
                    "mobile",
                    "phone",
                    "phone_number",
                    "phoneNumber"
                ],

                email: [
                    "owner_email",
                    "ownerEmail",
                    "customer_email",
                    "customerEmail",
                    "email"
                ],

                owner_email: [
                    "owner_email",
                    "ownerEmail",
                    "customer_email",
                    "customerEmail",
                    "email"
                ],

                customer_email: [
                    "customer_email",
                    "customerEmail",
                    "owner_email",
                    "ownerEmail",
                    "email"
                ],

                address: [
                    "owner_address",
                    "ownerAddress",
                    "customer_address",
                    "customerAddress",
                    "address",
                    "full_address",
                    "fullAddress"
                ],

                owner_address: [
                    "owner_address",
                    "ownerAddress",
                    "customer_address",
                    "customerAddress",
                    "address",
                    "full_address",
                    "fullAddress"
                ],

                customer_address: [
                    "customer_address",
                    "customerAddress",
                    "owner_address",
                    "ownerAddress",
                    "address",
                    "full_address",
                    "fullAddress"
                ],

                alternate_mobile: [
                    "alternate_mobile",
                    "alternateMobile"
                ],

                owner_city: [
                    "owner_city",
                    "ownerCity"
                ],

                owner_state: [
                    "owner_state",
                    "ownerState"
                ],

                owner_pincode: [
                    "owner_pincode",
                    "ownerPincode",
                    "pincode",
                    "pin_code"
                ],

                aadhar_number: [
                    "aadhar_number",
                    "aadharNumber",
                    "aadhaar_number",
                    "aadhaarNumber"
                ],

                pan_number: [
                    "pan_number",
                    "panNumber"
                ]

            };

            const ownerData = {};

            for (const [column, keys] of Object.entries(ownerFieldMap)) {

                if (!ownerColumns.includes(column)) {
                    continue;
                }

                const value =
                    pickValue(ownerSource, keys);

                if (value !== undefined) {
                    ownerData[column] = value;
                }

            }

            if (Object.keys(ownerData).length > 0) {

                const ownerKeys =
                    Object.keys(ownerData);

                const ownerPlaceholders =
                    ownerKeys.map(() => "?").join(", ");

                const ownerResult =
                    await executeQuery(
                        `
                        INSERT INTO owners
                        (
                            ${ownerKeys.join(", ")}
                        )
                        VALUES
                        (
                            ${ownerPlaceholders}
                        )
                        `,
                        ownerKeys.map(
                            key => ownerData[key]
                        )
                    );

                const ownerId =
                    ownerResult && ownerResult.insertId;

                if (ownerId &&
                    (await getCarsColumns()).includes("owner_id")) {

                    await executeQuery(
                        `
                        UPDATE cars
                        SET owner_id = ?
                        WHERE car_id = ?
                        LIMIT 1
                        `,
                        [
                            ownerId,
                            vehicleId
                        ]
                    );

                }

            }

        }

    } catch (ownerSaveError) {

        // Owner persistence must not destroy the existing vehicle
        // creation flow. Customer fields are also copied to any
        // compatible cars/report columns below.
        console.error(
            "Owner Save Warning:",
            ownerSaveError.message
        );

    }


    // ==================================================
    // INSPECTION DATA
    // ==================================================

    const inspectionSource =
        vehicle.inspection &&
        typeof vehicle.inspection === "object"

            ? {
                ...vehicle,
                ...vehicle.inspection
            }

            : vehicle;


    const overallScore =
        pickValue(
            inspectionSource,
            [
                "overall_score",
                "overallScore"
            ]
        );


    const engineRemark =
        pickValue(
            inspectionSource,
            [
                "engine_remark",
                "engineRemark"
            ]
        );


    const overallRemark =
        pickValue(
            inspectionSource,
            [
                "overall_remark",
                "overallRemark"
            ]
        );


    // ==================================================
    // CREATE INSPECTION REPORT
    // ==================================================

    let reportId =
        null;


    const reportColumns =
        await getInspectionReportColumns();


    if (
        reportColumns.length > 0
    ) {

        const reportData =
            {};


        // ==================================================
        // COPY COMPLETE ADD-VEHICLE DATA TO REPORT TABLE
        // ==================================================
        // Only columns that actually exist in the database are
        // written, so this remains compatible with old schemas.

        const reportFieldMap = {

            customer_name: ["customer_name", "customerName"],
            owner_name: ["owner_name", "ownerName", "customer_name", "customerName"],
            owner_mobile: ["owner_mobile", "ownerMobile", "customer_mobile", "customerMobile"],
            customer_mobile: ["customer_mobile", "customerMobile", "owner_mobile", "ownerMobile"],
            alternate_mobile: ["alternate_mobile", "alternateMobile"],
            owner_email: ["owner_email", "ownerEmail", "customer_email", "customerEmail"],
            customer_email: ["customer_email", "customerEmail", "owner_email", "ownerEmail"],
            owner_address: ["owner_address", "ownerAddress", "customer_address", "customerAddress"],
            customer_address: ["customer_address", "customerAddress", "owner_address", "ownerAddress"],
            owner_city: ["owner_city", "ownerCity"],
            owner_state: ["owner_state", "ownerState"],
            owner_pincode: ["owner_pincode", "ownerPincode"],
            aadhar_number: ["aadhar_number", "aadharNumber", "aadhaar_number", "aadhaarNumber"],
            pan_number: ["pan_number", "panNumber"],
            variant_short_note: ["variant_short_note", "variantShortNote"],
            registration_rto_short_note: ["registration_rto_short_note", "registrationRtoShortNote", "registration_rto_note"],
            price_short_note: ["price_short_note", "priceShortNote"],
            vehicle_note: ["vehicle_note", "vehicleNote", "notes", "note"]

        };

        for (const [column, keys] of Object.entries(reportFieldMap)) {

            if (!reportColumns.includes(column)) {
                continue;
            }

            const value =
                pickValue(vehicle, keys);

            if (value !== undefined) {
                reportData[column] = value;
            }

        }


        if (
            reportColumns.includes(
                "car_id"
            )
        ) {

            reportData.car_id =
                vehicleId;

        }


        if (
            reportColumns.includes(
                "overall_score"
            )
        ) {

            reportData.overall_score =
                overallScore !== undefined
                    ? overallScore
                    : 0;

        }


        if (
            reportColumns.includes(
                "engine_remark"
            )
        ) {

            reportData.engine_remark =
                engineRemark !== undefined
                    ? engineRemark
                    : "Not provided.";

        }


        if (
            reportColumns.includes(
                "overall_remark"
            )
        ) {

            reportData.overall_remark =
                overallRemark !== undefined
                    ? overallRemark
                    : "Vehicle inspection completed.";

        }


        if (
            reportColumns.includes(
                "pdf_path"
            )
        ) {

            reportData.pdf_path =
                null;

        }


        if (
            reportColumns.includes(
                "publish_status"
            )
        ) {

            reportData.publish_status =
                "No";

        }


        const keys =
            Object.keys(
                reportData
            );


        if (
            keys.length > 0
        ) {

            const reportPlaceholders =
                keys
                    .map(
                        () => "?"
                    )
                    .join(", ");


            const reportResult =
                await executeQuery(

                    `
                    INSERT INTO inspection_reports
                    (
                        ${keys.join(", ")}
                    )

                    VALUES
                    (
                        ${reportPlaceholders}
                    )
                    `,

                    keys.map(
                        key =>
                            reportData[key]
                    )

                );


            reportId =
                reportResult.insertId;

        }

    }


    // ==================================================
    // SAVE CHECKLIST - FIX
    // ==================================================

    let checklist = null;


    if (
        vehicle.checklist &&
        typeof vehicle.checklist === "object"
    ) {

        checklist =
            vehicle.checklist;

    }
    else if (
        vehicle.inspection_checklist &&
        typeof vehicle.inspection_checklist === "object"
    ) {

        checklist =
            vehicle.inspection_checklist;

    }
    else if (
        vehicle.inspectionChecklist &&
        typeof vehicle.inspectionChecklist === "object"
    ) {

        checklist =
            vehicle.inspectionChecklist;

    }
    else if (
        vehicle.detailedInspection &&
        typeof vehicle.detailedInspection === "object"
    ) {

        checklist =
            vehicle.detailedInspection;

    }


    if (
        checklist
    ) {

        try {

            const checklistColumns =
                await getChecklistColumns();


            if (
                checklistColumns.length > 0
            ) {

                const checklistData =
                    {};


                // ==================================================
                // REPORT ID
                // ==================================================

                if (
                    checklistColumns.includes(
                        "report_id"
                    ) &&
                    reportId
                ) {

                    checklistData.report_id =
                        reportId;

                }


                // ==================================================
                // CAR ID
                // ==================================================

                if (
                    checklistColumns.includes(
                        "car_id"
                    )
                ) {

                    checklistData.car_id =
                        vehicleId;

                }


                // ==================================================
                // CHECKLIST JSON
                // ==================================================

                if (
                    checklistColumns.includes(
                        "checklist_data"
                    )
                ) {

                    checklistData.checklist_data =
                        JSON.stringify(
                            checklist
                        );

                }


                if (
                    checklistColumns.includes(
                        "data"
                    )
                ) {

                    checklistData.data =
                        JSON.stringify(
                            checklist
                        );

                }


                if (
                    checklistColumns.includes(
                        "inspection_data"
                    )
                ) {

                    checklistData.inspection_data =
                        JSON.stringify(
                            checklist
                        );

                }


                const keys =
                    Object.keys(
                        checklistData
                    );


                if (
                    keys.length > 0
                ) {

                    const placeholders =
                        keys
                            .map(
                                () => "?"
                            )
                            .join(", ");


                    await executeQuery(

                        `
                        INSERT INTO inspection_checklist
                        (
                            ${keys.join(", ")}
                        )

                        VALUES
                        (
                            ${placeholders}
                        )
                        `,

                        keys.map(
                            key =>
                                checklistData[key]
                        )

                    );

                }

            }


        } catch (
            checklistError
        ) {

            console.error(
                "Checklist Save Warning:",
                checklistError.message
            );

        }

    }


    // ==================================================
    // FINAL RESULT
    // ==================================================

    return {

        vehicleId,

        carId:
            vehicleId,

        reportId,

        pdfGenerated:
            false,

        message:
            "Vehicle and inspection report saved successfully."

    };

};
// ======================================================
// GET ALL ADMIN VEHICLES
// ======================================================

const getAllAdminVehicles =
    async () => {

        const rows =
            await executeQuery(

                `
                SELECT
                    c.*

                FROM
                    cars c

                ORDER BY
                    c.car_id DESC
                `

            );


        return Array.isArray(rows)
            ? rows
            : [];

    };


// ======================================================
// GET PUBLISHED VEHICLES
// ======================================================

const getPublishedVehicles =
    async (
        filters = {}
    ) => {

        let sql = `

            SELECT
                c.*

            FROM
                cars c

            LEFT JOIN
                inspection_reports ir

                ON ir.report_id = (

                    SELECT
                        MAX(ir2.report_id)

                    FROM
                        inspection_reports ir2

                    WHERE
                        ir2.car_id =
                            c.car_id

                )

            WHERE
                (
                    LOWER(
                        COALESCE(
                            c.status,
                            ''
                        )
                    ) IN (
                        'yes',
                        'published',
                        'publish',
                        'active',
                        'available'
                    )

                    OR

                    LOWER(
                        COALESCE(
                            ir.publish_status,
                            ''
                        )
                    ) IN (
                        'yes',
                        'published',
                        'publish',
                        'active'
                    )
                )

        `;


        const params = [];


        // ==================================================
        // BRAND
        // ==================================================

        if (
            filters.brand
        ) {

            sql += `

                AND LOWER(
                    COALESCE(
                        c.brand,
                        ''
                    )
                )
                LIKE ?

            `;


            params.push(
                `%${String(
                    filters.brand
                ).toLowerCase()}%`
            );

        }


        // ==================================================
        // MODEL
        // ==================================================

        if (
            filters.model
        ) {

            sql += `

                AND LOWER(
                    COALESCE(
                        c.model,
                        ''
                    )
                )
                LIKE ?

            `;


            params.push(
                `%${String(
                    filters.model
                ).toLowerCase()}%`
            );

        }


        // ==================================================
        // CITY
        // ==================================================

        if (
            filters.city
        ) {

            sql += `

                AND LOWER(
                    COALESCE(
                        c.city,
                        ''
                    )
                )
                LIKE ?

            `;


            params.push(
                `%${String(
                    filters.city
                ).toLowerCase()}%`
            );

        }


        // ==================================================
        // FUEL
        // ==================================================

        if (
            filters.fuel_type ||
            filters.fuelType
        ) {

            const fuel =
                filters.fuel_type ||
                filters.fuelType;


            sql += `

                AND LOWER(
                    COALESCE(
                        c.fuel_type,
                        ''
                    )
                ) = ?

            `;


            params.push(
                String(
                    fuel
                ).toLowerCase()
            );

        }


        // ==================================================
        // TRANSMISSION
        // ==================================================

        if (
            filters.transmission
        ) {

            sql += `

                AND LOWER(
                    COALESCE(
                        c.transmission,
                        ''
                    )
                ) = ?

            `;


            params.push(
                String(
                    filters.transmission
                ).toLowerCase()
            );

        }


        // ==================================================
        // MIN PRICE
        // ==================================================

        if (
            filters.minPrice !== undefined &&
            filters.minPrice !== ""
        ) {

            const minPrice =
                Number(
                    filters.minPrice
                );


            if (
                Number.isFinite(
                    minPrice
                )
            ) {

                sql += `

                    AND c.price >= ?

                `;


                params.push(
                    minPrice
                );

            }

        }


        // ==================================================
        // MAX PRICE
        // ==================================================

        if (
            filters.maxPrice !== undefined &&
            filters.maxPrice !== ""
        ) {

            const maxPrice =
                Number(
                    filters.maxPrice
                );


            if (
                Number.isFinite(
                    maxPrice
                )
            ) {

                sql += `

                    AND c.price <= ?

                `;


                params.push(
                    maxPrice
                );

            }

        }


        // ==================================================
        // SEARCH
        // ==================================================

        if (
            filters.search
        ) {

            sql += `

                AND (

                    LOWER(
                        COALESCE(
                            c.brand,
                            ''
                        )
                    )
                    LIKE ?

                    OR

                    LOWER(
                        COALESCE(
                            c.model,
                            ''
                        )
                    )
                    LIKE ?

                    OR

                    LOWER(
                        COALESCE(
                            c.variant,
                            ''
                        )
                    )
                    LIKE ?

                    OR

                    LOWER(
                        COALESCE(
                            c.city,
                            ''
                        )
                    )
                    LIKE ?

                    OR

                    LOWER(
                        COALESCE(
                            c.transmission,
                            ''
                        )
                    )
                    LIKE ?

                )

            `;


            const search =
                `%${String(
                    filters.search
                ).toLowerCase()}%`;


            params.push(
                search,
                search,
                search,
                search,
                search
            );

        }


        // ==================================================
        // ORDER
        // ==================================================

        sql += `

            ORDER BY
                c.car_id DESC

        `;


        console.log(
            "========================================"
        );

        console.log(
            "GET PUBLISHED VEHICLES"
        );

        console.log(
            "SQL PARAMS:",
            params
        );

        console.log(
            "========================================"
        );


        const rows =
            await executeQuery(
                sql,
                params
            );


        console.log(
            "Published Vehicles Found:",
            Array.isArray(rows)
                ? rows.length
                : 0
        );


        return Array.isArray(rows)
            ? rows
            : [];

    };


// ======================================================
// DELETE VEHICLE
// ADMIN
// ======================================================
//
// Deletes vehicle and its related database records.
//
// Delete order:
//
// 1. inspection_checklist
// 2. inspection_reports
// 3. car_images
// 4. cars
//
// ======================================================

const deleteVehicle = async (
    vehicleId
) => {

    // ==================================================
    // CONVERT VEHICLE ID TO NUMBER
    // ==================================================

    const numericVehicleId =
        Number(vehicleId);


    // ==================================================
    // VALIDATE VEHICLE ID
    // ==================================================

    if (
        !Number.isInteger(
            numericVehicleId
        ) ||
        numericVehicleId <= 0
    ) {

        throw new Error(
            "Valid vehicle ID is required."
        );

    }


    // ==================================================
    // CHECK VEHICLE EXISTS
    // ==================================================

    const vehicleRows =
        await executeQuery(

            `
            SELECT
                *
            FROM
                cars
            WHERE
                car_id = ?
            LIMIT 1
            `,

            [
                numericVehicleId
            ]

        );


    if (
        !Array.isArray(
            vehicleRows
        ) ||
        vehicleRows.length === 0
    ) {

        return {

            deleted:
                false,

            vehicleId:
                numericVehicleId,

            message:
                "Vehicle not found."

        };

    }


    // ==================================================
    // GET INSPECTION REPORT IDS
    // ==================================================

    let reportIds = [];


    try {

        const reportColumns =
            await getInspectionReportColumns();


        if (
            reportColumns.includes(
                "car_id"
            ) &&
            reportColumns.includes(
                "report_id"
            )
        ) {

            const reports =
                await executeQuery(

                    `
                    SELECT
                        report_id
                    FROM
                        inspection_reports
                    WHERE
                        car_id = ?
                    `,

                    [
                        numericVehicleId
                    ]

                );


            if (
                Array.isArray(
                    reports
                )
            ) {

                reportIds =
                    reports
                        .map(
                            report =>
                                report.report_id
                        )
                        .filter(
                            id =>
                                id !== null &&
                                id !== undefined
                        );

            }

        }

    }
    catch (
        reportFetchError
    ) {

        console.error(

            "Delete Vehicle - Report ID Fetch Error:",

            reportFetchError.message

        );

    }


    // ==================================================
    // DELETE INSPECTION CHECKLIST
    // ==================================================

    try {

        const checklistColumns =
            await getChecklistColumns();


        // ------------------------------------------------
        // DELETE USING REPORT ID
        // ------------------------------------------------

        if (
            checklistColumns.includes(
                "report_id"
            ) &&
            reportIds.length > 0
        ) {

            for (
                const reportId
                of reportIds
            ) {

                await executeQuery(

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

            }

        }


        // ------------------------------------------------
        // FALLBACK: DELETE USING CAR ID
        // ------------------------------------------------

        if (
            checklistColumns.includes(
                "car_id"
            )
        ) {

            await executeQuery(

                `
                DELETE FROM
                    inspection_checklist
                WHERE
                    car_id = ?
                `,

                [
                    numericVehicleId
                ]

            );

        }

    }
    catch (
        checklistDeleteError
    ) {

        console.error(

            "Delete Vehicle - Checklist Delete Error:",

            checklistDeleteError.message

        );

        throw checklistDeleteError;

    }


    // ==================================================
    // DELETE INSPECTION REPORTS
    // ==================================================

    try {

        const reportColumns =
            await getInspectionReportColumns();


        if (
            reportColumns.includes(
                "car_id"
            )
        ) {

            await executeQuery(

                `
                DELETE FROM
                    inspection_reports
                WHERE
                    car_id = ?
                `,

                [
                    numericVehicleId
                ]

            );

        }

    }
    catch (
        reportDeleteError
    ) {

        console.error(

            "Delete Vehicle - Inspection Report Delete Error:",

            reportDeleteError.message

        );

        throw reportDeleteError;

    }


    // ==================================================
    // DELETE CAR IMAGES
    // ==================================================

    try {

        const imageColumns =
            await getCarImagesColumns();


        if (
            imageColumns.includes(
                "car_id"
            )
        ) {

            await executeQuery(

                `
                DELETE FROM
                    car_images
                WHERE
                    car_id = ?
                `,

                [
                    numericVehicleId
                ]

            );

        }

    }
    catch (
        imageDeleteError
    ) {

        console.error(

            "Delete Vehicle - Image Delete Error:",

            imageDeleteError.message

        );

        throw imageDeleteError;

    }


    // ==================================================
    // DELETE VEHICLE
    // ==================================================

    await executeQuery(

        `
        DELETE FROM
            cars
        WHERE
            car_id = ?
        `,

        [
            numericVehicleId
        ]

    );


    // ==================================================
    // FINAL RESPONSE
    // ==================================================

    return {

        deleted:
            true,

        vehicleId:
            numericVehicleId,

        message:
            "Vehicle and all related records deleted successfully."

    };

};


// ======================================================
// GET VEHICLE IMAGES
// ======================================================

const getVehicleImages = async (
    carId
) => {

    const numericId =
        Number(carId);


    if (
        !Number.isInteger(
            numericId
        ) ||
        numericId <= 0
    ) {

        return [];

    }


    try {

        const columns =
            await getCarImagesColumns();


        if (
            !columns.includes(
                "car_id"
            )
        ) {

            return [];

        }


        const rows =
            await executeQuery(

                `
                SELECT
                    *
                FROM
                    car_images
                WHERE
                    car_id = ?
                ORDER BY
                    image_id ASC
                `,

                [
                    numericId
                ]

            );


        if (
            !Array.isArray(
                rows
            )
        ) {

            return [];

        }


        return rows.map(
            row => {

                return {

                    ...row,

                    url:
                        row.url ||
                        row.image_url ||
                        row.path ||
                        row.file_path ||
                        row.image_path ||
                        null,

                    image_url:
                        row.image_url ||
                        row.url ||
                        row.path ||
                        row.file_path ||
                        row.image_path ||
                        null

                };

            }
        );

    }
    catch (
        error
    ) {

        console.error(
            "Get Vehicle Images Error:",
            error.message
        );

        return [];

    }

};
// ======================================================
// GET VEHICLE BY ID
// ======================================================

const getVehicleById = async (
    carId
) => {

    const numericId =
        Number(carId);


    if (
        !Number.isInteger(
            numericId
        ) ||
        numericId <= 0
    ) {

        return null;

    }


    // ==================================================
    // 1. GET VEHICLE
    // ==================================================

    const vehicles =
        await executeQuery(

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
                numericId
            ]

        );


    if (
        !Array.isArray(
            vehicles
        ) ||
        vehicles.length === 0
    ) {

        return null;

    }


    const vehicle =
        vehicles[0];


    // ==================================================
    // 2. GET OWNER
    // WITH FALLBACK TO CARS TABLE
    // ==================================================

    let owner = {

        ownerName:
            vehicle.owner_name ||
            vehicle.ownerName ||
            vehicle.customer_name ||
            vehicle.customerName ||
            vehicle.name ||
            vehicle.full_name ||
            vehicle.fullName ||
            "-",

        mobile:
            vehicle.owner_mobile ||
            vehicle.ownerMobile ||
            vehicle.customer_mobile ||
            vehicle.customerMobile ||
            vehicle.mobile ||
            vehicle.phone ||
            vehicle.phone_number ||
            vehicle.phoneNumber ||
            "-",

        email:
            vehicle.owner_email ||
            vehicle.ownerEmail ||
            vehicle.customer_email ||
            vehicle.customerEmail ||
            vehicle.email ||
            "-",

        address:
            vehicle.owner_address ||
            vehicle.ownerAddress ||
            vehicle.customer_address ||
            vehicle.customerAddress ||
            vehicle.address ||
            vehicle.full_address ||
            vehicle.fullAddress ||
            vehicle.city ||
            "-"

    };


    // ==================================================
    // OWNER TABLE
    // ==================================================

    if (
        vehicle.owner_id
    ) {

        try {

            const owners =
                await executeQuery(

                    `
                    SELECT
                        *
                    FROM
                        owners
                    WHERE
                        owner_id = ?
                    LIMIT 1
                    `,

                    [
                        vehicle.owner_id
                    ]

                );


            if (
                Array.isArray(
                    owners
                ) &&
                owners.length > 0
            ) {

                owner = {

                    ...owner,

                    ...owners[0],

                    ownerName:
                        owners[0].name ||
                        owners[0].owner_name ||
                        owners[0].ownerName ||
                        owners[0].customer_name ||
                        owners[0].customerName ||
                        owner.ownerName,

                    mobile:
                        owners[0].mobile ||
                        owners[0].phone ||
                        owners[0].phone_number ||
                        owners[0].phoneNumber ||
                        owners[0].owner_mobile ||
                        owners[0].ownerMobile ||
                        owners[0].customer_mobile ||
                        owners[0].customerMobile ||
                        owner.mobile,

                    email:
                        owners[0].email ||
                        owners[0].owner_email ||
                        owners[0].ownerEmail ||
                        owners[0].customer_email ||
                        owners[0].customerEmail ||
                        owner.email,

                    address:
                        owners[0].address ||
                        owners[0].owner_address ||
                        owners[0].ownerAddress ||
                        owners[0].customer_address ||
                        owners[0].customerAddress ||
                        owners[0].full_address ||
                        owners[0].fullAddress ||
                        owner.address

                };

            }

        }
        catch (
            ownerError
        ) {

            console.log(
                "Owner table query skipped:",
                ownerError.message
            );

        }

    }


    // ==================================================
    // 3. GET INSPECTION REPORT
    // ==================================================

    let inspection = {};


    try {

        const reports =
            await executeQuery(

                `
                SELECT
                    *
                FROM
                    inspection_reports
                WHERE
                    car_id = ?
                ORDER BY
                    report_id DESC
                LIMIT 1
                `,

                [
                    numericId
                ]

            );


        if (
            Array.isArray(
                reports
            ) &&
            reports.length > 0
        ) {

            inspection =
                reports[0];

            // Report-level owner/customer fields are another
            // fallback for installations that store customer data
            // in inspection_reports instead of owners/cars.
            owner = {
                ...owner,
                ...inspection,
                ownerName:
                    inspection.owner_name ||
                    inspection.ownerName ||
                    inspection.customer_name ||
                    inspection.customerName ||
                    owner.ownerName,
                mobile:
                    inspection.owner_mobile ||
                    inspection.ownerMobile ||
                    inspection.customer_mobile ||
                    inspection.customerMobile ||
                    owner.mobile,
                email:
                    inspection.owner_email ||
                    inspection.ownerEmail ||
                    inspection.customer_email ||
                    inspection.customerEmail ||
                    owner.email,
                address:
                    inspection.owner_address ||
                    inspection.ownerAddress ||
                    inspection.customer_address ||
                    inspection.customerAddress ||
                    owner.address
            };

        }

    }
    catch (
        reportError
    ) {

        console.error(

            "Inspection Report Fetch Error:",

            reportError.message

        );

    }


    // ==================================================
    // 4. GET CHECKLIST
    // EXTRACT CLEAN JSON DATA
    // ==================================================

    let checklist = {};


    try {

        const checklistColumns =
            await getChecklistColumns();


        if (
            checklistColumns.length > 0
        ) {

            let checklistRows = [];


            // ------------------------------------------------
            // FIRST TRY REPORT ID
            // ------------------------------------------------

            if (
                checklistColumns.includes(
                    "report_id"
                ) &&
                inspection?.report_id
            ) {

                checklistRows =
                    await executeQuery(

                        `
                        SELECT
                            *
                        FROM
                            inspection_checklist
                        WHERE
                            report_id = ?
                        ORDER BY
                            checklist_id DESC
                        LIMIT 1
                        `,

                        [
                            inspection.report_id
                        ]

                    );

            }


            // ------------------------------------------------
            // FALLBACK CAR ID
            // ------------------------------------------------

            else if (
                checklistColumns.includes(
                    "car_id"
                )
            ) {

                checklistRows =
                    await executeQuery(

                        `
                        SELECT
                            *
                        FROM
                            inspection_checklist
                        WHERE
                            car_id = ?
                        ORDER BY
                            checklist_id DESC
                        LIMIT 1
                        `,

                        [
                            numericId
                        ]

                    );

            }


            // ------------------------------------------------
            // PARSE CHECKLIST
            // ------------------------------------------------

            if (
                Array.isArray(
                    checklistRows
                ) &&
                checklistRows.length > 0
            ) {

                const rawRow =
                    checklistRows[0];


                const jsonFields = [

                    "checklist_data",

                    "data",

                    "inspection_data"

                ];


                for (
                    const field
                    of jsonFields
                ) {

                    if (
                        rawRow[field]
                    ) {

                        try {

                            const parsed =
                                typeof rawRow[field] === "string"

                                    ? JSON.parse(
                                        rawRow[field]
                                    )

                                    : rawRow[field];


                            if (
                                parsed &&
                                typeof parsed === "object"
                            ) {

                                checklist =
                                    parsed;

                                break;

                            }

                        }
                        catch (
                            parseError
                        ) {

                            // Ignore invalid JSON
                            // and continue checking
                            // the next possible field.

                        }

                    }

                }


                // ------------------------------------------------
                // FALLBACK RAW ROW
                // ------------------------------------------------

                if (
                    Object.keys(
                        checklist
                    ).length === 0
                ) {

                    checklist =
                        rawRow;

                }

            }

        }

    }
    catch (
        checklistError
    ) {

        console.error(

            "Checklist Fetch Error:",

            checklistError.message

        );

    }


    // ==================================================
    // 5. GET IMAGES
    // ==================================================

    let images = [];


    try {

        images =
            await getVehicleImages(
                numericId
            );

    }
    catch (
        imageError
    ) {

        images = [];

    }


    // ==================================================
    // FINAL RESPONSE
    // ==================================================

    return {

        vehicle,

        owner,

        inspection,

        checklist,

        images

    };

};


// ======================================================
// GET COMPLETE VEHICLE DATA
// PDF / INSPECTION REPORT COMPATIBILITY
// ======================================================
//
// This function intentionally keeps getVehicleById() as
// the single source of truth and returns the complete object
// expected by inspectionReport.service.js.
//
// Nothing is removed from getVehicleById(). This is an
// additional compatibility method.
//

const getCompleteVehicleData = async (
    carId
) => {

    const numericId =
        Number(carId);

    if (
        !Number.isInteger(
            numericId
        ) ||
        numericId <= 0
    ) {

        return null;

    }

    const result =
        await getVehicleById(
            numericId
        );

    if (
        !result
    ) {

        return null;

    }

    // Keep every existing property and also expose common
    // aliases so the PDF service can read the same data
    // regardless of whether it expects vehicle/customer
    // nested objects or flat properties.

    return {

        ...result,

        vehicle:
            result.vehicle || {},

        owner:
            result.owner || {},

        customer:
            result.owner || {},

        customerDetails:
            result.owner || {},

        customer_details:
            result.owner || {},

        inspection:
            result.inspection || {},

        checklist:
            result.checklist || {},

        inspection_checklist:
            result.checklist || {},

        inspectionChecklist:
            result.checklist || {},

        detailedInspection:
            result.checklist || {},

        images:
            Array.isArray(result.images)
                ? result.images
                : [],

        vehicleImages:
            Array.isArray(result.images)
                ? result.images
                : []

    };

};


// ======================================================
// PUBLISH VEHICLE
// ADMIN / PUBLISH FLOW
// ======================================================
//
// This method only changes the vehicle publication state.
// PDF generation and email sending must happen AFTER this
// method succeeds, from the vehicle service/controller.
//
// Nothing from the existing repository functions is removed.
//

const publishVehicle = async (
    vehicleId
) => {

    const numericVehicleId =
        Number(vehicleId);

    if (
        !Number.isInteger(
            numericVehicleId
        ) ||
        numericVehicleId <= 0
    ) {

        throw new Error(
            "Valid vehicle ID is required."
        );

    }


    // ==================================================
    // CHECK VEHICLE EXISTS
    // ==================================================

    const vehicleRows =
        await executeQuery(

            `
            SELECT
                *
            FROM
                cars
            WHERE
                car_id = ?
            LIMIT 1
            `,

            [
                numericVehicleId
            ]

        );


    if (
        !Array.isArray(
            vehicleRows
        ) ||
        vehicleRows.length === 0
    ) {

        return {

            published:
                false,

            vehicleId:
                numericVehicleId,

            message:
                "Vehicle not found."

        };

    }


    // ==================================================
    // GET CURRENT CARS TABLE COLUMNS
    // ==================================================

    const columns =
        await getCarsColumns();


    if (
        !Array.isArray(
            columns
        ) ||
        !columns.includes(
            "status"
        )
    ) {

        throw new Error(
            "The cars table does not contain a status column. Vehicle cannot be published."
        );

    }


    // ==================================================
    // UPDATE VEHICLE STATUS
    // ==================================================

    const updateParts = [

        "status = ?"

    ];


    const params = [

        "Published"

    ];


    // ==================================================
    // SAVE PUBLISHED DATE IF COLUMN EXISTS
    // ==================================================

    if (
        columns.includes(
            "published_at"
        )
    ) {

        updateParts.push(
            "published_at = NOW()"
        );

    }


    await executeQuery(

        `
        UPDATE
            cars

        SET
            ${updateParts.join(", ")}

        WHERE
            car_id = ?
        `,

        [
            ...params,
            numericVehicleId
        ]

    );


    // ==================================================
    // RE-FETCH AFTER UPDATE
    // IMPORTANT:
    // DO NOT TRUST ONLY THE UPDATE QUERY.
    // VERIFY ACTUAL DATABASE STATE.
    // ==================================================

    const publishedVehicle =
        await getVehicleById(
            numericVehicleId
        );


    if (
        !publishedVehicle ||
        !publishedVehicle.vehicle
    ) {

        throw new Error(
            "Vehicle was updated but could not be fetched again."
        );

    }


    const savedStatus =
        String(
            publishedVehicle.vehicle.status ||
            ""
        )
            .trim()
            .toLowerCase();


    const isPublished =
        [
            "yes",
            "published",
            "publish",
            "active",
            "available"
        ].includes(
            savedStatus
        );


    if (
        !isPublished
    ) {

        throw new Error(
            `Vehicle publish verification failed. Current status: ${publishedVehicle.vehicle.status || "empty"}`
        );

    }


    // ==================================================
    // FINAL RESULT
    // ==================================================

    return {

        published:
            true,

        vehicleId:
            numericVehicleId,

        carId:
            numericVehicleId,

        status:
            publishedVehicle.vehicle.status,

        vehicle:
            publishedVehicle.vehicle,

        owner:
            publishedVehicle.owner ||
            null,

        inspection:
            publishedVehicle.inspection ||
            null,

        checklist:
            publishedVehicle.checklist ||
            null,

        images:
            Array.isArray(
                publishedVehicle.images
            )
                ? publishedVehicle.images
                : [],

        message:
            "Vehicle published successfully."

    };

};


// ======================================================
// MODULE EXPORTS
// ======================================================

module.exports = {

    // --------------------------------------------------
    // VEHICLE
    // --------------------------------------------------

    addVehicle,

    getAllAdminVehicles,

    getPublishedVehicles,

    getVehicleById,

    getCompleteVehicleData,

    publishVehicle,


    // --------------------------------------------------
    // IMAGES
    // --------------------------------------------------

    getVehicleImages,


    // --------------------------------------------------
    // DELETE
    // --------------------------------------------------

    deleteVehicle

};