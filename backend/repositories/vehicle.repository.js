const db = require("../config/db");


// ======================================================
// UNIVERSAL DATABASE QUERY HELPER
// ======================================================
//
// Ye helper mysql2 ke:
//
// 1. normal callback pool
// 2. promise pool
// 3. mysql2/promise connection
//
// tino ke saath kaam karne ki koshish karta hai.
//
// SELECT  -> rows
// INSERT  -> result
// UPDATE  -> result
// DELETE  -> result
//
// ======================================================

const executeQuery = async (
    sql,
    params = []
) => {

    // ==================================================
    // MYSQL2 PROMISE POOL
    // ==================================================
    //
    // IMPORTANT:
    // mysql2 normal Pool ALSO exposes execute().
    // But its execute() is callback based.
    //
    // Calling:
    //
    //     await db.execute(sql, params)
    //
    // on a normal callback pool causes:
    //
    //     TypeError: cb is not a function
    //
    // Therefore promise() MUST be preferred before
    // using the callback query fallback.
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


    // ==================================================
    // INVALID DATABASE
    // ==================================================

    throw new Error(
        "Database connection is not configured correctly."
    );

};


// ======================================================
// GET CARS TABLE COLUMNS
// ======================================================

const getCarsColumns = async () => {

    const rows =
        await executeQuery(

            `
            SELECT
                COLUMN_NAME

            FROM
                INFORMATION_SCHEMA.COLUMNS

            WHERE
                TABLE_SCHEMA = DATABASE()

                AND TABLE_NAME = 'cars'
            `

        );


    return Array.isArray(rows)
        ? rows.map(
            row =>
                row.COLUMN_NAME
        )
        : [];

};


// ======================================================
// GET INSPECTION REPORT COLUMNS
// ======================================================

const getInspectionReportColumns =
    async () => {

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

                        AND TABLE_NAME =
                            'inspection_reports'
                    `

                );


            return Array.isArray(rows)
                ? rows.map(
                    row =>
                        row.COLUMN_NAME
                )
                : [];


        } catch (
            error
        ) {

            console.error(
                "Inspection Report Columns Error:",
                error.message
            );

            return [];

        }

    };


// ======================================================
// GET CHECKLIST COLUMNS
// ======================================================

const getChecklistColumns =
    async () => {

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

                        AND TABLE_NAME =
                            'inspection_checklist'
                    `

                );


            return Array.isArray(rows)
                ? rows.map(
                    row =>
                        row.COLUMN_NAME
                )
                : [];


        } catch (
            error
        ) {

            console.error(
                "Checklist Columns Error:",
                error.message
            );

            return [];

        }

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
        ]

    };


    // ==================================================
    // SOURCE
    // ==================================================

    const source =
        vehicle &&
        vehicle.vehicle &&
        typeof vehicle.vehicle === "object"

            ? {
                ...vehicle,
                ...vehicle.vehicle
            }

            : (
                vehicle || {}
            );


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
//
// IMPORTANT:
//
// Ye function intentionally yahan define hai.
// Isi ki wajah se:
//
// ReferenceError: addVehicle is not defined
//
// nahi aayega.
//
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
    // INSPECTION DATA
    // ==================================================

    const inspection =
        vehicle.inspection &&
        typeof vehicle.inspection === "object"

            ? vehicle.inspection

            : vehicle;


    const overallScore =
        pickValue(
            inspection,
            [
                "overall_score",
                "overallScore"
            ]
        );


    const engineRemark =
        pickValue(
            inspection,
            [
                "engine_remark",
                "engineRemark"
            ]
        );


    const overallRemark =
        pickValue(
            inspection,
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

        const reportData = {};


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
    // SAVE CHECKLIST
    // ==================================================

    const checklist =
        vehicle.checklist &&
        typeof vehicle.checklist === "object"

            ? vehicle.checklist

            : null;


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


                if (
                    checklistColumns.includes(
                        "report_id"
                    ) &&
                    reportId
                ) {

                    checklistData.report_id =
                        reportId;

                }


                if (
                    checklistColumns.includes(
                        "car_id"
                    )
                ) {

                    checklistData.car_id =
                        vehicleId;

                }


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
// GET VEHICLE BY ID
// ======================================================

const getVehicleById =
    async (
        carId
    ) => {

        const numericId =
            Number(
                carId
            );


        if (
            !Number.isInteger(
                numericId
            ) ||
            numericId <= 0
        ) {

            return null;

        }


        // ==================================================
        // VEHICLE
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
        // OWNER
        // ==================================================

        let owner = {};


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

                    owner =
                        owners[0];

                }

            } catch (
                ownerError
            ) {

                console.log(
                    "Owner table lookup skipped:",
                    ownerError.message
                );

            }

        }


        // ==================================================
        // INSPECTION REPORT
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

            }

        } catch (
            reportError
        ) {

            console.error(
                "Inspection Report Fetch Error:",
                reportError.message
            );

        }


        // ==================================================
        // CHECKLIST
        // ==================================================

        let checklist = {};


        try {

            const checklistRows =
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


            if (
                Array.isArray(
                    checklistRows
                ) &&
                checklistRows.length > 0
            ) {

                checklist =
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
                        checklist[field] &&
                        typeof checklist[field] ===
                            "string"
                    ) {

                        try {

                            const parsed =
                                JSON.parse(
                                    checklist[field]
                                );


                            if (
                                parsed &&
                                typeof parsed ===
                                    "object"
                            ) {

                                checklist = {

                                    ...checklist,

                                    ...parsed

                                };

                            }

                        } catch (
                            parseError
                        ) {

                            // Keep original value.

                        }

                    }

                }

            }

        } catch (
            checklistError
        ) {

            console.error(
                "Checklist Fetch Error:",
                checklistError.message
            );

        }


        // ==================================================
        // RETURN COMPLETE DATA
        // ==================================================

        return {

            vehicle,

            owner,

            inspection,

            checklist

        };

    };


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    addVehicle,

    getAllAdminVehicles,

    getPublishedVehicles,

    getVehicleById

};