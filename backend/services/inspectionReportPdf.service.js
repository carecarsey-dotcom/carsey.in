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
    PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

const PAGE_BOTTOM =
    PAGE_HEIGHT - MARGIN_BOTTOM;

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
// BASIC HELPERS
// ======================================================

const safeValue = (
    value,
    fallback = "-"
) => {
    if (
        value === undefined ||
        value === null ||
        value === "" ||
        (
            typeof value === "string" &&
            value.trim() === ""
        )
    ) {
        return fallback;
    }

    if (
        typeof value === "object"
    ) {
        try {
            return JSON.stringify(
                value
            );
        } catch (error) {
            return fallback;
        }
    }

    return String(value);
};

const isObject = (value) => {
    return (
        value &&
        typeof value === "object" &&
        !Array.isArray(value)
    );
};

const hasValue = (value) => {
    return !(
        value === undefined ||
        value === null ||
        value === "" ||
        (
            typeof value === "string" &&
            value.trim() === ""
        )
    );
};

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
        const value =
            object[key];

        if (hasValue(value)) {
            return value;
        }
    }

    return fallback;
};

const titleCase = (
    value
) => {
    return String(value)
        .replace(/[_-]+/g, " ")
        .replace(/\./g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(
            /\b\w/g,
            (char) =>
                char.toUpperCase()
        );
};

const normalizeScore = (
    value
) => {
    if (
        value === undefined ||
        value === null ||
        value === "" ||
        Number.isNaN(
            Number(value)
        )
    ) {
        return "-";
    }

    const numeric =
        Number(value);

    if (
        numeric > 10 &&
        numeric <= 100
    ) {
        return (
            numeric / 10
        ).toFixed(1);
    }

    return numeric.toFixed(1);
};

const formatPrice = (
    value
) => {
    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return "-";
    }

    if (
        typeof value === "string" &&
        value
            .toLowerCase()
            .includes("rs")
    ) {
        return value;
    }

    const numeric =
        Number(
            String(value)
                .replace(/,/g, "")
                .replace(/[₹$]/g, "")
        );

    if (
        Number.isNaN(numeric)
    ) {
        return String(value);
    }

    return `Rs. ${numeric.toLocaleString(
        "en-IN"
    )}`;
};

const formatDate = (
    value
) => {
    if (!value) {
        return "-";
    }

    if (
        typeof value === "string"
    ) {
        const match =
            value.match(
                /^(\d{2})[-/](\d{2})[-/](\d{4})$/
            );

        if (match) {
            return `${match[1]}/${match[2]}/${match[3]}`;
        }
    }

    try {
        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return String(value);
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );
    } catch (error) {
        return String(value);
    }
};

// ======================================================
// REPORT ID
// ======================================================

const getReportId = (
    report
) => {
    return firstValue(
        report,
        [
            "reportId",
            "report_id",
            "inspectionReportId",
            "inspection_report_id",
            "id"
        ],
        "-"
    );
};

// ======================================================
// FOOTER
// ======================================================

const drawFooter = (
    doc,
    reportId,
    pageNumber
) => {
    const currentPage =
        Number.isFinite(
            Number(pageNumber)
        )
            ? Number(pageNumber)
            : doc.page?.number || 1;

    doc.save();

    doc
        .strokeColor(
            COLORS.border
        )
        .lineWidth(0.5)
        .moveTo(
            MARGIN_LEFT,
            PAGE_HEIGHT - 25
        )
        .lineTo(
            PAGE_WIDTH -
                MARGIN_RIGHT,
            PAGE_HEIGHT - 25
        )
        .stroke();

    doc
        .font("Helvetica")
        .fontSize(7)
        .fillColor(
            COLORS.gray
        )
        .text(
            `Vehicle Inspection Report #${safeValue(
                reportId
            )}`,
            MARGIN_LEFT,
            PAGE_HEIGHT - 19,
            {
                width: 260,
                align: "left"
            }
        );

    doc
        .font("Helvetica")
        .fontSize(7)
        .fillColor(
            COLORS.gray
        )
        .text(
            `Page ${currentPage}`,
            PAGE_WIDTH -
                MARGIN_RIGHT -
                100,
            PAGE_HEIGHT - 19,
            {
                width: 100,
                align: "right"
            }
        );

    doc.restore();
};

// ======================================================
// NEW PAGE
// ======================================================

const addPageWithFooter = (
    doc,
    reportId,
    pageNumber
) => {
    doc.addPage();

    return MARGIN_TOP;
};

// ======================================================
// SECTION HEADER
// ======================================================

const drawSectionHeader = (
    doc,
    title,
    y
) => {
    const height = 28;

    doc
        .rect(
            MARGIN_LEFT,
            y,
            CONTENT_WIDTH,
            height
        )
        .fill(
            COLORS.navy
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor(
            COLORS.white
        )
        .text(
            safeValue(title),
            MARGIN_LEFT + 10,
            y + 7,
            {
                width:
                    CONTENT_WIDTH - 20
            }
        );

    return y + height;
};

// ======================================================
// FIELD
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
        .fillColor(
            COLORS.gray
        )
        .text(
            safeValue(
                label
            ).toUpperCase(),
            x,
            y,
            {
                width:
                    width - 12,
                height: 10,
                ellipsis: true
            }
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .fillColor(
            COLORS.dark
        )
        .text(
            safeValue(value),
            x,
            y + 11,
            {
                width:
                    width - 14,
                height: 24,
                ellipsis: true
            }
        );
};

// ======================================================
// MULTILINE FIELD
// ======================================================

const drawMultiLineField = (
    doc,
    x,
    y,
    width,
    height,
    label,
    value
) => {
    doc
        .font("Helvetica-Bold")
        .fontSize(6.5)
        .fillColor(
            COLORS.gray
        )
        .text(
            safeValue(
                label
            ).toUpperCase(),
            x,
            y,
            {
                width:
                    width - 12
            }
        );

    doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(
            COLORS.dark
        )
        .text(
            safeValue(value),
            x,
            y + 12,
            {
                width:
                    width - 12,
                height:
                    height - 16
            }
        );
};

// ======================================================
// JSON PARSE SAFE HELPER
// ======================================================

const parseJsonSafe = (data) => {
    if (!data) return null;
    let current = data;
    while (typeof current === "string") {
        try {
            const parsed = JSON.parse(current);
            current = parsed;
        } catch {
            break;
        }
    }
    return current;
};

// ======================================================
// VEHICLE OBJECT
// ======================================================

const getVehicleObject = (
    report
) => {
    if (
        report &&
        isObject(report.vehicle)
    ) {
        return report.vehicle;
    }

    if (
        report &&
        isObject(report.vehicleData)
    ) {
        return report.vehicleData;
    }

    const parsed = parseJsonSafe(report?.vehicle) || parseJsonSafe(report?.vehicleData);
    if (parsed && isObject(parsed)) {
        return parsed;
    }

    return {};
};

// ======================================================
// OWNER OBJECT
// ======================================================

const getOwnerObject = (
    report
) => {
    if (
        report &&
        isObject(report.owner)
    ) {
        return report.owner;
    }

    if (
        report &&
        isObject(report.customer)
    ) {
        return report.customer;
    }

    if (
        report &&
        isObject(
            report.customerDetails
        )
    ) {
        return report.customerDetails;
    }

    const parsed = parseJsonSafe(report?.owner) || parseJsonSafe(report?.customer) || parseJsonSafe(report?.customerDetails);
    if (parsed && isObject(parsed)) {
        return parsed;
    }

    return {};
};

// ======================================================
// INSPECTION OBJECT
// ======================================================

const getInspectionObject = (
    report
) => {
    if (
        report &&
        isObject(report.inspection)
    ) {
        return report.inspection;
    }

    const parsed = parseJsonSafe(report?.inspection);
    if (parsed && isObject(parsed)) {
        return parsed;
    }

    return {};
};

// ======================================================
// GET VALUE FROM REPORT / NESTED OBJECTS
// ======================================================

const getAnyValue = (
    report,
    objects,
    keys,
    fallback = "-"
) => {
    const sources = [
        report,
        ...objects
    ];

    for (
        const source of sources
    ) {
        const value =
            firstValue(
                source,
                keys,
                null
            );

        if (
            value !== null &&
            value !== undefined &&
            value !== "-"
        ) {
            return value;
        }
    }

    return fallback;
};

// ======================================================
// NORMALIZE REPORT
// ======================================================

const normalizeReport = (
    sourceReport
) => {
    const report =
        sourceReport &&
        typeof sourceReport === "object"
            ? sourceReport
            : parseJsonSafe(sourceReport) || {};

    const vehicleData =
        getVehicleObject(
            report
        );

    const ownerData =
        getOwnerObject(
            report
        );

    const inspectionData =
        getInspectionObject(
            report
        );

    const customerName =
        getAnyValue(
            report,
            [
                ownerData,
                vehicleData,
                inspectionData
            ],
            [
                "customer_name",
                "customerName",
                "owner_name",
                "ownerName",
                "name",
                "fullName",
                "full_name"
            ],
            "-"
        );

    const customerMobile =
        getAnyValue(
            report,
            [
                ownerData,
                vehicleData
            ],
            [
                "owner_mobile",
                "ownerMobile",
                "customer_mobile",
                "customerMobile",
                "mobile",
                "phone",
                "phoneNumber",
                "phone_number"
            ],
            "-"
        );

    const customerEmail =
        getAnyValue(
            report,
            [
                ownerData,
                vehicleData
            ],
            [
                "owner_email",
                "ownerEmail",
                "customer_email",
                "customerEmail",
                "email"
            ],
            "-"
        );

    const customerAddress =
        getAnyValue(
            report,
            [
                ownerData,
                vehicleData
            ],
            [
                "owner_address",
                "ownerAddress",
                "customer_address",
                "customerAddress",
                "address",
                "fullAddress",
                "full_address"
            ],
            "-"
        );

    /*
     * IMPORTANT:
     *
     * DO NOT replace detailedInspection
     * with checklist.
     *
     * Both values are kept separately.
     */

    const checklist =
        parseJsonSafe(report.checklist) ||
        parseJsonSafe(report.inspection_checklist) ||
        parseJsonSafe(report.inspectionChecklist) ||
        parseJsonSafe(report.checklists) ||
        parseJsonSafe(inspectionData.checklist) ||
        parseJsonSafe(inspectionData.inspection_checklist) ||
        parseJsonSafe(inspectionData.inspectionChecklist) ||
        parseJsonSafe(inspectionData.checklists) ||
        parseJsonSafe(vehicleData.checklist) ||
        {};

    const detailedInspection =
        parseJsonSafe(report.detailedInspection) ||
        parseJsonSafe(report.detailed_inspection) ||
        parseJsonSafe(inspectionData.detailedInspection) ||
        parseJsonSafe(inspectionData.detailed_inspection) ||
        parseJsonSafe(vehicleData.detailedInspection) ||
        {};

    const overallScore =
        getAnyValue(
            report,
            [
                inspectionData
            ],
            [
                "overallScore",
                "overall_score",
                "score"
            ],
            null
        );

    const engineRemark =
        getAnyValue(
            report,
            [
                inspectionData
            ],
            [
                "engineRemark",
                "engine_remark",
                "engineNotes",
                "engine_notes"
            ],
            "Not provided."
        );

    const overallRemark =
        getAnyValue(
            report,
            [
                inspectionData
            ],
            [
                "overallRemark",
                "overall_remark",
                "remarks",
                "remark",
                "comments",
                "comment"
            ],
            "Vehicle inspection completed."
        );

    const vehicleNote =
        getAnyValue(
            report,
            [
                vehicleData,
                inspectionData
            ],
            [
                "vehicleNote",
                "vehicle_note",
                "vehicleNotes",
                "vehicle_notes",
                "note"
            ],
            "-"
        );

    return {
        ...vehicleData,
        ...ownerData,
        ...inspectionData,
        ...report,

        customer_name:
            customerName,

        customerName:
            customerName,

        owner_name:
            customerName,

        ownerName:
            customerName,

        owner_mobile:
            customerMobile,

        ownerMobile:
            customerMobile,

        owner_email:
            customerEmail,

        ownerEmail:
            customerEmail,

        owner_address:
            customerAddress,

        ownerAddress:
            customerAddress,

        vehicle:
            vehicleData,

        owner:
            ownerData,

        inspection:
            inspectionData,

        checklist:
            checklist,

        inspection_checklist:
            checklist,

        inspectionChecklist:
            checklist,

        detailedInspection:
            detailedInspection,

        detailed_inspection:
            detailedInspection,

        overallScore:
            normalizeScore(
                overallScore
            ),

        engineRemark:
            engineRemark,

        overallRemark:
            overallRemark,

        vehicleNote:
            vehicleNote
    };
};

// ======================================================
// HTML FIELD VALUE
// ======================================================

const getVehicleFieldValue = (
    report,
    keys,
    fallback = "-"
) => {
    const vehicle =
        getVehicleObject(
            report
        );

    return firstValue(
        report,
        keys,
        firstValue(
            vehicle,
            keys,
            fallback
        )
    );
};

// ======================================================
// DRAW 3 COLUMN GRID
// ======================================================

const drawThreeColumnFields = (
    doc,
    report,
    fields,
    y,
    pageNumberRef
) => {
    const rowHeight = 43;

    const columnWidth =
        CONTENT_WIDTH / 3;

    for (
        let i = 0;
        i < fields.length;
        i += 3
    ) {
        if (
            y + rowHeight >
            PAGE_BOTTOM
        ) {
            pageNumberRef.value += 1;

            doc.addPage();

            drawFooter(
                doc,
                getReportId(report),
                pageNumberRef.value
            );

            y = MARGIN_TOP;

            y =
                drawSectionHeader(
                    doc,
                    "Continued",
                    y
                );

            y += 5;
        }

        const row =
            fields.slice(
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

        for (
            let column = 1;
            column < 3;
            column++
        ) {
            doc
                .strokeColor(
                    COLORS.border
                )
                .lineWidth(0.5)
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
                    y + rowHeight
                )
                .stroke();
        }

        row.forEach(
            (
                [label, value],
                index
            ) => {
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
// VEHICLE BASIC PARAMETERS
// ======================================================

const drawVehicleBasicParameters = (
    doc,
    report,
    y,
    pageNumberRef
) => {
    y =
        drawSectionHeader(
            doc,
            "Vehicle Basic Parameters",
            y
        );

    y += 5;

    const fields = [
        [
            "Brand / Make",
            getVehicleFieldValue(
                report,
                [
                    "brand",
                    "make",
                    "vehicleBrand"
                ]
            )
        ],

        [
            "Model Name",
            getVehicleFieldValue(
                report,
                [
                    "model",
                    "vehicleModel"
                ]
            )
        ],

        [
            "Variant",
            getVehicleFieldValue(
                report,
                [
                    "variant",
                    "vehicleVariant"
                ]
            )
        ],

        [
            "Manufacturing Year",
            getVehicleFieldValue(
                report,
                [
                    "manufacturing_year",
                    "manufacturingYear",
                    "year",
                    "manufactureYear"
                ]
            )
        ],

        [
            "Price",
            formatPrice(
                getVehicleFieldValue(
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
            "Odometer Reading",
            (() => {
                const value =
                    getVehicleFieldValue(
                        report,
                        [
                            "odometer",
                            "kilometers",
                            "kilometres",
                            "kmDriven",
                            "km_driven",
                            "mileage"
                        ],
                        ""
                    );

                if (!hasValue(value)) {
                    return "-";
                }

                const text =
                    String(value);

                if (
                    text
                        .toLowerCase()
                        .includes("km")
                ) {
                    return text;
                }

                return `${text} KM`;
            })()
        ],

        [
            "City Location",
            getVehicleFieldValue(
                report,
                [
                    "city",
                    "cityLocation",
                    "city_location",
                    "location"
                ]
            )
        ],

        [
            "Transmission",
            getVehicleFieldValue(
                report,
                [
                    "transmission"
                ]
            )
        ],

        [
            "Fuel Type",
            getVehicleFieldValue(
                report,
                [
                    "fuel_type",
                    "fuelType",
                    "fuel"
                ]
            )
        ]
    ];

    return drawThreeColumnFields(
        doc,
        report,
        fields,
        y,
        pageNumberRef
    );
};

// ======================================================
// CUSTOMER & INSPECTION DETAILS
// ======================================================

const drawCustomerInspectionDetails = (
    doc,
    report,
    y,
    pageNumberRef
) => {
    y += 12;

    if (
        y + 100 >
        PAGE_BOTTOM
    ) {
        pageNumberRef.value += 1;

        doc.addPage();

        drawFooter(
            doc,
            getReportId(report),
            pageNumberRef.value
        );

        y = MARGIN_TOP;
    }

    y =
        drawSectionHeader(
            doc,
            "Customer & Inspection Details",
            y
        );

    y += 5;

    const fields = [
        [
            "Customer Name",
            getAnyValue(
                report,
                [
                    getOwnerObject(report)
                ],
                [
                    "customer_name",
                    "customerName",
                    "owner_name",
                    "ownerName",
                    "name"
                ]
            )
        ],

        [
            "Owner Mobile",
            getAnyValue(
                report,
                [
                    getOwnerObject(report)
                ],
                [
                    "owner_mobile",
                    "ownerMobile",
                    "mobile",
                    "phone",
                    "phoneNumber"
                ]
            )
        ],

        [
            "Customer Email",
            getAnyValue(
                report,
                [
                    getOwnerObject(report)
                ],
                [
                    "owner_email",
                    "ownerEmail",
                    "email",
                    "customer_email",
                    "customerEmail"
                ]
            )
        ],

        [
            "Customer Address",
            getAnyValue(
                report,
                [
                    getOwnerObject(report)
                ],
                [
                    "owner_address",
                    "ownerAddress",
                    "address",
                    "customer_address",
                    "customerAddress"
                ]
            )
        ],

        [
            "Owner Classification",
            getVehicleFieldValue(
                report,
                [
                    "owner_classification",
                    "ownerClassification",
                    "ownerType",
                    "owner_type"
                ]
            )
        ],

        [
            "Variant Name",
            getVehicleFieldValue(
                report,
                [
                    "variant_name",
                    "variantName"
                ]
            )
        ],

        [
            "Chassis Number",
            getVehicleFieldValue(
                report,
                [
                    "chassis_number",
                    "chassisNumber",
                    "chassisNo",
                    "chassis_no"
                ]
            )
        ],

        [
            "Engine Number",
            getVehicleFieldValue(
                report,
                [
                    "engine_number",
                    "engineNumber",
                    "engineNo",
                    "engine_no"
                ]
            )
        ],

        [
            "Registration Number",
            getVehicleFieldValue(
                report,
                [
                    "registration_number",
                    "registrationNumber",
                    "registrationNo",
                    "registration_no",
                    "regNumber",
                    "reg_no"
                ]
            )
        ],

        [
            "Inspection Date",
            formatDate(
                getVehicleFieldValue(
                    report,
                    [
                        "inspection_date",
                        "inspectionDate",
                        "inspectionDateTime"
                    ],
                    ""
                )
            )
        ],

        [
            "RTO",
            getVehicleFieldValue(
                report,
                [
                    "rto",
                    "rtoName",
                    "rto_name",
                    "rtoCode",
                    "rto_code"
                ]
            )
        ]
    ];

    return drawThreeColumnFields(
        doc,
        report,
        fields,
        y,
        pageNumberRef
    );
};

// ======================================================
// SHORT REMARKS
// ======================================================

const drawShortRemarks = (
    doc,
    report,
    y,
    pageNumberRef
) => {
    y += 12;

    if (
        y + 100 >
        PAGE_BOTTOM
    ) {
        pageNumberRef.value += 1;

        doc.addPage();

        drawFooter(
            doc,
            getReportId(report),
            pageNumberRef.value
        );

        y = MARGIN_TOP;
    }

    y =
        drawSectionHeader(
            doc,
            "Vehicle Basic Info - Short Remarks",
            y
        );

    y += 5;

    const fields = [
        [
            "Variant Short Note",
            getVehicleFieldValue(
                report,
                [
                    "variant_short_note",
                    "variantShortNote"
                ]
            )
        ],

        [
            "Registration RTO Short Note",
            getVehicleFieldValue(
                report,
                [
                    "registration_rto_short_note",
                    "registrationRtoShortNote",
                    "registrationRTOShortNote"
                ]
            )
        ],

        [
            "Spare Key Availability",
            getVehicleFieldValue(
                report,
                [
                    "spare_key",
                    "spareKey",
                    "spare_keys",
                    "spareKeys"
                ]
            )
        ],

        [
            "Insurance Type",
            getVehicleFieldValue(
                report,
                [
                    "insurance_type",
                    "insuranceType",
                    "insurance"
                ]
            )
        ],

        [
            "Insurance Validity",
            formatDate(
                getVehicleFieldValue(
                    report,
                    [
                        "insurance_validity",
                        "insuranceValidity",
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
            "Price Short Note",
            getVehicleFieldValue(
                report,
                [
                    "price_short_note",
                    "priceShortNote",
                    "priceNote",
                    "price_note"
                ]
            )
        ]
    ];

    return drawThreeColumnFields(
        doc,
        report,
        fields,
        y,
        pageNumberRef
    );
};

// ======================================================
// TEXT BOX
// ======================================================

const drawRemarkBox = (
    doc,
    x,
    y,
    width,
    height,
    title,
    value
) => {
    doc
        .rect(
            x,
            y,
            width,
            height
        )
        .fillAndStroke(
            COLORS.white,
            COLORS.border
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(7)
        .fillColor(
            COLORS.gray
        )
        .text(
            title.toUpperCase(),
            x + 8,
            y + 8,
            {
                width:
                    width - 16
            }
        );

    doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(
            COLORS.dark
        )
        .text(
            safeValue(value),
            x + 8,
            y + 22,
            {
                width:
                    width - 16,
                height:
                    height - 28
            }
        );
};

// ======================================================
// VEHICLE REMARKS
// ======================================================

const drawVehicleRemarks = (
    doc,
    report,
    y,
    pageNumberRef
) => {
    y += 12;

    if (
        y + 180 >
        PAGE_BOTTOM
    ) {
        pageNumberRef.value += 1;

        doc.addPage();

        drawFooter(
            doc,
            getReportId(report),
            pageNumberRef.value
        );

        y = MARGIN_TOP;
    }

    y =
        drawSectionHeader(
            doc,
            "Vehicle Remarks",
            y
        );

    y += 6;

    const gap = 8;

    const boxWidth =
        (CONTENT_WIDTH - gap) /
        2;

    const boxHeight = 75;

    const vehicleNote =
        getAnyValue(
            report,
            [
                getVehicleObject(report)
            ],
            [
                "vehicle_note",
                "vehicleNote",
                "vehicleNotes",
                "vehicle_notes",
                "note"
            ],
            "-"
        );

    const engineRemark =
        getAnyValue(
            report,
            [
                getInspectionObject(report)
            ],
            [
                "engineRemark",
                "engine_remark",
                "engineNotes",
                "engine_notes"
            ],
            "Not provided."
        );

    const overallRemark =
        getAnyValue(
            report,
            [
                getInspectionObject(report)
            ],
            [
                "overallRemark",
                "overall_remark",
                "remarks",
                "remark",
                "comments",
                "comment"
            ],
            "Vehicle inspection completed."
        );

    drawRemarkBox(
        doc,
        MARGIN_LEFT,
        y,
        boxWidth,
        boxHeight,
        "Vehicle Note",
        vehicleNote
    );

    drawRemarkBox(
        doc,
        MARGIN_LEFT +
            boxWidth +
            gap,
        y,
        boxWidth,
        boxHeight,
        "Engine Remark",
        engineRemark
    );

    y +=
        boxHeight +
        gap;

    drawRemarkBox(
        doc,
        MARGIN_LEFT,
        y,
        CONTENT_WIDTH,
        boxHeight,
        "Overall Remark",
        overallRemark
    );

    y +=
        boxHeight +
        10;

    return y;
};

// ======================================================
// VEHICLE STATUS
// ======================================================

const drawVehicleStatus = (
    doc,
    report,
    y,
    pageNumberRef
) => {
    y += 5;

    if (
        y + 100 >
        PAGE_BOTTOM
    ) {
        pageNumberRef.value += 1;

        doc.addPage();

        drawFooter(
            doc,
            getReportId(report),
            pageNumberRef.value
        );

        y = MARGIN_TOP;
    }

    y =
        drawSectionHeader(
            doc,
            "Vehicle Status",
            y
        );

    y += 6;

    const status =
        firstValue(
            report,
            [
                "status",
                "vehicle_status",
                "vehicleStatus"
            ],
            "-"
        );

    const publishStatus =
        firstValue(
            report,
            [
                "publishStatus",
                "publish_status"
            ],
            "-"
        );

    const fields = [
        [
            "Vehicle Status",
            status
        ],
        [
            "Publish Status",
            publishStatus
        ]
    ];

    return drawThreeColumnFields(
        doc,
        report,
        fields,
        y,
        pageNumberRef
    );
};

// ======================================================
// OVERALL SCORE
// ======================================================

const drawOverallScore = (
    doc,
    report,
    y,
    pageNumberRef
) => {
    y += 8;

    if (
        y + 130 >
        PAGE_BOTTOM
    ) {
        pageNumberRef.value += 1;

        doc.addPage();

        drawFooter(
            doc,
            getReportId(report),
            pageNumberRef.value
        );

        y = MARGIN_TOP;
    }

    y =
        drawSectionHeader(
            doc,
            "Overall Score",
            y
        );

    y += 6;

    const score =
        firstValue(
            report,
            [
                "overallScore",
                "overall_score",
                "score"
            ],
            "-"
        );

    const boxHeight = 80;

    doc
        .rect(
            MARGIN_LEFT,
            y,
            CONTENT_WIDTH,
            boxHeight
        )
        .fillAndStroke(
            COLORS.lightBlue,
            COLORS.border
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(
            COLORS.gray
        )
        .text(
            "OVERALL SCORE",
            MARGIN_LEFT + 10,
            y + 10,
            {
                width:
                    CONTENT_WIDTH - 20,
                align: "center"
            }
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(28)
        .fillColor(
            COLORS.blue
        )
        .text(
            safeValue(score),
            MARGIN_LEFT + 10,
            y + 28,
            {
                width:
                    CONTENT_WIDTH - 20,
                align: "center"
            }
        );

    doc
        .font("Helvetica")
        .fontSize(7)
        .fillColor(
            COLORS.gray
        )
        .text(
            "out of 10",
            MARGIN_LEFT + 10,
            y + 61,
            {
                width:
                    CONTENT_WIDTH - 20,
                align: "center"
            }
        );

    return y +
        boxHeight +
        10;
};

// ======================================================
// INSPECTION SECTION LABELS
// ======================================================

const INSPECTION_SECTION_LABELS = {
    exterior:
        "EXTERIOR + TYRE",

    exterior_tyre:
        "EXTERIOR + TYRE",

    engine_transmission:
        "ENGINE + TRANSMISSION",

    engineTransmission:
        "ENGINE + TRANSMISSION",

    steering_suspension_brake:
        "STEERING + SUSPENSION + BRAKE",

    steeringSuspensionBrake:
        "STEERING + SUSPENSION + BRAKE",

    electrical_interior_features:
        "ELECTRICAL + INTERIOR + FEATURES",

    electricalInteriorFeatures:
        "ELECTRICAL + INTERIOR + FEATURES",

    ac_light:
        "AC + LIGHT",

    acLight:
        "AC + LIGHT",

    transmission:
        "TRANSMISSION",

    braking:
        "BRAKING",

    tyres_wheels:
        "TYRES + WHEELS",

    tyresWheels:
        "TYRES + WHEELS",

    documents_title:
        "DOCUMENTS + TITLE",

    documentsTitle:
        "DOCUMENTS + TITLE",

    interior_electricals:
        "INTERIOR + ELECTRICALS",

    engine_bay:
        "ENGINE BAY",

    transmission_system:
        "TRANSMISSION SYSTEM",

    suspension_steering:
        "SUSPENSION + STEERING",

    braking_system:
        "BRAKING SYSTEM",

    tires_wheels:
        "TIRES + WHEELS",

    electricals_ac:
        "ELECTRICALS + AC"
};

const getSectionLabel = (
    key
) => {
    return (
        INSPECTION_SECTION_LABELS[
            key
        ] ||
        titleCase(key)
    );
};

// ======================================================
// INSPECTION SPECIAL KEYS
// ======================================================

const SPECIAL_KEYS = new Set([
    "id",
    "checklist_id",
    "checklistid",
    "report_id",
    "reportid",
    "status",
    "created_at",
    "updated_at",
    "deleted_at",
    "remark",
    "remarks",
    "note",
    "notes",
    "comment",
    "comments",
    "observation",
    "observations",
    "result",
    "condition",
    "rating",
    "answer",
    "value",
    "selected",
    "selectedOption",
    "selectedOptions",
    "options",
    "label",
    "name",
    "title",
    "item",
    "category",
    "section",
    "group"
]);

// ======================================================
// FORMAT INSPECTION VALUE
// ======================================================

const formatInspectionValue = (
    value
) => {
    if (!hasValue(value)) {
        return "-";
    }

    if (
        Array.isArray(value)
    ) {
        return value
            .map(
                (item) =>
                    isObject(item)
                        ? JSON.stringify(
                              item
                          )
                        : String(item)
            )
            .join(", ");
    }

    if (
        isObject(value)
    ) {
        return Object.entries(
            value
        )
            .map(
                ([key, val]) =>
                    `${titleCase(
                        key
                    )}: ${formatInspectionValue(
                        val
                    )}`
            )
            .join(" | ");
    }

    if (
        typeof value === "boolean"
    ) {
        return value
            ? "Yes"
            : "No";
    }

    return String(value);
};

// ======================================================
// CHECKLIST ITEM VALUE
// ======================================================

const getItemStatus = (
    item
) => {
    if (
        !isObject(item)
    ) {
        return "-";
    }

    return firstValue(
        item,
        [
            "status",
            "result",
            "condition",
            "rating",
            "answer",
            "inspectionStatus",
            "inspection_status"
        ],
        "-"
    );
};

const getItemRemark = (
    item
) => {
    if (
        !isObject(item)
    ) {
        return "-";
    }

    return firstValue(
        item,
        [
            "remark",
            "remarks",
            "note",
            "notes",
            "comment",
            "comments",
            "observation",
            "observations"
        ],
        "-"
    );
};

const getItemOptions = (
    item
) => {
    if (
        !isObject(item)
    ) {
        return [];
    }

    const options =
        firstValue(
            item,
            [
                "selectedOptions",
                "selected_options",
                "options",
                "selected",
                "selectedOption"
            ],
            null
        );

    if (
        !hasValue(options)
    ) {
        return [];
    }

    if (
        Array.isArray(options)
    ) {
        return options;
    }

    return [options];
};

// ======================================================
// FLATTEN DETAILED INSPECTION
// ======================================================

const flattenDetailedInspection = (
    detailedInspection
) => {
    const rows = [];

    if (
        !detailedInspection
    ) {
        return rows;
    }

    if (
        Array.isArray(
            detailedInspection
        )
    ) {
        detailedInspection.forEach(
            (item, index) => {
                if (
                    isObject(item)
                ) {
                    rows.push({
                        section:
                            item.section ||
                            item.category ||
                            `Inspection ${index + 1}`,

                        item:
                            item.item ||
                            item.label ||
                            item.question ||
                            item.name ||
                            `Inspection ${index + 1}`,

                        status:
                            getItemStatus(
                                item
                            ),

                        options:
                            getItemOptions(
                                item
                            ),

                        remark:
                            getItemRemark(
                                item
                            )
                    });
                }
            }
        );

        return rows;
    }

    if (
        !isObject(
            detailedInspection
        )
    ) {
        return rows;
    }

    Object.entries(
        detailedInspection
    ).forEach(
        ([
            sectionKey,
            sectionValue
        ]) => {
            if (
                !hasValue(
                    sectionValue
                )
            ) {
                return;
            }

            const sectionLabel =
                getSectionLabel(
                    sectionKey
                );

            if (
                isObject(
                    sectionValue
                )
            ) {
                Object.entries(
                    sectionValue
                ).forEach(
                    ([
                        itemKey,
                        itemValue
                    ]) => {
                        if (
                            !hasValue(
                                itemValue
                            )
                        ) {
                            return;
                        }

                        if (
                            SPECIAL_KEYS.has(
                                itemKey
                            )
                        ) {
                            return;
                        }

                        if (
                            isObject(
                                itemValue
                            )
                        ) {
                            const options =
                                getItemOptions(
                                    itemValue
                                );

                            rows.push({
                                section:
                                    sectionLabel,

                                item:
                                    itemValue.item ||
                                    itemValue.label ||
                                    itemValue.name ||
                                    titleCase(
                                        itemKey
                                    ),

                                status:
                                    getItemStatus(
                                        itemValue
                                    ),

                                options:
                                    options,

                                remark:
                                    getItemRemark(
                                        itemValue
                                    )
                            });

                            Object.entries(
                                itemValue
                            ).forEach(
                                ([
                                    nestedKey,
                                    nestedValue
                                ]) => {
                                    if (
                                        SPECIAL_KEYS.has(
                                            nestedKey
                                        )
                                    ) {
                                        return;
                                    }

                                    if (
                                        hasValue(
                                            nestedValue
                                        )
                                    ) {
                                        rows.push({
                                            section:
                                                sectionLabel,

                                            item:
                                                `${itemValue.item ||
                                                    itemValue.label ||
                                                    titleCase(
                                                        itemKey
                                                    )} - ${titleCase(
                                                    nestedKey
                                                )}`,

                                            status:
                                                "-",

                                            options:
                                                Array.isArray(
                                                    nestedValue
                                                )
                                                    ? nestedValue
                                                    : [],

                                            remark:
                                                !Array.isArray(
                                                    nestedValue
                                                )
                                                    ? formatInspectionValue(
                                                          nestedValue
                                                      )
                                                    : "-"
                                        });
                                    }
                                }
                            );

                            return;
                        }

                        rows.push({
                            section:
                                sectionLabel,

                            item:
                                titleCase(
                                    itemKey
                                ),

                            status:
                                "-",

                            options:
                                Array.isArray(
                                    itemValue
                                )
                                    ? itemValue
                                    : [],

                            remark:
                                Array.isArray(
                                    itemValue
                                )
                                    ? "-"
                                    : formatInspectionValue(
                                          itemValue
                                      )
                        });
                    }
                );

                return;
            }

            rows.push({
                section:
                    sectionLabel,

                item:
                    sectionLabel,

                status:
                    "-",

                options:
                    [],

                remark:
                    formatInspectionValue(
                        sectionValue
                    )
            });
        }
    );

    return rows;
};

// ======================================================
// CHECKLIST OBJECT -> ROWS
// ======================================================

const flattenChecklist = (
    checklist
) => {
    const rows = [];

    if (
        Array.isArray(checklist)
    ) {
        checklist.forEach(
            (
                item,
                index
            ) => {
                if (
                    typeof item === "string"
                ) {
                    rows.push({
                        section:
                            `Inspection ${
                                index + 1
                            }`,

                        item: item,

                        status: "-",

                        options: [],

                        remark: "-"
                    });

                    return;
                }

                if (
                    !isObject(item)
                ) {
                    return;
                }

                rows.push({
                    section:
                        item.category ||
                        item.section ||
                        item.group ||
                        `Inspection ${
                            index + 1
                        }`,

                    item:
                        item.item ||
                        item.label ||
                        item.question ||
                        item.name ||
                        "-",

                    status:
                        getItemStatus(
                            item
                        ),

                    options:
                        getItemOptions(
                            item
                        ),

                    remark:
                        getItemRemark(
                            item
                        )
                });
            }
        );

        return rows;
    }

    if (
        !isObject(checklist)
    ) {
        return rows;
    }

    Object.entries(
        checklist
    ).forEach(
        ([
            sectionKey,
            sectionValue
        ]) => {
            if (
                !hasValue(
                    sectionValue
                )
            ) {
                return;
            }

            const sectionLabel =
                getSectionLabel(
                    sectionKey
                );

            if (
                isObject(
                    sectionValue
                )
            ) {
                if (
                    "status" in
                        sectionValue ||
                    "remark" in
                        sectionValue ||
                    "remarks" in
                        sectionValue ||
                    "result" in
                        sectionValue
                ) {
                    rows.push({
                        section:
                            sectionLabel,

                        item:
                            sectionValue.item ||
                            sectionValue.label ||
                            sectionValue.name ||
                            sectionLabel,

                        status:
                            getItemStatus(
                                sectionValue
                            ),

                        options:
                            getItemOptions(
                                sectionValue
                            ),

                        remark:
                            getItemRemark(
                                sectionValue
                            )
                    });

                    return;
                }

                Object.entries(
                    sectionValue
                ).forEach(
                    ([
                        itemKey,
                        itemValue
                    ]) => {
                        if (
                            !hasValue(
                                itemValue
                            )
                        ) {
                            return;
                        }

                        if (
                            SPECIAL_KEYS.has(
                                itemKey
                            )
                        ) {
                            return;
                        }

                        if (
                            isObject(
                                itemValue
                            )
                        ) {
                            rows.push({
                                section:
                                    sectionLabel,

                                item:
                                    itemValue.item ||
                                    itemValue.label ||
                                    itemValue.name ||
                                    titleCase(
                                        itemKey
                                    ),

                                status:
                                    getItemStatus(
                                        itemValue
                                    ),

                                options:
                                    getItemOptions(
                                        itemValue
                                    ),

                                remark:
                                    getItemRemark(
                                        itemValue
                                    )
                            });

                            return;
                        }

                        rows.push({
                            section:
                                sectionLabel,

                            item:
                                titleCase(
                                    itemKey
                                ),

                            status:
                                "-",

                            options:
                                Array.isArray(
                                    itemValue
                                )
                                    ? itemValue
                                    : [],

                            remark:
                                Array.isArray(
                                    itemValue
                                )
                                    ? "-"
                                    : formatInspectionValue(
                                          itemValue
                                      )
                        });
                    }
                );

                return;
            }

            rows.push({
                section:
                    sectionLabel,

                item:
                    sectionLabel,

                status:
                    "-",

                options: [],

                remark:
                    formatInspectionValue(
                        sectionValue
                    )
            });
        }
    );

    return rows;
};

// ======================================================
// DRAW CHECKLIST HEADER
// ======================================================

const drawChecklistTableHeader = (
    doc,
    y
) => {
    const col1 =
        CONTENT_WIDTH * 0.22;

    const col2 =
        CONTENT_WIDTH * 0.28;

    const col3 =
        CONTENT_WIDTH * 0.15;

    const col4 =
        CONTENT_WIDTH * 0.35;

    const widths = [
        col1,
        col2,
        col3,
        col4
    ];

    const xs = [
        MARGIN_LEFT,

        MARGIN_LEFT +
            col1,

        MARGIN_LEFT +
            col1 +
            col2,

        MARGIN_LEFT +
            col1 +
            col2 +
            col3
    ];

    const height = 27;

    doc
        .rect(
            MARGIN_LEFT,
            y,
            CONTENT_WIDTH,
            height
        )
        .fillAndStroke(
            COLORS.headerGray,
            COLORS.border
        );

    const headers = [
        "SECTION",
        "INSPECTION ITEM",
        "STATUS",
        "SELECTED OPTIONS / REMARK"
    ];

    headers.forEach(
        (
            header,
            index
        ) => {
            doc
                .font("Helvetica-Bold")
                .fontSize(6.5)
                .fillColor(
                    COLORS.gray
                )
                .text(
                    header,
                    xs[index] + 6,
                    y + 9,
                    {
                        width:
                            widths[index] - 12,
                        ellipsis: true
                    }
                );
        }
    );

    return {
        y:
            y + height,
        widths,
        xs,
        height
    };
};

// ======================================================
// SCREENSHOT PARSER & DRAW CHECKLIST
// ======================================================

const parseChecklistSections = (report) => {
    const parsed = parseJsonSafe(report) || (typeof report === "object" ? report : {});
    const inspectionObj = getInspectionObject(parsed);
    const vehicleObj = getVehicleObject(parsed);

    const candidates = [
        parsed.checklist?.checklist,
        parsed.checklist?.data,
        parsed.checklist?.categories,
        parsed.checklist?.items,
        parsed.checklist_data,
        parsed.checklist,
        parsed.inspection_checklist,
        parsed.inspectionChecklist,
        parsed.detailedInspection,
        parsed.detailed_inspection,
        inspectionObj.checklist?.checklist,
        inspectionObj.checklist?.data,
        inspectionObj.checklist,
        inspectionObj.checklist_data,
        inspectionObj.inspection_checklist,
        vehicleObj.checklist,
        vehicleObj.checklist_data
    ];

    let rawSource = null;

    for (const item of candidates) {
        const decoded = parseJsonSafe(item);
        if (decoded && typeof decoded === "object") {
            const keys = Object.keys(decoded);
            const nonMetaKeys = keys.filter(k => !SPECIAL_KEYS.has(k.toLowerCase()));

            if (nonMetaKeys.length > 0) {
                rawSource = decoded;
                break;
            }
        }
    }

    if (!rawSource) return [];

    const sections = [];

    const extractTickedOption = (itemKey, itemVal) => {
        const val = parseJsonSafe(itemVal);
        if (!val) return null;

        const label = titleCase(itemKey);
        let selectedOptions = [];

        if (isObject(val)) {
            const opts =
                val.selectedOptions ||
                val.selected ||
                val.options ||
                val.value ||
                val.answer ||
                val.checked ||
                val.result ||
                [];

            if (Array.isArray(opts)) {
                selectedOptions.push(...opts);
            } else if (hasValue(opts) && typeof opts !== "boolean") {
                selectedOptions.push(String(opts));
            } else if (typeof opts === "boolean" && opts) {
                selectedOptions.push("ok");
            }

            Object.entries(val).forEach(([propKey, propVal]) => {
                if (propVal === true && !selectedOptions.includes(propKey)) {
                    selectedOptions.push(titleCase(propKey));
                }
            });

            if (hasValue(val.remark) && !selectedOptions.includes(val.remark)) {
                selectedOptions.push(val.remark);
            }
            if (hasValue(val.comment) && !selectedOptions.includes(val.comment)) {
                selectedOptions.push(val.comment);
            }
        } else if (Array.isArray(val)) {
            selectedOptions.push(...val);
        } else if (typeof val === "string" && hasValue(val)) {
            selectedOptions.push(val);
        } else if (typeof val === "boolean" && val) {
            selectedOptions.push("ok");
        }

        if (selectedOptions.length === 0) return null;

        return {
            label,
            value: selectedOptions.join(", ")
        };
    };

    if (Array.isArray(rawSource)) {
        const defaultItems = [];
        rawSource.forEach((el, idx) => {
            if (!el || typeof el !== "object") return;
            const res = extractTickedOption(el.item || el.name || el.label || el.question || `Item ${idx + 1}`, el);
            if (res) defaultItems.push(res);
        });

        if (defaultItems.length > 0) {
            sections.push({
                title: "EXTERIOR + TYRE",
                items: defaultItems
            });
        }
        return sections;
    }

    Object.entries(rawSource).forEach(([secKey, secVal]) => {
        if (SPECIAL_KEYS.has(secKey.toLowerCase())) return;

        const parsedSection = parseJsonSafe(secVal);
        if (!parsedSection) return;

        const secTitle = INSPECTION_SECTION_LABELS[secKey.toLowerCase()] || secKey.replace(/[_-]+/g, " + ").toUpperCase();
        const items = [];

        if (isObject(parsedSection)) {
            Object.entries(parsedSection).forEach(([itKey, itVal]) => {
                if (SPECIAL_KEYS.has(itKey.toLowerCase())) return;
                const it = extractTickedOption(itKey, itVal);
                if (it) items.push(it);
            });
        } else if (Array.isArray(parsedSection)) {
            parsedSection.forEach((el, i) => {
                const it = extractTickedOption(el.item || el.name || `Item ${i + 1}`, el);
                if (it) items.push(it);
            });
        }

        if (items.length > 0) {
            sections.push({
                title: secTitle,
                items
            });
        }
    });

    return sections;
};

const drawDetailedInspection = (
    doc,
    report,
    y,
    pageNumberRef
) => {
    if (
        y + 80 >
        PAGE_BOTTOM
    ) {
        pageNumberRef.value += 1;

        doc.addPage();

        drawFooter(
            doc,
            getReportId(report),
            pageNumberRef.value
        );

        y = MARGIN_TOP;
    }

    y =
        drawSectionHeader(
            doc,
            "Detailed Vehicle Inspection Checklist",
            y
        );

    y += 12;

    const sections = parseChecklistSections(report);

    if (sections.length === 0) {
        doc.font("Helvetica").fontSize(8.5).fillColor(COLORS.gray)
            .text("No detailed inspection checklist data provided.", MARGIN_LEFT, y);
        return y + 25;
    }

    const col1Width = 190;
    const col2Width = CONTENT_WIDTH - col1Width;

    sections.forEach((section) => {
        if (y + 35 > PAGE_BOTTOM) {
            pageNumberRef.value += 1;
            doc.addPage();
            drawFooter(doc, getReportId(report), pageNumberRef.value);
            y = MARGIN_TOP;
        }

        // Section Title: EXTERIOR + TYRE / ENGINE + TRANSMISSION
        doc.font("Helvetica-Bold")
            .fontSize(9.5)
            .fillColor(COLORS.dark)
            .text(section.title, MARGIN_LEFT, y);

        y += 14;

        // Sub-items: Door Front RHS          Broking/Crack
        section.items.forEach((item) => {
            doc.font("Helvetica").fontSize(8.5);
            const valHeight = doc.heightOfString(item.value, { width: col2Width, lineGap: 2 });
            const itemHeight = Math.max(14, valHeight) + 4;

            if (y + itemHeight > PAGE_BOTTOM) {
                pageNumberRef.value += 1;
                doc.addPage();
                drawFooter(doc, getReportId(report), pageNumberRef.value);
                y = MARGIN_TOP;

                doc.font("Helvetica-Bold")
                    .fontSize(9.5)
                    .fillColor(COLORS.dark)
                    .text(`${section.title} (Continued)`, MARGIN_LEFT, y);
                y += 14;
            }

            // Left Column
            doc.font("Helvetica")
                .fontSize(8.5)
                .fillColor(COLORS.dark)
                .text(item.label, MARGIN_LEFT, y, { width: col1Width - 10 });

            // Right Column
            doc.font("Helvetica")
                .fontSize(8.5)
                .fillColor(COLORS.dark)
                .text(item.value, MARGIN_LEFT + col1Width, y, { width: col2Width, lineGap: 2 });

            y += itemHeight;
        });

        y += 12;
    });

    return y;
};

// ======================================================
// IMAGE HELPERS
// ======================================================

const normalizeImageArray = (
    value,
    category = ""
) => {
    const result = [];

    if (!value) {
        return result;
    }

    if (
        typeof value === "string"
    ) {
        result.push({
            path: value,
            category
        });

        return result;
    }

    if (
        Array.isArray(value)
    ) {
        value.forEach(
            (item) => {
                result.push(
                    ...normalizeImageArray(
                        item,
                        category
                    )
                );
            }
        );

        return result;
    }

    if (
        isObject(value)
    ) {
        const directPath =
            value.path ||
            value.filePath ||
            value.file_path ||
            value.url ||
            value.imageUrl ||
            value.image_url ||
            value.src ||
            value.image;

        if (
            typeof directPath ===
            "string"
        ) {
            result.push({
                path: directPath,
                category:
                    value.category ||
                    value.photoCategory ||
                    category
            });

            return result;
        }

        Object.entries(
            value
        ).forEach(
            ([
                key,
                child
            ]) => {
                result.push(
                    ...normalizeImageArray(
                        child,
                        category ||
                            key
                    )
                );
            }
        );
    }

    return result;
};

// ======================================================
// DYNAMIC MULTI-SOURCE IMAGE EXTRACTOR
// ======================================================

const extractAllImagesRecursive = (data, list = []) => {
    if (!data) return list;

    if (typeof data === "string") {
        const val = data.trim();
        if (
            val.match(/\.(jpg|jpeg|png|webp|avif)$/i) ||
            val.startsWith("/uploads/") ||
            val.startsWith("uploads/") ||
            val.includes("uploads")
        ) {
            list.push({ path: val, category: "Vehicle Photo" });
        }
        return list;
    }

    if (Array.isArray(data)) {
        data.forEach(item => extractAllImagesRecursive(item, list));
        return list;
    }

    if (isObject(data)) {
        const directPath =
            data.path ||
            data.filePath ||
            data.file_path ||
            data.url ||
            data.imageUrl ||
            data.image_url ||
            data.src ||
            data.image;

        if (typeof directPath === "string") {
            list.push({
                path: directPath,
                category: data.category || data.label || "Vehicle Photo"
            });
        } else {
            Object.values(data).forEach(val => extractAllImagesRecursive(val, list));
        }
    }

    return list;
};

const getReportImages = (
    report
) => {
    const parsed = parseJsonSafe(report) || (typeof report === "object" ? report : {});
    const collected = [];

    extractAllImagesRecursive(parsed.images, collected);
    extractAllImagesRecursive(parsed.vehicleImages, collected);
    extractAllImagesRecursive(parsed.vehicle_images, collected);
    extractAllImagesRecursive(parsed.vehiclePhotos, collected);
    extractAllImagesRecursive(parsed.vehicle_photos, collected);
    extractAllImagesRecursive(parsed.photoData, collected);
    extractAllImagesRecursive(parsed.standardPhotos, collected);

    const seen = new Set();
    return collected.filter(item => {
        if (!item.path || seen.has(item.path)) return false;
        seen.add(item.path);
        return true;
    });
};

// ======================================================
// RESOLVE RAILWAY IMAGE PATH
// ======================================================

const resolveUploadPath = (
    rawPath
) => {
    if (
        !rawPath
    ) {
        return null;
    }

    let imagePath =
        String(rawPath).trim();

    if (
        imagePath.startsWith(
            "file://"
        )
    ) {
        imagePath =
            imagePath.replace(
                /^file:\/\//,
                ""
            );
    }

    if (
        /^https?:\/\//i.test(
            imagePath
        )
    ) {
        try {
            const parsed =
                new URL(
                    imagePath
                );

            imagePath =
                decodeURIComponent(
                    parsed.pathname
                );
        } catch (error) {
            return null;
        }
    }

    const uploadsRoot =
        process.env.RAILWAY_VOLUME_MOUNT_PATH ||
        "/app/uploads";

    if (
        imagePath.startsWith(
            "/uploads/"
        )
    ) {
        return path.join(
            uploadsRoot,
            imagePath.replace(
                /^\/uploads\//,
                ""
            )
        );
    }

    if (
        imagePath.startsWith(
            "/app/uploads/"
        )
    ) {
        return imagePath;
    }

    if (
        imagePath.startsWith(
            "uploads/"
        )
    ) {
        return path.join(
            uploadsRoot,
            imagePath.replace(
                /^uploads\//,
                ""
            )
        );
    }

    if (
        path.isAbsolute(
            imagePath
        )
    ) {
        if (
            fs.existsSync(
                imagePath
            )
        ) {
            return imagePath;
        }

        return imagePath;
    }

    return path.join(
        uploadsRoot,
        imagePath
    );
};

// ======================================================
// GET IMAGE PATH
// ======================================================

const getImagePathFromItem = (
    item
) => {
    if (
        typeof item ===
        "string"
    ) {
        return item;
    }

    if (
        !item ||
        typeof item !==
            "object"
    ) {
        return null;
    }

    return (
        item.path ||
        item.filePath ||
        item.file_path ||
        item.url ||
        item.imageUrl ||
        item.image_url ||
        item.src ||
        item.image ||
        null
    );
};

// ======================================================
// DRAW PHOTO CATEGORY
// ======================================================

const drawPhotoCategory = (
    doc,
    category,
    y
) => {
    if (
        !category
    ) {
        return y;
    }

    doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(
            COLORS.dark
        )
        .text(
            titleCase(
                category
            ),
            MARGIN_LEFT,
            y,
            {
                width:
                    CONTENT_WIDTH
            }
        );

    return y + 14;
};

// ======================================================
// DRAW VEHICLE PHOTOS (CLEAN GRID, NO REPEAT HEADERS)
// ======================================================

const drawVehiclePhotos = async (
    doc,
    report,
    y,
    pageNumberRef
) => {
    const images =
        getReportImages(
            report
        );

    if (
        images.length === 0
    ) {
        return y;
    }

    const gap = 8;
    const columns = 2;
    const imgWidth = (CONTENT_WIDTH - gap * (columns - 1)) / columns;
    const imageHeight = 160;

    if (y + 35 + imageHeight > PAGE_BOTTOM) {
        pageNumberRef.value += 1;
        doc.addPage();
        drawFooter(doc, getReportId(report), pageNumberRef.value);
        y = MARGIN_TOP;
    }

    y = drawSectionHeader(doc, "STANDARD PHOTO", y);
    y += 8;

    for (
        let i = 0;
        i < images.length;
        i++
    ) {
        const image =
            images[i];

        let rawPath =
            getImagePathFromItem(
                image
            );

        if (
            !rawPath &&
            vehicleImageService &&
            typeof vehicleImageService.getImagePath ===
                "function"
        ) {
            try {
                rawPath =
                    await vehicleImageService.getImagePath(
                        image
                    );
            } catch (error) {
                console.error(
                    "Vehicle image path error:",
                    error
                );
            }
        }

        if (
            !rawPath
        ) {
            continue;
        }

        const resolvedPath =
            resolveUploadPath(
                rawPath
            );

        if (
            !resolvedPath
        ) {
            continue;
        }

        const column =
            i % columns;

        if (
            column === 0 &&
            y + imageHeight >
                PAGE_BOTTOM
        ) {
            pageNumberRef.value += 1;

            doc.addPage();

            drawFooter(
                doc,
                getReportId(report),
                pageNumberRef.value
            );

            y = MARGIN_TOP;
        }

        const x =
            MARGIN_LEFT +
            column *
                (
                    imgWidth +
                    gap
                );

        doc
            .rect(
                x,
                y,
                imgWidth,
                imageHeight
            )
            .fillAndStroke(
                COLORS.white,
                COLORS.border
            );

        if (fs.existsSync(resolvedPath)) {
            try {
                doc.image(
                    resolvedPath,
                    x + 4,
                    y + 4,
                    {
                        fit: [
                            imgWidth - 8,
                            imageHeight - 8
                        ],
                        align: "center",
                        valign: "center"
                    }
                );
            } catch (error) {
                doc
                    .font("Helvetica")
                    .fontSize(7.5)
                    .fillColor(
                        COLORS.gray
                    )
                    .text(
                        "Image could not be loaded.",
                        x + 8,
                        y + imageHeight / 2 - 4,
                        {
                            width:
                                imgWidth - 16,
                            align: "center"
                        }
                    );
            }
        } else {
            doc
                .font("Helvetica")
                .fontSize(7.5)
                .fillColor(
                    COLORS.gray
                )
                .text(
                    "Image not found",
                    x + 8,
                    y + imageHeight / 2 - 4,
                    {
                        width:
                            imgWidth - 16,
                        align: "center"
                    }
                );
        }

        if (
            column === columns - 1 ||
            i ===
                images.length - 1
        ) {
            y +=
                imageHeight +
                gap;
        }
    }

    return y + 6;
};

// ======================================================
// HEADER
// ======================================================

const drawHeader = (
    doc,
    report
) => {
    const reportId =
        getReportId(
            report
        );

    doc
        .rect(
            0,
            0,
            PAGE_WIDTH,
            72
        )
        .fill(
            COLORS.navy
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(18)
        .fillColor(
            COLORS.white
        )
        .text(
            "CARSEY.IN",
            MARGIN_LEFT,
            18
        );

    doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(
            "#CBD5E1"
        )
        .text(
            "VEHICLE INSPECTION REPORT",
            MARGIN_LEFT,
            43
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(
            COLORS.white
        )
        .text(
            `REPORT #${safeValue(
                reportId
            )}`,
            PAGE_WIDTH -
                MARGIN_RIGHT -
                130,
            27,
            {
                width: 130,
                align: "right"
            }
        );
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
                let settled =
                    false;

                const resolveOnce =
                    (
                        value
                    ) => {
                        if (
                            settled
                        ) {
                            return;
                        }

                        settled =
                            true;

                        resolve(
                            value
                        );
                    };

                const rejectOnce =
                    (
                        error
                    ) => {
                        if (
                            settled
                        ) {
                            return;
                        }

                        settled =
                            true;

                        reject(
                            error
                        );
                    };

                try {
                    const normalizedReport =
                        normalizeReport(
                            report
                        );

                    // ==================================================
                    // PDF GENERATION STATUS
                    // ==================================================
                    // The PDF is generated when the Employee submits the
                    // inspection. The vehicle/report does NOT need to be
                    // published at this stage.
                    //
                    // inspection_reports.publish_status remains "No" until
                    // the Admin approves and publishes the vehicle.
                    // Public/customer routes enforce publication separately.
                    // ==================================================

                    // ==================================================
                    // REPORT ID
                    // ==================================================

                    const reportId =
                        getReportId(
                            normalizedReport
                        );

                    // ==================================================
                    // RAILWAY UPLOADS
                    // ==================================================

                    const railwayUploads =
                        process.env
                            .RAILWAY_VOLUME_MOUNT_PATH ||
                        "/app/uploads";

                    const localUploads =
                        path.join(
                            process.cwd(),
                            "uploads"
                        );

                    const uploadsDir =
                        process.env
                            .RAILWAY_ENVIRONMENT ||
                        process.env
                            .RAILWAY_SERVICE_ID
                            ? railwayUploads
                            : localUploads;

                    const reportsDir =
                        path.join(
                            uploadsDir,
                            "inspection-reports"
                        );

                    if (
                        !fs.existsSync(
                            uploadsDir
                        )
                    ) {
                        fs.mkdirSync(
                            uploadsDir,
                            {
                                recursive:
                                    true
                            }
                        );
                    }

                    if (
                        !fs.existsSync(
                            reportsDir
                        )
                    ) {
                        fs.mkdirSync(
                            reportsDir,
                            {
                                recursive:
                                    true
                            }
                        );
                    }

                    const safeReportId =
                        String(
                            reportId
                        ).replace(
                            /[^a-zA-Z0-9_-]/g,
                            "_"
                        );

                    const fileName =
                        `inspection-report-${safeReportId}.pdf`;

                    const filePath =
                        path.join(
                            reportsDir,
                            fileName
                        );

                    const pdfPath =
                        `/uploads/inspection-reports/${fileName}`;

                    // ==================================================
                    // PDF
                    // ==================================================

                    const doc =
                        new PDFDocument({
                            size: "A4",
                            margin: 0,
                            autoFirstPage:
                                true
                        });

                    const writeStream =
                        fs.createWriteStream(
                            filePath
                        );

                    const pageNumberRef = {
                        value: 1
                    };

                    doc.pipe(
                        writeStream
                    );

                    // ==================================================
                    // PAGE 1 HEADER
                    // ==================================================

                    drawHeader(
                        doc,
                        normalizedReport
                    );

                    let y = 92;

                    // ==================================================
                    // 1. VEHICLE BASIC PARAMETERS
                    // ==================================================

                    y =
                        drawVehicleBasicParameters(
                            doc,
                            normalizedReport,
                            y,
                            pageNumberRef
                        );

                    // ==================================================
                    // 2. CUSTOMER & INSPECTION DETAILS
                    // ==================================================

                    y =
                        drawCustomerInspectionDetails(
                            doc,
                            normalizedReport,
                            y,
                            pageNumberRef
                        );

                    // ==================================================
                    // 3. SHORT REMARKS
                    // ==================================================

                    y =
                        drawShortRemarks(
                            doc,
                            normalizedReport,
                            y,
                            pageNumberRef
                        );

                    // ==================================================
                    // 4. STANDARD PHOTO (Clean Grid Layout)
                    // ==================================================

                    y =
                        await drawVehiclePhotos(
                            doc,
                            normalizedReport,
                            y,
                            pageNumberRef
                        );

                    // ==================================================
                    // 5. DETAILED VEHICLE INSPECTION CHECKLIST (Category -> Item -> Option)
                    // ==================================================

                    y += 10;

                    y =
                        drawDetailedInspection(
                            doc,
                            normalizedReport,
                            y,
                            pageNumberRef
                        );

                    // ==================================================
                    // 6. VEHICLE REMARKS
                    // ==================================================

                    y =
                        drawVehicleRemarks(
                            doc,
                            normalizedReport,
                            y,
                            pageNumberRef
                        );

                    // ==================================================
                    // 7. VEHICLE STATUS
                    // ==================================================

                    y =
                        drawVehicleStatus(
                            doc,
                            normalizedReport,
                            y,
                            pageNumberRef
                        );

                    // ==================================================
                    // 8. OVERALL SCORE
                    // ==================================================

                    y =
                        drawOverallScore(
                            doc,
                            normalizedReport,
                            y,
                            pageNumberRef
                        );

                    // ==================================================
                    // FINAL FOOTER
                    // ==================================================

                    drawFooter(
                        doc,
                        reportId,
                        pageNumberRef.value
                    );

                    // ==================================================
                    // FINALIZE
                    // ==================================================

                    doc.end();

                    writeStream.on(
                        "finish",
                        () => {
                            try {
                                if (
                                    !fs.existsSync(
                                        filePath
                                    )
                                ) {
                                    throw new Error(
                                        "Generated PDF file was not found."
                                    );
                                }

                                const stats =
                                    fs.statSync(
                                        filePath
                                    );

                                if (
                                    !stats.size
                                ) {
                                    throw new Error(
                                        "Generated PDF file is empty."
                                    );
                                }

                                resolveOnce({
                                    filePath,
                                    pdfPath,
                                    fileName,
                                    reportId,
                                    pageCount:
                                        pageNumberRef.value
                                });
                            } catch (error) {
                                rejectOnce(
                                    error
                                );
                            }
                        }
                    );

                    writeStream.on(
                        "error",
                        (
                            error
                        ) => {
                            rejectOnce(
                                error
                            );
                        }
                    );

                    doc.on(
                        "error",
                        (
                            error
                        ) => {
                            rejectOnce(
                                error
                            );
                        }
                    );
                } catch (error) {
                    console.error(
                        "Inspection PDF generation error:",
                        error
                    );

                    rejectOnce(
                        error
                    );
                }
            })();
        }
    );
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
    generateInspectionReportPdf
};