const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const vehicleImageService = require("./vehicleImage.service");

// ======================================================
// PAGE SETTINGS
// ======================================================

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;

const MARGIN_LEFT = 28;
const MARGIN_RIGHT = 28;
const MARGIN_TOP = 28;
const MARGIN_BOTTOM = 40;

const CONTENT_WIDTH =
    PAGE_WIDTH -
    MARGIN_LEFT -
    MARGIN_RIGHT;

const PAGE_BOTTOM =
    PAGE_HEIGHT -
    MARGIN_BOTTOM;

// ======================================================
// COLORS
// ======================================================

const COLORS = {
    navy: "#111827",
    blue: "#2563EB",
    lightBlue: "#EFF6FF",
    border: "#D6DEE8",
    lightGray: "#F5F7FA",
    gray: "#64748B",
    dark: "#172033",
    green: "#16A34A",
    greenLight: "#DCFCE7",
    white: "#FFFFFF",
    black: "#000000",
    headerGray: "#EDF3F9"
};

// ======================================================
// SAFE VALUE
// ======================================================

const safeValue = (value, fallback = "-") => {
    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return fallback;
    }

    if (typeof value === "object") {
        try {
            return JSON.stringify(value);
        } catch (error) {
            return fallback;
        }
    }

    return String(value);
};

// ======================================================
// FIRST AVAILABLE VALUE
// ======================================================

const firstValue = (
    object,
    keys,
    fallback = "-"
) => {
    if (
        !object ||
        typeof object !== "object"
    ) {
        return fallback;
    }

    for (const key of keys) {
        if (
            object[key] !== undefined &&
            object[key] !== null &&
            object[key] !== ""
        ) {
            return object[key];
        }
    }

    return fallback;
};

// ======================================================
// TITLE CASE
// ======================================================

const titleCase = (value) => {
    if (!value) {
        return "-";
    }

    return String(value)
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, (char) =>
            char.toUpperCase()
        );
};

// ======================================================
// FORMAT PRICE
// ======================================================

const formatPrice = (value) => {
    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return "-";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
        return String(value);
    }

    return `Rs. ${number.toLocaleString("en-IN")}`;
};

// ======================================================
// FORMAT DATE
// ======================================================

const formatDate = (value) => {
    if (!value) {
        return "-";
    }

    try {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return String(value);
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    } catch (error) {
        return String(value);
    }
};

// ======================================================
// FORMAT SCORE
// ======================================================

const normalizeScore = (value) => {
    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return null;
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
        return value;
    }

    if (
        number > 10 &&
        number <= 100
    ) {
        return Number(
            (number / 10).toFixed(1)
        );
    }

    return Number(
        number.toFixed(1)
    );
};

const formatScore = (value) => {
    const normalized =
        normalizeScore(value);

    if (normalized === null) {
        return "-";
    }

    return String(normalized);
};

// ======================================================
// GET CHECKLIST ARRAY
// ======================================================

const getChecklistArray = (report) => {
    let checklist =
        report.checklist ||
        report.inspectionChecklist ||
        report.checklists ||
        report.inspection?.checklist ||
        report.inspection?.inspectionChecklist ||
        [];

    if (Array.isArray(checklist)) {
        return checklist;
    }

    if (typeof checklist === "string") {
        try {
            const parsed =
                JSON.parse(checklist);

            if (Array.isArray(parsed)) {
                return parsed;
            }

            if (
                parsed &&
                typeof parsed === "object"
            ) {
                checklist = parsed;
            }
        } catch (error) {
            return [];
        }
    }

    if (
        checklist &&
        typeof checklist === "object" &&
        !Array.isArray(checklist)
    ) {
        return Object.entries(checklist).map(
            ([key, value]) => {
                if (
                    value &&
                    typeof value === "object"
                ) {
                    return {
                        ...value,
                        area: firstValue(
                            value,
                            [
                                "area",
                                "inspection_area",
                                "inspectionArea",
                                "name",
                                "title",
                                "label"
                            ],
                            titleCase(key)
                        )
                    };
                }

                return {
                    area: titleCase(key),
                    status: value,
                    remark: "-"
                };
            }
        );
    }

    return [];
};

// ======================================================
// NORMALIZE CHECKLIST
// ======================================================

const normalizeChecklist = (report) => {
    const checklist =
        getChecklistArray(report);

    if (checklist.length > 0) {
        return checklist.map(
            (item, index) => {
                item =
                    item &&
                    typeof item === "object"
                        ? item
                        : {
                            status: item
                        };

                const area =
                    firstValue(
                        item,
                        [
                            "area",
                            "inspection_area",
                            "inspectionArea",
                            "name",
                            "title",
                            "label"
                        ],
                        `Inspection ${index + 1}`
                    );

                const status =
                    firstValue(
                        item,
                        [
                            "status",
                            "condition",
                            "result",
                            "value",
                            "inspectionStatus",
                            "inspection_status"
                        ],
                        "-"
                    );

                const remark =
                    firstValue(
                        item,
                        [
                            "remark",
                            "remarks",
                            "note",
                            "comment",
                            "description"
                        ],
                        "-"
                    );

                return {
                    area: titleCase(area),
                    status: safeValue(status),
                    remark: safeValue(remark)
                };
            }
        );
    }

    const inspection =
        report.inspection &&
        typeof report.inspection === "object"
            ? report.inspection
            : {};

    const categories = [
        {
            area: "Exterior",
            status: firstValue(
                report,
                [
                    "exterior_status",
                    "exteriorStatus"
                ],
                firstValue(
                    inspection,
                    [
                        "exterior_status",
                        "exteriorStatus"
                    ],
                    "-"
                )
            ),
            remark: firstValue(
                report,
                [
                    "exterior_remark",
                    "exteriorRemark"
                ],
                firstValue(
                    inspection,
                    [
                        "exterior_remark",
                        "exteriorRemark"
                    ],
                    "-"
                )
            )
        },
        {
            area: "Interior And Electricals",
            status: firstValue(
                report,
                [
                    "interior_electricals_status",
                    "interiorElectricalsStatus",
                    "interior_status",
                    "interiorStatus"
                ],
                firstValue(
                    inspection,
                    [
                        "interior_electricals_status",
                        "interiorElectricalsStatus",
                        "interior_status",
                        "interiorStatus"
                    ],
                    "-"
                )
            ),
            remark: firstValue(
                report,
                [
                    "interior_electricals_remark",
                    "interiorElectricalsRemark",
                    "interior_remark",
                    "interiorRemark"
                ],
                firstValue(
                    inspection,
                    [
                        "interior_electricals_remark",
                        "interiorElectricalsRemark",
                        "interior_remark",
                        "interiorRemark"
                    ],
                    "-"
                )
            )
        },
        {
            area: "Engine Bay",
            status: firstValue(
                report,
                [
                    "engine_bay_status",
                    "engineBayStatus"
                ],
                "-"
            ),
            remark: firstValue(
                report,
                [
                    "engine_bay_remark",
                    "engineBayRemark"
                ],
                "-"
            )
        },
        {
            area: "Transmission System",
            status: firstValue(
                report,
                [
                    "transmission_system_status",
                    "transmissionSystemStatus"
                ],
                "-"
            ),
            remark: firstValue(
                report,
                [
                    "transmission_system_remark",
                    "transmissionSystemRemark"
                ],
                "-"
            )
        },
        {
            area: "Suspension And Steering",
            status: firstValue(
                report,
                [
                    "suspension_steering_status",
                    "suspensionSteeringStatus"
                ],
                "-"
            ),
            remark: firstValue(
                report,
                [
                    "suspension_steering_remark",
                    "suspensionSteeringRemark"
                ],
                "-"
            )
        },
        {
            area: "Braking System",
            status: firstValue(
                report,
                [
                    "braking_system_status",
                    "brakingSystemStatus"
                ],
                "-"
            ),
            remark: firstValue(
                report,
                [
                    "braking_system_remark",
                    "brakingSystemRemark"
                ],
                "-"
            )
        },
        {
            area: "Tyres And Wheels",
            status: firstValue(
                report,
                [
                    "tyres_wheels_status",
                    "tyresWheelsStatus",
                    "tyres_status",
                    "tyresStatus"
                ],
                "-"
            ),
            remark: firstValue(
                report,
                [
                    "tyres_wheels_remark",
                    "tyresWheelsRemark",
                    "tyres_remark",
                    "tyresRemark"
                ],
                "-"
            )
        },
        {
            area: "Electricals And AC",
            status: firstValue(
                report,
                [
                    "electricals_ac_status",
                    "electricalsAcStatus",
                    "electrical_status",
                    "electricalStatus"
                ],
                "-"
            ),
            remark: firstValue(
                report,
                [
                    "electricals_ac_remark",
                    "electricalsAcRemark",
                    "electrical_remark",
                    "electricalRemark"
                ],
                "-"
            )
        },
        {
            area: "Documents And Title",
            status: firstValue(
                report,
                [
                    "documents_title_status",
                    "documentsTitleStatus",
                    "documents_status",
                    "documentsStatus"
                ],
                "-"
            ),
            remark: firstValue(
                report,
                [
                    "documents_title_remark",
                    "documentsTitleRemark",
                    "documents_remark",
                    "documentsRemark"
                ],
                "-"
            )
        }
    ];

    return categories.map(
        (item) => ({
            area: item.area,
            status: safeValue(
                item.status,
                "-"
            ),
            remark: safeValue(
                item.remark,
                "-"
            )
        })
    );
};

// ======================================================
// REPORT ID
// ======================================================

const getReportId = (report) => {
    return firstValue(
        report,
        [
            "reportId",
            "report_id",
            "id"
        ],
        "-"
    );
};

// ======================================================
// CAR ID
// IMPORTANT:
// This is used internally only for loading images.
// It is NEVER rendered inside the PDF.
// ======================================================

const getCarId = (report) => {
    return firstValue(
        report,
        [
            "carId",
            "car_id",
            "vehicleId",
            "vehicle_id"
        ],
        "-"
    );
};

// ======================================================
// DRAW FOOTER
// CAR ID IS NOT SHOWN
// ======================================================

const drawFooter = (
    doc,
    pageNumber,
    reportId
) => {
    const footerY =
        PAGE_HEIGHT - 25;

    doc.save();

    doc
        .strokeColor(COLORS.border)
        .lineWidth(0.5)
        .moveTo(
            MARGIN_LEFT,
            footerY - 8
        )
        .lineTo(
            PAGE_WIDTH -
                MARGIN_RIGHT,
            footerY - 8
        )
        .stroke();

    doc
        .font("Helvetica")
        .fontSize(7)
        .fillColor(COLORS.gray)
        .text(
            "Generated by Carsey.in",
            MARGIN_LEFT,
            footerY,
            {
                width: 220,
                align: "left"
            }
        );

    // ONLY REPORT ID
    // NO CAR ID
    doc.text(
        `Vehicle Inspection Report #${reportId} | Page ${pageNumber}`,
        PAGE_WIDTH - 280,
        footerY,
        {
            width: 252,
            align: "right"
        }
    );

    doc.restore();
};

// ======================================================
// ADD NEW PAGE WITH FOOTER
// ======================================================

const addPageWithFooter = (
    doc,
    reportId
) => {
    drawFooter(
        doc,
        doc.page.number,
        reportId
    );

    doc.addPage();

    return MARGIN_TOP;
};

// ======================================================
// DRAW HEADER
// CAR ID COMPLETELY REMOVED
// ======================================================

const drawReportHeader = (
    doc,
    report
) => {
    const reportId =
        getReportId(report);

    const headerHeight = 72;

    doc
        .roundedRect(
            MARGIN_LEFT,
            MARGIN_TOP,
            CONTENT_WIDTH,
            headerHeight,
            7
        )
        .fillAndStroke(
            COLORS.white,
            COLORS.border
        );

    // Brand
    doc
        .font("Helvetica-Bold")
        .fontSize(24)
        .fillColor(COLORS.dark)
        .text(
            "Carsey.in",
            MARGIN_LEFT + 14,
            MARGIN_TOP + 13
        );

    // Subtitle
    doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor(COLORS.gray)
        .text(
            "Vehicle Inspection Report",
            MARGIN_LEFT + 15,
            MARGIN_TOP + 42
        );

    // REPORT
    doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(COLORS.gray)
        .text(
            "REPORT",
            PAGE_WIDTH - 130,
            MARGIN_TOP + 15,
            {
                width: 90,
                align: "right"
            }
        );

    // REPORT NUMBER
    doc
        .font("Helvetica-Bold")
        .fontSize(18)
        .fillColor(COLORS.dark)
        .text(
            `#${reportId}`,
            PAGE_WIDTH - 130,
            MARGIN_TOP + 27,
            {
                width: 90,
                align: "right"
            }
        );

    // ==================================================
    // IMPORTANT:
    // CAR ID BLOCK REMOVED COMPLETELY
    // ==================================================

    return (
        MARGIN_TOP +
        headerHeight +
        12
    );
};

// ======================================================
// DRAW SECTION HEADER
// ======================================================

const drawSectionHeader = (
    doc,
    title,
    y
) => {
    const height = 25;

    doc
        .roundedRect(
            MARGIN_LEFT,
            y,
            CONTENT_WIDTH,
            height,
            5
        )
        .fill(COLORS.navy);

    doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor(COLORS.white)
        .text(
            title,
            MARGIN_LEFT + 10,
            y + 7,
            {
                width:
                    CONTENT_WIDTH - 20,
                ellipsis: true
            }
        );

    return y + height;
};

// ======================================================
// DRAW FIELD
// ======================================================

const drawField = (
    doc,
    x,
    y,
    width,
    label,
    value
) => {
    doc
        .font("Helvetica-Bold")
        .fontSize(6.5)
        .fillColor(COLORS.gray)
        .text(
            safeValue(label, "-")
                .toUpperCase(),
            x,
            y,
            {
                width: width - 10,
                height: 9,
                ellipsis: true
            }
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .fillColor(COLORS.dark)
        .text(
            safeValue(value),
            x,
            y + 11,
            {
                width: width - 14,
                height: 22,
                ellipsis: true
            }
        );
};

// ======================================================
// DRAW VEHICLE DETAILS
// ======================================================

const drawVehicleDetails = (
    doc,
    report,
    y
) => {
    y = drawSectionHeader(
        doc,
        "Vehicle Details",
        y
    );

    y += 5;

    const rowHeight = 43;

    const columnWidth =
        CONTENT_WIDTH / 3;

    const vehicleFields = [
        [
            "Brand",
            firstValue(
                report,
                [
                    "brand",
                    "make",
                    "vehicleBrand"
                ],
                "-"
            )
        ],
        [
            "Model",
            firstValue(
                report,
                [
                    "model",
                    "vehicleModel"
                ],
                "-"
            )
        ],
        [
            "Variant",
            firstValue(
                report,
                [
                    "variant",
                    "vehicleVariant"
                ],
                "-"
            )
        ],
        [
            "Manufacturing Year",
            firstValue(
                report,
                [
                    "manufacturingYear",
                    "manufacturing_year",
                    "year",
                    "manufactureYear"
                ],
                "-"
            )
        ],
        [
            "Price",
            formatPrice(
                firstValue(
                    report,
                    [
                        "price",
                        "vehiclePrice",
                        "sellingPrice",
                        "askingPrice"
                    ],
                    ""
                )
            )
        ],
        [
            "Price Note",
            firstValue(
                report,
                [
                    "priceShortNote",
                    "price_short_note",
                    "priceNote",
                    "price_note"
                ],
                "-"
            )
        ],
        [
            "Odometer",
            (() => {
                const value =
                    firstValue(
                        report,
                        [
                            "odometer",
                            "kilometers",
                            "kilometres",
                            "kmDriven",
                            "km_driven",
                            "mileage"
                        ],
                        "-"
                    );

                return value === "-"
                    ? "-"
                    : `${value} KM`;
            })()
        ],
        [
            "Fuel Type",
            firstValue(
                report,
                [
                    "fuelType",
                    "fuel_type",
                    "fuel"
                ],
                "-"
            )
        ],
        [
            "Transmission",
            firstValue(
                report,
                ["transmission"],
                "-"
            )
        ],
        [
            "Owner Classification",
            firstValue(
                report,
                [
                    "ownerClassification",
                    "owner_classification",
                    "ownerType",
                    "owner_type"
                ],
                "-"
            )
        ],
        [
            "Registration Number",
            firstValue(
                report,
                [
                    "registrationNumber",
                    "registration_number",
                    "registrationNo",
                    "registration_no",
                    "regNumber",
                    "reg_no"
                ],
                "-"
            )
        ],
        [
            "Chassis Number",
            firstValue(
                report,
                [
                    "chassisNumber",
                    "chassis_number",
                    "chassisNo",
                    "chassis_no"
                ],
                "-"
            )
        ],
        [
            "Engine Number",
            firstValue(
                report,
                [
                    "engineNumber",
                    "engine_number",
                    "engineNo",
                    "engine_no"
                ],
                "-"
            )
        ],
        // [
        //     "Address",
        //     firstValue(
        //         report,
        //         [
        //             "address",
        //             "vehicleAddress",
        //             "vehicle_address",
        //             "fullAddress",
        //             "full_address",
        //             "location",
        //             "vehicleLocation"
        //         ],
        //         firstValue(
        //             report.owner,
        //             [
        //                 "address",
        //                 "ownerAddress",
        //                 "owner_address",
        //                 "fullAddress",
        //                 "full_address"
        //             ],
        //             "-"
        //         )
        //     )
        // ],
        [
            "Inspection Date",
            formatDate(
                firstValue(
                    report,
                    [
                        "inspectionDate",
                        "inspection_date",
                        "inspectionDateTime"
                    ],
                    ""
                )
            )
        ],
        [
            "RTO",
            firstValue(
                report,
                [
                    "rto",
                    "rtoName",
                    "rto_name",
                    "rtoCode",
                    "rto_code"
                ],
                "-"
            )
        ],
        [
            "Spare Key",
            firstValue(
                report,
                [
                    "spareKey",
                    "spare_key",
                    "spareKeys",
                    "spare_keys"
                ],
                "-"
            )
        ],
        [
            "Insurance Type",
            firstValue(
                report,
                [
                    "insuranceType",
                    "insurance_type",
                    "insurance"
                ],
                "-"
            )
        ],
        [
            "Insurance Validity",
            formatDate(
                firstValue(
                    report,
                    [
                        "insuranceValidity",
                        "insurance_validity",
                        "insuranceExpiry",
                        "insurance_expiry",
                        "insuranceValidTill",
                        "insurance_valid_till"
                    ],
                    ""
                )
            )
        ],
        [
            "Status",
            firstValue(
                report,
                [
                    "status",
                    "publishStatus",
                    "publish_status"
                ],
                "Published"
            )
        ],
        [
            "Created Date",
            formatDate(
                firstValue(
                    report,
                    [
                        "createdAt",
                        "created_at"
                    ],
                    new Date()
                )
            )
        ]
    ];

    for (
        let i = 0;
        i < vehicleFields.length;
        i += 3
    ) {
        const row =
            vehicleFields.slice(
                i,
                i + 3
            );

        const rowY = y;

        doc
            .rect(
                MARGIN_LEFT,
                rowY,
                CONTENT_WIDTH,
                rowHeight
            )
            .fillAndStroke(
                COLORS.white,
                COLORS.border
            );

        doc
            .strokeColor(COLORS.border)
            .lineWidth(0.5);

        for (
            let column = 1;
            column < 3;
            column++
        ) {
            doc
                .moveTo(
                    MARGIN_LEFT +
                        columnWidth *
                            column,
                    rowY
                )
                .lineTo(
                    MARGIN_LEFT +
                        columnWidth *
                            column,
                    rowY +
                        rowHeight
                )
                .stroke();
        }

        row.forEach(
            ([label, value], index) => {
                drawField(
                    doc,
                    MARGIN_LEFT +
                        columnWidth *
                            index +
                        8,
                    rowY + 8,
                    columnWidth,
                    label,
                    value
                );
            }
        );

        y += rowHeight;
    }

    const vehicleNote =
        firstValue(
            report,
            [
                "vehicleNote",
                "vehicle_note",
                "note",
                "vehicleNotes",
                "vehicle_notes"
            ],
            "-"
        );

    doc
        .rect(
            MARGIN_LEFT,
            y,
            CONTENT_WIDTH,
            35
        )
        .fillAndStroke(
            COLORS.white,
            COLORS.border
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(6.5)
        .fillColor(COLORS.gray)
        .text(
            "VEHICLE NOTE",
            MARGIN_LEFT + 8,
            y + 7
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .fillColor(COLORS.dark)
        .text(
            safeValue(vehicleNote),
            MARGIN_LEFT + 8,
            y + 18,
            {
                width:
                    CONTENT_WIDTH - 16,
                height: 13,
                ellipsis: true
            }
        );

    y += 43;

    return y;
};

// ======================================================
// DRAW OWNER DETAILS
// ======================================================

const drawOwnerDetails = (
    doc,
    report,
    y
) => {
    y = drawSectionHeader(
        doc,
        "Owner Details",
        y
    );

    y += 5;

    const owner =
        report.owner &&
        typeof report.owner === "object"
            ? report.owner
            : report;

    const rowHeight = 43;

    const columnWidth =
        CONTENT_WIDTH / 3;

    doc
        .rect(
            MARGIN_LEFT,
            y,
            CONTENT_WIDTH,
            rowHeight
        )
        .fillAndStroke(
            COLORS.white,
            COLORS.border
        );

    doc
        .strokeColor(COLORS.border)
        .lineWidth(0.5);

    doc
        .moveTo(
            MARGIN_LEFT +
                columnWidth,
            y
        )
        .lineTo(
            MARGIN_LEFT +
                columnWidth,
            y +
                rowHeight
        )
        .stroke();

    doc
        .moveTo(
            MARGIN_LEFT +
                columnWidth * 2,
            y
        )
        .lineTo(
            MARGIN_LEFT +
                columnWidth * 2,
            y +
                rowHeight
        )
        .stroke();

    drawField(
        doc,
        MARGIN_LEFT + 8,
        y + 8,
        columnWidth,
        "Owner Name",
        firstValue(
            owner,
            [
                "ownerName",
                "owner_name",
                "name",
                "fullName",
                "full_name"
            ],
            "-"
        )
    );

    drawField(
        doc,
        MARGIN_LEFT +
            columnWidth +
            8,
        y + 8,
        columnWidth,
        "Mobile",
        firstValue(
            owner,
            [
                "mobile",
                "ownerMobile",
                "owner_mobile",
                "phone",
                "phoneNumber",
                "phone_number",
                "mobileNumber",
                "mobile_number"
            ],
            "-"
        )
    );

    drawField(
        doc,
        MARGIN_LEFT +
            columnWidth * 2 +
            8,
        y + 8,
        columnWidth,
        "Email",
        firstValue(
            owner,
            [
                "email",
                "ownerEmail",
                "owner_email"
            ],
            "-"
        )
    );

    y += rowHeight;

    const address =
        firstValue(
            report,
            [
                "address",
                "vehicleAddress",
                "vehicle_address",
                "fullAddress",
                "full_address"
            ],
            firstValue(
                owner,
                [
                    "address",
                    "ownerAddress",
                    "owner_address",
                    "fullAddress",
                    "full_address"
                ],
                "-"
            )
        );

    doc
        .rect(
            MARGIN_LEFT,
            y,
            CONTENT_WIDTH,
            45
        )
        .fillAndStroke(
            COLORS.white,
            COLORS.border
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(6.5)
        .fillColor(COLORS.gray)
        .text(
            "ADDRESS",
            MARGIN_LEFT + 8,
            y + 8
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .fillColor(COLORS.dark)
        .text(
            safeValue(address),
            MARGIN_LEFT + 8,
            y + 20,
            {
                width:
                    CONTENT_WIDTH - 16,
                height: 18,
                ellipsis: true
            }
        );

    y += 52;

    return y;
};

// ======================================================
// DRAW INSPECTION SUMMARY
// ======================================================

const drawInspectionSummary = (
    doc,
    report,
    y
) => {
    y = drawSectionHeader(
        doc,
        "Inspection Summary",
        y
    );

    y += 6;

    const inspection =
        report.inspection &&
        typeof report.inspection === "object"
            ? report.inspection
            : {};

    const score =
        firstValue(
            report,
            [
                "overallScore",
                "overall_score",
                "score"
            ],
            firstValue(
                inspection,
                [
                    "overallScore",
                    "overall_score",
                    "score"
                ],
                "-"
            )
        );

    const engineRemark =
        firstValue(
            report,
            [
                "engineRemark",
                "engine_remark",
                "engineNotes",
                "engine_notes"
            ],
            firstValue(
                inspection,
                [
                    "engineRemark",
                    "engine_remark",
                    "engineNotes",
                    "engine_notes"
                ],
                "Not provided."
            )
        );

    const overallRemark =
        firstValue(
            report,
            [
                "overallRemark",
                "overall_remark",
                "remarks",
                "remark",
                "comments",
                "comment"
            ],
            firstValue(
                inspection,
                [
                    "overallRemark",
                    "overall_remark",
                    "remarks",
                    "remark",
                    "comments",
                    "comment"
                ],
                "Vehicle inspection completed."
            )
        );

    const boxGap = 8;
    const scoreWidth = 100;

    const remainingWidth =
        CONTENT_WIDTH -
        scoreWidth -
        boxGap * 2;

    const remarkWidth =
        remainingWidth / 2;

    const boxHeight = 72;

    // SCORE
    doc
        .roundedRect(
            MARGIN_LEFT,
            y,
            scoreWidth,
            boxHeight,
            6
        )
        .fillAndStroke(
            COLORS.lightBlue,
            COLORS.border
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(6.5)
        .fillColor(COLORS.gray)
        .text(
            "OVERALL SCORE",
            MARGIN_LEFT + 9,
            y + 10
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(24)
        .fillColor(COLORS.dark)
        .text(
            formatScore(score),
            MARGIN_LEFT + 9,
            y + 27
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(COLORS.dark)
        .text(
            "/ 10",
            MARGIN_LEFT + 62,
            y + 39
        );

    // ENGINE REMARK
    const engineX =
        MARGIN_LEFT +
        scoreWidth +
        boxGap;

    doc
        .roundedRect(
            engineX,
            y,
            remarkWidth,
            boxHeight,
            6
        )
        .fillAndStroke(
            COLORS.lightBlue,
            COLORS.border
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(6.5)
        .fillColor(COLORS.gray)
        .text(
            "ENGINE REMARK",
            engineX + 9,
            y + 10
        );

    doc
        .font("Helvetica")
        .fontSize(8.5)
        .fillColor(COLORS.dark)
        .text(
            safeValue(engineRemark),
            engineX + 9,
            y + 27,
            {
                width:
                    remarkWidth - 18,
                height: 35
            }
        );

    // OVERALL REMARK
    const overallX =
        engineX +
        remarkWidth +
        boxGap;

    doc
        .roundedRect(
            overallX,
            y,
            remarkWidth,
            boxHeight,
            6
        )
        .fillAndStroke(
            COLORS.lightBlue,
            COLORS.border
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(6.5)
        .fillColor(COLORS.gray)
        .text(
            "OVERALL REMARK",
            overallX + 9,
            y + 10
        );

    doc
        .font("Helvetica")
        .fontSize(8.5)
        .fillColor(COLORS.dark)
        .text(
            safeValue(overallRemark),
            overallX + 9,
            y + 27,
            {
                width:
                    remarkWidth - 18,
                height: 35
            }
        );

    y += boxHeight + 10;

    return y;
};

// ======================================================
// ADDITIONAL VEHICLE DATA
// ======================================================

const drawAdditionalVehicleData = (
    doc,
    report,
    y
) => {
    const excludedKeys =
        new Set([
            "id",
            "reportId",
            "report_id",

            // CAR ID NEVER DISPLAYED
            "carId",
            "car_id",
            "vehicleId",
            "vehicle_id",

            "brand",
            "model",
            "variant",
            "manufacturingYear",
            "manufacturing_year",
            "price",
            "odometer",
            "fuelType",
            "fuel_type",
            "transmission",
            "ownerClassification",
            "owner_classification",
            "registrationNumber",
            "registration_number",
            "chassisNumber",
            "chassis_number",
            "engineNumber",
            "engine_number",
            "city",
            "inspectionDate",
            "inspection_date",
            "rto",
            "spareKey",
            "spare_key",
            "insuranceType",
            "insurance_type",
            "insuranceValidity",
            "insurance_validity",
            "status",
            "publishStatus",
            "createdAt",
            "created_at",
            "vehicleNote",
            "vehicle_note",
            "owner",
            "vehicle",
            "inspection",
            "checklist",
            "inspectionChecklist",
            "checklists",
            "overallScore",
            "overall_score",
            "score",
            "engineRemark",
            "engine_remark",
            "overallRemark",
            "overall_remark"
        ]);

    const values = [];

    const collect = (
        object,
        prefix = ""
    ) => {
        if (
            !object ||
            typeof object !== "object" ||
            Array.isArray(object)
        ) {
            return;
        }

        Object.entries(object).forEach(
            ([key, value]) => {
                const fullKey =
                    prefix
                        ? `${prefix}.${key}`
                        : key;

                if (
                    excludedKeys.has(key)
                ) {
                    return;
                }

                if (
                    value === undefined ||
                    value === null ||
                    value === ""
                ) {
                    return;
                }

                if (
                    typeof value === "object" &&
                    !Array.isArray(value)
                ) {
                    collect(
                        value,
                        fullKey
                    );

                    return;
                }

                if (Array.isArray(value)) {
                    if (value.length > 0) {
                        values.push([
                            titleCase(fullKey),
                            value
                                .map(
                                    (item) =>
                                        typeof item === "object"
                                            ? JSON.stringify(item)
                                            : String(item)
                                )
                                .join(", ")
                        ]);
                    }

                    return;
                }

                values.push([
                    titleCase(fullKey),
                    String(value)
                ]);
            }
        );
    };

    collect(report);

    if (values.length === 0) {
        return y;
    }

    y = drawSectionHeader(
        doc,
        "Additional Vehicle Information",
        y
    );

    y += 5;

    const rowHeight = 43;

    const columnWidth =
        CONTENT_WIDTH / 3;

    for (
        let i = 0;
        i < values.length;
        i += 3
    ) {
        if (
            y + rowHeight >
            PAGE_BOTTOM
        ) {
            y = addPageWithFooter(
                doc,
                getReportId(report)
            );

            y = drawSectionHeader(
                doc,
                "Additional Vehicle Information - Continued",
                y
            );

            y += 5;
        }

        const row =
            values.slice(
                i,
                i + 3
            );

        doc
            .rect(
                MARGIN_LEFT,
                y,
                CONTENT_WIDTH,
                rowHeight
            )
            .fillAndStroke(
                COLORS.white,
                COLORS.border
            );

        doc
            .strokeColor(COLORS.border)
            .lineWidth(0.5);

        for (
            let column = 1;
            column < 3;
            column++
        ) {
            doc
                .moveTo(
                    MARGIN_LEFT +
                        columnWidth *
                            column,
                    y
                )
                .lineTo(
                    MARGIN_LEFT +
                        columnWidth *
                            column,
                    y +
                        rowHeight
                )
                .stroke();
        }

        row.forEach(
            ([label, value], index) => {
                drawField(
                    doc,
                    MARGIN_LEFT +
                        columnWidth *
                            index +
                        8,
                    y + 8,
                    columnWidth,
                    label,
                    value
                );
            }
        );

        y += rowHeight;
    }

    return y;
};

// ======================================================
// CHECKLIST ROW HEIGHT
// ======================================================

const getChecklistRowHeight = (
    doc,
    area,
    status,
    remark,
    widths
) => {
    doc
        .font("Helvetica")
        .fontSize(8);

    const areaHeight =
        doc.heightOfString(
            safeValue(area),
            {
                width:
                    widths[0] - 14
            }
        );

    const statusHeight =
        doc.heightOfString(
            safeValue(status),
            {
                width:
                    widths[1] - 14
            }
        );

    const remarkHeight =
        doc.heightOfString(
            safeValue(remark),
            {
                width:
                    widths[2] - 14
            }
        );

    return Math.max(
        34,
        Math.max(
            areaHeight,
            statusHeight,
            remarkHeight
        ) + 20
    );
};

// ======================================================
// DRAW CHECKLIST HEADER
// ======================================================

const drawChecklistHeader = (
    doc,
    x,
    y,
    widths
) => {
    const height = 28;

    const headers = [
        "INSPECTION AREA",
        "STATUS",
        "REMARK"
    ];

    let currentX = x;

    headers.forEach(
        (header, index) => {
            doc
                .rect(
                    currentX,
                    y,
                    widths[index],
                    height
                )
                .fillAndStroke(
                    COLORS.headerGray,
                    COLORS.border
                );

            doc
                .font("Helvetica-Bold")
                .fontSize(7)
                .fillColor(COLORS.gray)
                .text(
                    header,
                    currentX + 7,
                    y + 10,
                    {
                        width:
                            widths[index] - 14,
                        ellipsis: true
                    }
                );

            currentX += widths[index];
        }
    );

    return y + height;
};

// ======================================================
// DRAW CHECKLIST ROW
// ======================================================

const drawChecklistRow = (
    doc,
    x,
    y,
    widths,
    area,
    status,
    remark
) => {
    const height =
        getChecklistRowHeight(
            doc,
            area,
            status,
            remark,
            widths
        );

    const x1 = x;

    const x2 =
        x +
        widths[0];

    const x3 =
        x +
        widths[0] +
        widths[1];

    doc
        .rect(
            x1,
            y,
            widths[0],
            height
        )
        .fillAndStroke(
            COLORS.white,
            COLORS.border
        );

    doc
        .rect(
            x2,
            y,
            widths[1],
            height
        )
        .fillAndStroke(
            COLORS.white,
            COLORS.border
        );

    doc
        .rect(
            x3,
            y,
            widths[2],
            height
        )
        .fillAndStroke(
            COLORS.white,
            COLORS.border
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(COLORS.dark)
        .text(
            safeValue(area),
            x1 + 7,
            y + 10,
            {
                width:
                    widths[0] - 14,
                height:
                    height - 16
            }
        );

    const statusText =
        safeValue(status);

    doc
        .font("Helvetica-Bold")
        .fontSize(7);

    const measuredStatusWidth =
        doc.widthOfString(
            statusText
        );

    const statusWidth =
        Math.min(
            widths[1] - 14,
            Math.max(
                42,
                measuredStatusWidth + 16
            )
        );

    const statusHeight = 16;

    const statusX =
        x2 + 7;

    const statusY =
        y + 8;

    doc
        .roundedRect(
            statusX,
            statusY,
            statusWidth,
            statusHeight,
            8
        )
        .fill(
            COLORS.greenLight
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(7)
        .fillColor(COLORS.green)
        .text(
            statusText,
            statusX + 4,
            statusY + 4,
            {
                width:
                    statusWidth - 8,
                height: 9,
                align: "center",
                ellipsis: true
            }
        );

    doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(COLORS.dark)
        .text(
            safeValue(remark),
            x3 + 7,
            y + 10,
            {
                width:
                    widths[2] - 14,
                height:
                    height - 16
            }
        );

    return y + height;
};

// ======================================================
// NORMALIZE IMAGE PATH
// ======================================================

const normalizeImagePath = (
    image
) => {
    if (!image) {
        return null;
    }

    if (typeof image === "string") {
        return image;
    }

    return firstValue(
        image,
        [
            "image_path",
            "imagePath",
            "file_path",
            "filePath",
            "path",
            "url",
            "image_url",
            "imageUrl",
            "filename",
            "fileName",
            "file_name"
        ],
        null
    );
};

// ======================================================
// RESOLVE VEHICLE IMAGE PATH
// ======================================================

const resolveVehicleImagePath = (
    imagePath
) => {
    if (!imagePath) {
        return null;
    }

    let value =
        String(imagePath).trim();

    if (!value) {
        return null;
    }

    value =
        value.replace(
            /\\/g,
            "/"
        );

    value =
        value.replace(
            /^https?:\/\/[^/]+/i,
            ""
        );

    try {
        value =
            decodeURIComponent(
                value
            );
    } catch (error) {
        // Ignore
    }

    value =
        value
            .split("?")[0]
            .split("#")[0];

    if (
        path.isAbsolute(value)
    ) {
        try {
            if (
                fs.existsSync(value)
            ) {
                return value;
            }
        } catch (error) {
            // Continue
        }
    }

    value =
        value.replace(
            /^\/+/,
            ""
        );

    const withoutUploads =
        value.replace(
            /^uploads\//i,
            ""
        );

    const withoutPublic =
        value.replace(
            /^public\//i,
            ""
        );

    const candidates = [
        path.join(
            process.cwd(),
            value
        ),

        path.join(
            process.cwd(),
            "uploads",
            withoutUploads
        ),

        path.join(
            process.cwd(),
            "public",
            value
        ),

        path.join(
            process.cwd(),
            "public",
            withoutPublic
        ),

        path.join(
            __dirname,
            value
        ),

        path.join(
            __dirname,
            "uploads",
            withoutUploads
        ),

        path.join(
            __dirname,
            "..",
            value
        ),

        path.join(
            __dirname,
            "..",
            "uploads",
            withoutUploads
        )
    ];

    for (
        const candidate of candidates
    ) {
        try {
            if (
                fs.existsSync(
                    candidate
                )
            ) {
                return candidate;
            }
        } catch (error) {
            // Continue
        }
    }

    return null;
};

// ======================================================
// GET VEHICLE IMAGES
// ======================================================

const getVehicleImagesForPdf = async (
    carId
) => {
    try {
        const images =
            await vehicleImageService.getVehicleImages(
                Number(carId)
            );

        if (
            !Array.isArray(images)
        ) {
            return [];
        }

        return images
            .map(
                (
                    image,
                    index
                ) => {
                    const imagePath =
                        normalizeImagePath(
                            image
                        );

                    const filePath =
                        resolveVehicleImagePath(
                            imagePath
                        );

                    return {
                        ...(
                            image &&
                            typeof image === "object"
                                ? image
                                : {}
                        ),
                        imagePath,
                        filePath,
                        index:
                            index + 1
                    };
                }
            )
            .filter(
                (image) => {
                    if (
                        !image.filePath
                    ) {
                        return false;
                    }

                    try {
                        return fs.existsSync(
                            image.filePath
                        );
                    } catch (error) {
                        return false;
                    }
                }
            );
    } catch (error) {
        console.error(
            "Vehicle images could not be loaded for PDF:",
            error
        );

        return [];
    }
};

// ======================================================
// DRAW SINGLE VEHICLE PHOTO CARD
//
// IMPORTANT CHANGES:
// - Large portrait image
// - No image label
// - No image path
// - No Photo 1 / Photo 2 text
// - Image centered
// ======================================================

const drawVehiclePhotoCard = (
    doc,
    image,
    x,
    y,
    cardWidth,
    cardHeight
) => {
    const padding = 7;

    const imageBoxWidth =
        cardWidth -
        padding * 2;

    const imageBoxHeight =
        cardHeight -
        padding * 2;

    // Card
    doc
        .roundedRect(
            x,
            y,
            cardWidth,
            cardHeight,
            6
        )
        .fillAndStroke(
            COLORS.white,
            COLORS.border
        );

    // Image background
    doc
        .rect(
            x + padding,
            y + padding,
            imageBoxWidth,
            imageBoxHeight
        )
        .fill(
            COLORS.white
        );

    try {
        // ==================================================
        // IMPORTANT:
        // fit keeps original image ratio.
        // This makes portrait images look like screenshot.
        // ==================================================

        doc.image(
            image.filePath,
            x + padding,
            y + padding,
            {
                fit: [
                    imageBoxWidth,
                    imageBoxHeight
                ],
                align: "center",
                valign: "center"
            }
        );
    } catch (error) {
        console.error(
            "Unable to add vehicle image:",
            image.filePath,
            error
        );

        doc
            .font("Helvetica")
            .fontSize(8)
            .fillColor(COLORS.gray)
            .text(
                "Image could not be loaded",
                x + padding,
                y +
                    cardHeight / 2 -
                    5,
                {
                    width:
                        imageBoxWidth,
                    align: "center"
                }
            );
    }
};

// ======================================================
// DRAW VEHICLE PHOTOS
//
// Layout:
// 2 columns
// Large portrait photos
// No labels
// No paths
// ======================================================

const drawVehiclePhotos = (
    doc,
    images,
    reportId
) => {
    if (
        !Array.isArray(images) ||
        images.length === 0
    ) {
        return;
    }

    // Start photos on fresh page
    doc.addPage();

    let y = MARGIN_TOP;

    y = drawSectionHeader(
        doc,
        "Vehicle Photos",
        y
    );

    doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(COLORS.gray)
        .text(
            `Total uploaded photos: ${images.length}`,
            MARGIN_LEFT,
            y + 5,
            {
                width:
                    CONTENT_WIDTH
            }
        );

    y += 25;

    // ==================================================
    // PHOTO GRID
    // ==================================================

    const gap = 10;
    const columns = 2;

    const cardWidth =
        (
            CONTENT_WIDTH -
            gap
        ) / columns;

    // Bigger than old 210
    // This gives screenshot-like portrait cards.
    const cardHeight = 235;

    for (
        let index = 0;
        index < images.length;
        index++
    ) {
        const column =
            index % columns;

        // New row
        if (
            column === 0 &&
            index !== 0
        ) {
            y +=
                cardHeight +
                gap;
        }

        // ==================================================
        // NEW PAGE
        // ==================================================

        if (
            y + cardHeight >
            PAGE_BOTTOM
        ) {
            drawFooter(
                doc,
                doc.page.number,
                reportId
            );

            doc.addPage();

            y = MARGIN_TOP;

            y = drawSectionHeader(
                doc,
                "Vehicle Photos - Continued",
                y
            );

            y += 25;
        }

        const x =
            MARGIN_LEFT +
            column *
                (
                    cardWidth +
                    gap
                );

        drawVehiclePhotoCard(
            doc,
            images[index],
            x,
            y,
            cardWidth,
            cardHeight
        );
    }

    // Footer final photo page
    drawFooter(
        doc,
        doc.page.number,
        reportId
    );
};

// ======================================================
// BUILD NORMALIZED REPORT
// ======================================================

const buildNormalizedReport = (
    report
) => {
    const vehicleData =
        report.vehicle &&
        typeof report.vehicle === "object"
            ? report.vehicle
            : {};

    const ownerData =
        report.owner &&
        typeof report.owner === "object"
            ? report.owner
            : {};

    const inspectionData =
        report.inspection &&
        typeof report.inspection === "object"
            ? report.inspection
            : {};

    return {
        ...vehicleData,
        ...ownerData,
        ...inspectionData,
        ...report,

        vehicle: vehicleData,
        owner: ownerData,
        inspection: inspectionData,

        overallScore:
            normalizeScore(
                firstValue(
                    report,
                    [
                        "overallScore",
                        "overall_score",
                        "score"
                    ],
                    firstValue(
                        inspectionData,
                        [
                            "overallScore",
                            "overall_score",
                            "score"
                        ],
                        null
                    )
                )
            ),

        engineRemark:
            firstValue(
                report,
                [
                    "engineRemark",
                    "engine_remark",
                    "engineNotes",
                    "engine_notes"
                ],
                firstValue(
                    inspectionData,
                    [
                        "engineRemark",
                        "engine_remark",
                        "engineNotes",
                        "engine_notes"
                    ],
                    "Not provided."
                )
            ),

        overallRemark:
            firstValue(
                report,
                [
                    "overallRemark",
                    "overall_remark",
                    "remarks",
                    "remark",
                    "comments",
                    "comment"
                ],
                firstValue(
                    inspectionData,
                    [
                        "overallRemark",
                        "overall_remark",
                        "remarks",
                        "remark",
                        "comments",
                        "comment"
                    ],
                    "Vehicle inspection completed."
                )
            ),

        vehicleNote:
            firstValue(
                report,
                [
                    "vehicleNote",
                    "vehicle_note",
                    "note",
                    "vehicleNotes",
                    "vehicle_notes"
                ],
                firstValue(
                    vehicleData,
                    [
                        "vehicleNote",
                        "vehicle_note",
                        "note",
                        "vehicleNotes",
                        "vehicle_notes"
                    ],
                    "-"
                )
            )
    };
};

// ======================================================
// GENERATE INSPECTION REPORT PDF
// ======================================================

const generateInspectionReportPdf = (
    report
) => {
    return new Promise(
        (
            resolve,
            reject
        ) => {
            (async () => {
                let settled = false;

                const resolveOnce = (
                    value
                ) => {
                    if (settled) {
                        return;
                    }

                    settled = true;
                    resolve(value);
                };

                const rejectOnce = (
                    error
                ) => {
                    if (settled) {
                        return;
                    }

                    settled = true;
                    reject(error);
                };

                try {
                    // ==================================================
                    // VALIDATE REPORT
                    // ==================================================

                    if (!report) {
                        return rejectOnce(
                            new Error(
                                "Inspection report data is missing."
                            )
                        );
                    }

                    const reportId =
                        getReportId(
                            report
                        );

                    if (
                        reportId === "-" ||
                        reportId === null ||
                        reportId === undefined
                    ) {
                        return rejectOnce(
                            new Error(
                                "Report ID is missing."
                            )
                        );
                    }

                    // ==================================================
                    // CAR ID
                    //
                    // Required internally for fetching images.
                    // NOT SHOWN ANYWHERE IN PDF.
                    // ==================================================

                    const carId =
                        getCarId(
                            report
                        );

                    if (
                        carId === "-" ||
                        carId === null ||
                        carId === undefined
                    ) {
                        return rejectOnce(
                            new Error(
                                "Car ID is missing."
                            )
                        );
                    }

                    // ==================================================
                    // LOAD VEHICLE IMAGES
                    // ==================================================

                    const vehicleImages =
                        await getVehicleImagesForPdf(
                            carId
                        );

                    console.log(
                        "Vehicle images loaded for PDF:",
                        vehicleImages.length
                    );

                    // ==================================================
                    // REPORT DIRECTORY
                    // ==================================================

                    const reportsDirectory =
                        path.join(
                            process.cwd(),
                            "uploads",
                            "reports"
                        );

                    if (
                        !fs.existsSync(
                            reportsDirectory
                        )
                    ) {
                        fs.mkdirSync(
                            reportsDirectory,
                            {
                                recursive: true
                            }
                        );
                    }

                    // ==================================================
                    // FILE NAME
                    //
                    // Car ID can remain in filename.
                    // It is NOT visible inside PDF.
                    // ==================================================

                    const fileName =
                        `car-${carId}-inspection-report-${reportId}.pdf`;

                    const filePath =
                        path.join(
                            reportsDirectory,
                            fileName
                        );

                    // ==================================================
                    // CREATE PDF
                    // ==================================================

                    const doc =
                        new PDFDocument({
                            size: "A4",
                            margin: 0,
                            autoFirstPage: true,
                            bufferPages: false
                        });

                    const stream =
                        fs.createWriteStream(
                            filePath
                        );

                    // ==================================================
                    // STREAM ERROR
                    // ==================================================

                    stream.on(
                        "error",
                        (error) => {
                            console.error(
                                "PDF Stream Error:",
                                error
                            );

                            rejectOnce(error);
                        }
                    );

                    // ==================================================
                    // PDF ERROR
                    // ==================================================

                    doc.on(
                        "error",
                        (error) => {
                            console.error(
                                "PDF Document Error:",
                                error
                            );

                            rejectOnce(error);
                        }
                    );

                    // ==================================================
                    // FINISH
                    // ==================================================

                    stream.on(
                        "finish",
                        () => {
                            console.log(
                                "Inspection Report PDF Generated:",
                                filePath
                            );

                            resolveOnce({
                                fileName,
                                filePath,
                                pdfPath:
                                    `uploads/reports/${fileName}`
                            });
                        }
                    );

                    doc.pipe(stream);

                    // ==================================================
                    // NORMALIZE DATA
                    // ==================================================

                    const normalizedReport =
                        buildNormalizedReport(
                            report
                        );

                    // ==================================================
                    // PAGE 1
                    // ==================================================

                    let y =
                        drawReportHeader(
                            doc,
                            normalizedReport
                        );

                    // ==================================================
                    // VEHICLE DETAILS
                    // ==================================================

                    y =
                        drawVehicleDetails(
                            doc,
                            normalizedReport,
                            y
                        );

                    // ==================================================
                    // OWNER DETAILS
                    // ==================================================

                    if (
                        y + 110 >
                        PAGE_BOTTOM
                    ) {
                        y =
                            addPageWithFooter(
                                doc,
                                reportId
                            );
                    }

                    y =
                        drawOwnerDetails(
                            doc,
                            normalizedReport,
                            y
                        );

                    // ==================================================
                    // INSPECTION SUMMARY
                    // ==================================================

                    if (
                        y + 100 >
                        PAGE_BOTTOM
                    ) {
                        y =
                            addPageWithFooter(
                                doc,
                                reportId
                            );
                    }

                    y =
                        drawInspectionSummary(
                            doc,
                            normalizedReport,
                            y
                        );

                    // ==================================================
                    // OPTIONAL ADDITIONAL DATA
                    // ==================================================
                    //
                    // This keeps working if required.
                    // CAR ID is excluded internally.
                    //
                    // ==================================================

                    /*
                    if (
                        y + 80 >
                        PAGE_BOTTOM
                    ) {
                        y =
                            addPageWithFooter(
                                doc,
                                reportId
                            );
                    }

                    y =
                        drawAdditionalVehicleData(
                            doc,
                            normalizedReport,
                            y
                        );
                    */

                    // ==================================================
                    // FOOTER CURRENT PAGE
                    // ==================================================

                    drawFooter(
                        doc,
                        doc.page.number,
                        reportId
                    );

                    // ==================================================
                    // CHECKLIST PAGE
                    // ==================================================

                    doc.addPage();

                    y =
                        MARGIN_TOP;

                    y =
                        drawSectionHeader(
                            doc,
                            "Inspection Checklist",
                            y
                        );

                    y += 8;

                    const checklist =
                        normalizeChecklist(
                            normalizedReport
                        );

                    const areaWidth = 190;
                    const statusWidth = 90;

                    const remarkWidth =
                        CONTENT_WIDTH -
                        areaWidth -
                        statusWidth;

                    const checklistWidths = [
                        areaWidth,
                        statusWidth,
                        remarkWidth
                    ];

                    y =
                        drawChecklistHeader(
                            doc,
                            MARGIN_LEFT,
                            y,
                            checklistWidths
                        );

                    // ==================================================
                    // CHECKLIST ROWS
                    // ==================================================

                    checklist.forEach(
                        (item) => {
                            const rowHeight =
                                getChecklistRowHeight(
                                    doc,
                                    item.area,
                                    item.status,
                                    item.remark,
                                    checklistWidths
                                );

                            if (
                                y + rowHeight >
                                PAGE_BOTTOM
                            ) {
                                y =
                                    addPageWithFooter(
                                        doc,
                                        reportId
                                    );

                                y =
                                    drawSectionHeader(
                                        doc,
                                        "Inspection Checklist - Continued",
                                        y
                                    );

                                y += 8;

                                y =
                                    drawChecklistHeader(
                                        doc,
                                        MARGIN_LEFT,
                                        y,
                                        checklistWidths
                                    );
                            }

                            y =
                                drawChecklistRow(
                                    doc,
                                    MARGIN_LEFT,
                                    y,
                                    checklistWidths,
                                    item.area,
                                    item.status,
                                    item.remark
                                );
                        }
                    );

                    // ==================================================
                    // CHECKLIST FOOTER
                    // ==================================================

                    drawFooter(
                        doc,
                        doc.page.number,
                        reportId
                    );

                    // ==================================================
                    // VEHICLE PHOTOS
                    // ==================================================

                    drawVehiclePhotos(
                        doc,
                        vehicleImages,
                        reportId
                    );

                    // ==================================================
                    // FINISH PDF
                    // ==================================================

                    doc.end();

                } catch (error) {
                    console.error(
                        "Generate Inspection PDF Error:",
                        error
                    );

                    rejectOnce(error);
                }
            })();
        }
    );
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
    generateInspectionReportPdf
};