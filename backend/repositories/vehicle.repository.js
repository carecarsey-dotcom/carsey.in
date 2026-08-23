const db = require("../config/db");

// ======================================================
// ADD VEHICLE + OWNER + INSPECTION REPORT + CHECKLIST
// ======================================================

const addVehicle = (vehicle) => {

    return new Promise((resolve, reject) => {

        const allowedStatuses = [
            "Draft",
            "Published",
            "Available",
            "Sold",
            "Inactive"
        ];

        const status = allowedStatuses.includes(
            vehicle.status
        )
            ? vehicle.status
            : "Draft";

        const publishedAt =
            status === "Published"
                ? new Date()
                : null;


        // ==================================================
        // INSERT OWNER
        // ==================================================

        const ownerSql = `
            INSERT INTO owners (
                owner_name,
                mobile,
                alternate_mobile,
                email,
                address,
                city,
                state,
                pincode,
                aadhar_number,
                pan_number
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;


        db.query(
            ownerSql,

            [
                vehicle.customer_name ??
                    vehicle.owner_name ??
                    vehicle.cx_name ??
                    null,

                vehicle.owner_mobile ??
                    vehicle.mobile ??
                    null,

                vehicle.alternate_mobile ??
                    null,

                vehicle.owner_email ??
                    vehicle.email ??
                    null,

                vehicle.owner_address ??
                    vehicle.address ??
                    null,

                vehicle.owner_city ??
                    vehicle.city ??
                    null,

                vehicle.owner_state ??
                    vehicle.state ??
                    null,

                vehicle.owner_pincode ??
                    vehicle.pincode ??
                    null,

                vehicle.aadhar_number ??
                    vehicle.aadhaar_number ??
                    null,

                vehicle.pan_number ??
                    null
            ],

            (ownerError, ownerResult) => {

                if (ownerError) {
                    return reject(ownerError);
                }


                const ownerId =
                    ownerResult.insertId;


                // ==================================================
                // INSERT VEHICLE
                // ==================================================

                const vehicleSql = `
                    INSERT INTO cars (
                        owner_id,
                        brand,
                        model,
                        variant,
                        manufacturing_year,
                        price,
                        price_short_note,
                        odometer,
                        city,
                        transmission,
                        fuel_type,
                        owner_classification,
                        registration_number,
                        chassis_number,
                        engine_number,
                        inspection_date,
                        rto,
                        spare_key,
                        insurance_type,
                        insurance_validity,
                        vehicle_note,
                        status,
                        published_at
                    )
                    VALUES (
                        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                    )
                `;


                db.query(
                    vehicleSql,

                    [
                        ownerId,

                        vehicle.brand ?? null,
                        vehicle.model ?? null,
                        vehicle.variant ?? null,

                        vehicle.manufacturing_year ?? null,
                        vehicle.price ?? null,

                        vehicle.price_short_note ?? null,

                        vehicle.odometer ?? null,

                        vehicle.city ?? null,

                        vehicle.transmission ?? null,
                        vehicle.fuel_type ?? null,

                        vehicle.owner_classification ?? null,

                        vehicle.registration_number ?? null,
                        vehicle.chassis_number ?? null,
                        vehicle.engine_number ?? null,

                        vehicle.inspection_date || null,

                        vehicle.rto ?? null,
                        vehicle.spare_key ?? null,

                        vehicle.insurance_type ?? null,
                        vehicle.insurance_validity || null,

                        vehicle.vehicle_note || null,

                        status,

                        publishedAt
                    ],

                    (
                        vehicleError,
                        vehicleResult
                    ) => {

                        if (vehicleError) {
                            return reject(vehicleError);
                        }


                        const vehicleId =
                            vehicleResult.insertId;


                        // ==================================================
                        // INSERT INSPECTION REPORT
                        // ==================================================

                        const score10 =
                            Number(
                                vehicle.overall_score
                            ) || 0;


                        const overallScore =
                            Math.round(
                                score10 * 10
                            );


                        const reportSql = `
                            INSERT INTO inspection_reports (
                                car_id,
                                overall_score,
                                engine_remark,
                                overall_remark,
                                pdf_path,
                                publish_status
                            )
                            VALUES (?, ?, ?, ?, ?, ?)
                        `;


                        db.query(
                            reportSql,

                            [
                                vehicleId,

                                overallScore,

                                vehicle.engine_remark ||
                                    "Not provided.",

                                vehicle.overall_remark ||
                                    "Vehicle inspection completed.",

                                null,

                                status === "Published"
                                    ? "Yes"
                                    : "No"
                            ],

                            (
                                reportError,
                                reportResult
                            ) => {

                                if (reportError) {
                                    return reject(
                                        reportError
                                    );
                                }


                                const reportId =
                                    reportResult.insertId;


                                // ==================================================
                                // CHECKLIST
                                // ==================================================

                                const checklist =
                                    vehicle.inspection_checklist;


                                if (
                                    !checklist ||
                                    typeof checklist !==
                                        "object"
                                ) {

                                    return resolve({
                                        ownerId,
                                        vehicleId,
                                        reportId
                                    });

                                }


                                const categories = [

                                    {
                                        key: "exterior",
                                        name: "Exterior"
                                    },

                                    {
                                        key:
                                            "interior_electricals",
                                        name:
                                            "Interior & Electricals"
                                    },

                                    {
                                        key: "engine_bay",
                                        name: "Engine Bay"
                                    },

                                    {
                                        key:
                                            "transmission_system",
                                        name:
                                            "Transmission System"
                                    },

                                    {
                                        key:
                                            "suspension_steering",
                                        name:
                                            "Suspension & Steering"
                                    },

                                    {
                                        key:
                                            "braking_system",
                                        name:
                                            "Braking System"
                                    },

                                    {
                                        key:
                                            "tires_wheels",
                                        name:
                                            "Tyres & Wheels"
                                    },

                                    {
                                        key:
                                            "electricals_ac",
                                        name:
                                            "Electricals & AC"
                                    },

                                    {
                                        key:
                                            "documents_title",
                                        name:
                                            "Documents & Title"
                                    }

                                ];


                                const rows =
                                    categories.map(
                                        category => {

                                            const item =
                                                checklist[
                                                    category.key
                                                ] || {};


                                            const status =
                                                item.status ||
                                                item.condition ||
                                                item.result ||
                                                "Good";


                                            const remark =
                                                item.remark ||
                                                item.remarks ||
                                                item.note ||
                                                null;


                                            return [
                                                reportId,
                                                category.name,
                                                status,
                                                remark
                                            ];

                                        }
                                    );


                                if (!rows.length) {

                                    return resolve({
                                        ownerId,
                                        vehicleId,
                                        reportId
                                    });

                                }


                                const checklistSql = `
                                    INSERT INTO inspection_checklist (
                                        report_id,
                                        category,
                                        status,
                                        remark
                                    )
                                    VALUES ?
                                `;


                                db.query(
                                    checklistSql,

                                    [rows],

                                    checklistError => {

                                        if (checklistError) {
                                            return reject(
                                                checklistError
                                            );
                                        }


                                        resolve({
                                            ownerId,
                                            vehicleId,
                                            reportId
                                        });

                                    }
                                );

                            }
                        );

                    }
                );

            }
        );

    });

};


// ======================================================
// GET VEHICLE BY ID
// IMPORTANT FOR PDF
// ======================================================

const getVehicleById = (carId) => {

    return new Promise((resolve, reject) => {

        const numericCarId =
            Number(carId);


        if (
            !Number.isInteger(
                numericCarId
            ) ||
            numericCarId <= 0
        ) {

            return reject(
                new Error(
                    "Invalid vehicle ID."
                )
            );

        }


        // ==================================================
        // VEHICLE + OWNER
        // ==================================================

        const vehicleSql = `
            SELECT
                c.*,

                o.owner_id,
                o.owner_name,
                o.mobile AS owner_mobile,
                o.alternate_mobile,
                o.email AS owner_email,
                o.address AS owner_address,
                o.city AS owner_city,
                o.state AS owner_state,
                o.pincode AS owner_pincode,
                o.aadhar_number,
                o.pan_number

            FROM cars c

            LEFT JOIN owners o
                ON o.owner_id = c.owner_id

            WHERE c.car_id = ?

            LIMIT 1
        `;


        db.query(
            vehicleSql,

            [numericCarId],

            (
                vehicleError,
                vehicleRows
            ) => {

                if (vehicleError) {
                    return reject(
                        vehicleError
                    );
                }


                if (
                    !vehicleRows ||
                    !vehicleRows.length
                ) {

                    return resolve(
                        null
                    );

                }


                const row =
                    vehicleRows[0];


                const vehicle = {

                    car_id:
                        row.car_id,

                    owner_id:
                        row.owner_id,

                    brand:
                        row.brand,

                    model:
                        row.model,

                    variant:
                        row.variant,

                    manufacturing_year:
                        row.manufacturing_year,

                    price:
                        row.price,

                    price_short_note:
                        row.price_short_note,

                    odometer:
                        row.odometer,

                    city:
                        row.city,

                    transmission:
                        row.transmission,

                    fuel_type:
                        row.fuel_type,

                    owner_classification:
                        row.owner_classification,

                    registration_number:
                        row.registration_number,

                    chassis_number:
                        row.chassis_number,

                    engine_number:
                        row.engine_number,

                    inspection_date:
                        row.inspection_date,

                    rto:
                        row.rto,

                    spare_key:
                        row.spare_key,

                    insurance_type:
                        row.insurance_type,

                    insurance_validity:
                        row.insurance_validity,

                    vehicle_note:
                        row.vehicle_note,

                    status:
                        row.status,

                    created_at:
                        row.created_at,

                    updated_at:
                        row.updated_at,

                    published_at:
                        row.published_at

                };


                const owner = {

                    owner_id:
                        row.owner_id,

                    owner_name:
                        row.owner_name,

                    mobile:
                        row.owner_mobile,

                    alternate_mobile:
                        row.alternate_mobile,

                    email:
                        row.owner_email,

                    address:
                        row.owner_address,

                    city:
                        row.owner_city,

                    state:
                        row.owner_state,

                    pincode:
                        row.owner_pincode,

                    aadhar_number:
                        row.aadhar_number,

                    pan_number:
                        row.pan_number

                };


                // ==================================================
                // GET LATEST INSPECTION
                // ==================================================

                const inspectionSql = `
                    SELECT
                        report_id,
                        car_id,
                        overall_score,
                        engine_remark,
                        overall_remark,
                        pdf_path,
                        publish_status,
                        created_at
                    FROM inspection_reports
                    WHERE car_id = ?
                    ORDER BY report_id DESC
                    LIMIT 1
                `;


                db.query(
                    inspectionSql,

                    [numericCarId],

                    (
                        inspectionError,
                        inspectionRows
                    ) => {

                        if (inspectionError) {
                            return reject(
                                inspectionError
                            );
                        }


                        const inspection =
                            inspectionRows?.[0] ||
                            null;


                        // ==================================================
                        // CHECKLIST
                        // ==================================================

                        if (!inspection) {

                            return resolve({

                                vehicle,

                                owner,

                                inspection:
                                    null,

                                checklist: {}

                            });

                        }


                        const checklistSql = `
                            SELECT
                                checklist_id,
                                report_id,
                                category,
                                status,
                                remark
                            FROM inspection_checklist
                            WHERE report_id = ?
                            ORDER BY checklist_id ASC
                        `;


                        db.query(
                            checklistSql,

                            [
                                inspection.report_id
                            ],

                            (
                                checklistError,
                                checklistRows
                            ) => {

                                if (checklistError) {
                                    return reject(
                                        checklistError
                                    );
                                }


                                const checklist = {};


                                (
                                    checklistRows ||
                                    []
                                ).forEach(
                                    item => {

                                        const key =
                                            String(
                                                item.category
                                            )
                                                .toLowerCase()
                                                .replace(
                                                    /&/g,
                                                    "and"
                                                )
                                                .replace(
                                                    /\s+/g,
                                                    "_"
                                                );


                                        checklist[key] = {

                                            status:
                                                item.status,

                                            remark:
                                                item.remark

                                        };

                                    }
                                );


                                resolve({

                                    vehicle,

                                    owner,

                                    inspection,

                                    checklist

                                });

                            }
                        );

                    }
                );

            }
        );

    });

};


// ======================================================
// GET ALL ADMIN VEHICLES
// ======================================================

const getAllAdminVehicles = () => {

    return new Promise(
        (resolve, reject) => {

            const sql = `
                SELECT
                    c.*
                FROM cars c
                ORDER BY c.created_at DESC
            `;


            db.query(
                sql,

                (err, vehicles) => {

                    if (err) {
                        return reject(err);
                    }


                    resolve(
                        vehicles
                    );

                }
            );

        }
    );

};


// ======================================================
// GET PUBLISHED VEHICLES
// ======================================================

const getPublishedVehicles = (
    filters = {}
) => {

    return new Promise(
        (resolve, reject) => {

            const {
                page = 1,
                limit = 10,
                search,
                brand,
                model,
                city,
                fuel_type,
                transmission,
                min_price,
                max_price,
                min_year,
                max_year,
                sortBy = "created_at",
                sortOrder = "DESC"
            } = filters;


            const pageNumber =
                Math.max(
                    parseInt(
                        page,
                        10
                    ) || 1,
                    1
                );


            const limitNumber =
                Math.min(
                    Math.max(
                        parseInt(
                            limit,
                            10
                        ) || 10,
                        1
                    ),
                    100
                );


            const offset =
                (
                    pageNumber - 1
                ) *
                limitNumber;


            const allowedSortColumns = {

                price:
                    "c.price",

                year:
                    "c.manufacturing_year",

                odometer:
                    "c.odometer",

                created_at:
                    "c.created_at"

            };


            const orderColumn =
                allowedSortColumns[
                    sortBy
                ] ||
                "c.created_at";


            const orderDirection =
                String(
                    sortOrder
                ).toUpperCase() ===
                "ASC"
                    ? "ASC"
                    : "DESC";


            const conditions = [
                "c.status = 'Published'"
            ];


            const params = [];


            if (search) {

                conditions.push(`
                    (
                        c.brand LIKE ?
                        OR c.model LIKE ?
                        OR c.variant LIKE ?
                        OR c.city LIKE ?
                    )
                `);


                const value =
                    `%${search}%`;


                params.push(
                    value,
                    value,
                    value,
                    value
                );

            }


            if (brand) {

                conditions.push(
                    "c.brand = ?"
                );

                params.push(
                    brand
                );

            }


            if (model) {

                conditions.push(
                    "c.model = ?"
                );

                params.push(
                    model
                );

            }


            if (city) {

                conditions.push(
                    "c.city = ?"
                );

                params.push(
                    city
                );

            }


            if (fuel_type) {

                conditions.push(
                    "c.fuel_type = ?"
                );

                params.push(
                    fuel_type
                );

            }


            if (transmission) {

                conditions.push(
                    "c.transmission = ?"
                );

                params.push(
                    transmission
                );

            }


            if (
                min_price !==
                    undefined &&
                min_price !== ""
            ) {

                conditions.push(
                    "c.price >= ?"
                );

                params.push(
                    Number(
                        min_price
                    )
                );

            }


            if (
                max_price !==
                    undefined &&
                max_price !== ""
            ) {

                conditions.push(
                    "c.price <= ?"
                );

                params.push(
                    Number(
                        max_price
                    )
                );

            }


            if (
                min_year !==
                    undefined &&
                min_year !== ""
            ) {

                conditions.push(
                    "c.manufacturing_year >= ?"
                );

                params.push(
                    Number(
                        min_year
                    )
                );

            }


            if (
                max_year !==
                    undefined &&
                max_year !== ""
            ) {

                conditions.push(
                    "c.manufacturing_year <= ?"
                );

                params.push(
                    Number(
                        max_year
                    )
                );

            }


            const whereClause =
                conditions.join(
                    " AND "
                );


            const vehicleSql = `
                SELECT
                    c.*
                FROM cars c
                WHERE ${whereClause}
                ORDER BY
                    ${orderColumn}
                    ${orderDirection}
                LIMIT ?
                OFFSET ?
            `;


            const countSql = `
                SELECT
                    COUNT(*) AS total
                FROM cars c
                WHERE ${whereClause}
            `;


            db.query(
                vehicleSql,

                [
                    ...params,
                    limitNumber,
                    offset
                ],

                (
                    vehicleError,
                    vehicles
                ) => {

                    if (vehicleError) {
                        return reject(
                            vehicleError
                        );
                    }


                    db.query(
                        countSql,

                        params,

                        (
                            countError,
                            countResult
                        ) => {

                            if (countError) {
                                return reject(
                                    countError
                                );
                            }


                            const total =
                                countResult[0]
                                    .total;


                            resolve({

                                vehicles:
                                    vehicles,

                                pagination: {

                                    page:
                                        pageNumber,

                                    limit:
                                        limitNumber,

                                    total,

                                    totalPages:
                                        Math.ceil(
                                            total /
                                            limitNumber
                                        )

                                }

                            });

                        }
                    );

                }
            );

        }
    );

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    addVehicle,

    getVehicleById,

    getAllAdminVehicles,

    getPublishedVehicles

};