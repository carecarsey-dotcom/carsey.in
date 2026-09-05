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
            : {};

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
        report.checklist ||
        report.inspection_checklist ||
        report.inspectionChecklist ||
        report.checklists ||
        inspectionData.checklist ||
        inspectionData.inspection_checklist ||
        inspectionData.inspectionChecklist ||
        inspectionData.checklists ||
        {};

    const detailedInspection =
        report.detailedInspection ||
        report.detailed_inspection ||
        inspectionData.detailedInspection ||
        inspectionData.detailed_inspection ||
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
// HTML:
// Vehicle Basic Parameters
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
// Based on HTML inspection structure
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
    "status",
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

                        /*
                         * Section-level status/
                         * remark should not become
                         * an inspection item.
                         */
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

                            /*
                             * If there are additional
                             * arbitrary values inside
                             * this item, preserve them.
                             */
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
                /*
                 * If this object itself is
                 * one checklist item.
                 */
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
// DRAW DETAILED INSPECTION
// ======================================================

const drawDetailedInspection = (
    doc,
    report,
    y,
    pageNumberRef
) => {
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
            "Detailed Vehicle Inspection Checklist",
            y
        );

    y += 5;

    const detailed =
        report.detailedInspection ||
        report.detailed_inspection ||
        {};

    const checklist =
        report.checklist ||
        report.inspection_checklist ||
        {};

    /*
     * Prefer the actual detailedInspection
     * object because that contains the
     * individual HTML inspection items.
     *
     * Fallback to the 9 checklist sections
     * when detailedInspection is absent.
     */
    let rows =
        flattenDetailedInspection(
            detailed
        );

    if (
        rows.length === 0
    ) {
        rows =
            flattenChecklist(
                checklist
            );
    }

    /*
     * Last fallback:
     * some backend payloads may have only
     * inspection_checklist.
     */
    if (
        rows.length === 0
    ) {
        rows =
            flattenChecklist(
                report.inspection_checklist
            );
    }

    if (
        rows.length === 0
    ) {
        doc
            .rect(
                MARGIN_LEFT,
                y,
                CONTENT_WIDTH,
                50
            )
            .fillAndStroke(
                COLORS.white,
                COLORS.border
            );

        doc
            .font("Helvetica")
            .fontSize(8)
            .fillColor(
                COLORS.gray
            )
            .text(
                "No detailed inspection checklist data provided.",
                MARGIN_LEFT + 8,
                y + 18,
                {
                    width:
                        CONTENT_WIDTH - 16
                }
            );

        return y + 60;
    }

    let table =
        drawChecklistTableHeader(
            doc,
            y
        );

    y = table.y;

    rows.forEach(
        (row) => {
            const optionText =
                Array.isArray(
                    row.options
                ) &&
                row.options.length
                    ? row.options
                          .map(
                              (
                                  option
                              ) =>
                                  typeof option ===
                                  "object"
                                      ? formatInspectionValue(
                                            option
                                        )
                                      : String(
                                            option
                                        )
                          )
                          .join(", ")
                    : "";

            let rightText =
                optionText;

            const remarkText =
                safeValue(
                    row.remark,
                    ""
                );

            if (
                remarkText &&
                remarkText !== "-"
            ) {
                rightText =
                    rightText
                        ? `${rightText}\nRemark: ${remarkText}`
                        : `Remark: ${remarkText}`;
            }

            if (
                !rightText
            ) {
                rightText = "-";
            }

            const values = [
                safeValue(
                    row.section
                ),
                safeValue(
                    row.item
                ),
                safeValue(
                    row.status
                ),
                rightText
            ];

            const textWidths =
                table.widths.map(
                    (width) =>
                        width - 12
                );

            const heights =
                values.map(
                    (
                        value,
                        index
                    ) =>
                        doc.heightOfString(
                            value,
                            {
                                width:
                                    textWidths[
                                        index
                                    ],
                                font:
                                    index ===
                                    2
                                        ? "Helvetica-Bold"
                                        : "Helvetica",
                                fontSize: 7
                            }
                        )
                );

            const rowHeight =
                Math.max(
                    34,
                    Math.min(
                        110,
                        Math.max(
                            ...heights
                        ) + 16
                    )
                );

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
                        "Detailed Vehicle Inspection Checklist - Continued",
                        y
                    );

                y += 5;

                table =
                    drawChecklistTableHeader(
                        doc,
                        y
                    );

                y = table.y;
            }

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
                let i = 1;
                i < 4;
                i++
            ) {
                const x =
                    MARGIN_LEFT +
                    table.widths
                        .slice(
                            0,
                            i
                        )
                        .reduce(
                            (
                                a,
                                b
                            ) =>
                                a + b,
                            0
                        );

                doc
                    .strokeColor(
                        COLORS.border
                    )
                    .lineWidth(0.5)
                    .moveTo(
                        x,
                        y
                    )
                    .lineTo(
                        x,
                        y +
                            rowHeight
                    )
                    .stroke();
            }

            values.forEach(
                (
                    value,
                    index
                ) => {
                    doc
                        .font(
                            index ===
                                2
                                ? "Helvetica-Bold"
                                : "Helvetica"
                        )
                        .fontSize(7)
                        .fillColor(
                            COLORS.dark
                        )
                        .text(
                            value,
                            table.xs[
                                index
                            ] + 6,
                            y + 8,
                            {
                                width:
                                    table.widths[
                                        index
                                    ] - 12,
                                height:
                                    rowHeight - 12
                            }
                        );
                }
            );

            y += rowHeight;
        }
    );

    return y + 10;
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
// GET ALL REPORT IMAGES
// ======================================================

const getReportImages = (
    report
) => {
    const possibleSources = [
        report.images,
        report.vehicleImages,
        report.vehicle_images,
        report.photoData,
        report.vehiclePhotos,
        report.vehicle_photos
    ];

    for (
        const source of possibleSources
    ) {
        if (
            source &&
            (
                Array.isArray(
                    source
                ) ||
                typeof source ===
                    "object"
        )
        ) {
            const images =
                normalizeImageArray(
                    source
                );

            if (
                images.length
            ) {
                return images;
            }
        }
    }

    return [];
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

    /*
     * Full API URL:
     * https://api.carsey.in/uploads/vehicles/a.jpg
     */
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

    /*
     * Railway persistent volume.
     *
     * /app/uploads
     */
    const uploadsRoot =
        process.env.RAILWAY_VOLUME_MOUNT_PATH ||
        "/app/uploads";

    /*
     * /uploads/vehicles/a.jpg
     * ->
     * /app/uploads/vehicles/a.jpg
     */
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

    /*
     * /app/uploads/...
     */
    if (
        imagePath.startsWith(
            "/app/uploads/"
        )
    ) {
        return imagePath;
    }

    /*
     * Relative:
     * vehicles/a.jpg
     */
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

    /*
     * If already an absolute local path.
     */
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

        /*
         * Local absolute path may point
         * to /app/... in Railway.
         */
        return imagePath;
    }

    /*
     * Relative vehicle path.
     */
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
// DRAW VEHICLE PHOTOS
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
            "STANDARD PHOTO",
            y
        );

    y += 8;

    const imageGap = 10;

    const imageWidth =
        (
            CONTENT_WIDTH -
            imageGap
        ) / 2;

    const imageHeight =
        190;

    let lastCategory = null;

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

        if (
            !fs.existsSync(
                resolvedPath
            )
        ) {
            console.warn(
                "Vehicle image not found:",
                {
                    rawPath,
                    resolvedPath
                }
            );

            continue;
        }

        const category =
            image.category ||
            image.photoCategory ||
            "";

        /*
         * Category heading
         */
        if (
            category &&
            category !==
                lastCategory
        ) {
            /*
             * Start new category
             * on a clean page if required.
             */
            if (
                y + 220 >
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
                        "STANDARD PHOTO - Continued",
                        y
                    );

                y += 8;
            }

            y =
                drawPhotoCategory(
                    doc,
                    category,
                    y
                );

            lastCategory =
                category;
        }

        /*
         * Every two images form a row.
         */
        const column =
            i % 2;

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

            y =
                drawSectionHeader(
                    doc,
                    "STANDARD PHOTO - Continued",
                    y
                );

            y += 8;

            if (
                category
            ) {
                y =
                    drawPhotoCategory(
                        doc,
                        category,
                        y
                    );
            }
        }

        const x =
            MARGIN_LEFT +
            column *
                (
                    imageWidth +
                    imageGap
                );

        doc
            .rect(
                x,
                y,
                imageWidth,
                imageHeight
            )
            .fillAndStroke(
                COLORS.white,
                COLORS.border
            );

        try {
            doc.image(
                resolvedPath,
                x + 5,
                y + 5,
                {
                    fit: [
                        imageWidth - 10,
                        imageHeight - 10
                    ],
                    align: "center",
                    valign: "center"
                }
            );
        } catch (error) {
            console.error(
                "Error adding vehicle image:",
                {
                    rawPath,
                    resolvedPath,
                    error
                }
            );

            doc
                .font("Helvetica")
                .fontSize(8)
                .fillColor(
                    COLORS.gray
                )
                .text(
                    "Image could not be loaded.",
                    x + 10,
                    y + 20,
                    {
                        width:
                            imageWidth - 20,
                        align: "center"
                    }
                );
        }

        if (
            column === 1 ||
            i ===
                images.length - 1
        ) {
            y +=
                imageHeight +
                imageGap;
        }
    }

    return y;
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
                    // PUBLISHED CHECK
                    // ==================================================

                    const publishStatus =
                        firstValue(
                            normalizedReport,
                            [
                                "publishStatus",
                                "publish_status",
                                "status"
                            ],
                            "No"
                        );

                    const publishText =
                        String(
                            publishStatus
                        )
                            .trim()
                            .toLowerCase();

                    if (
                        publishText !==
                            "yes" &&
                        publishText !==
                            "published"
                    ) {
                        throw new Error(
                            "Inspection PDF can only be generated after vehicle/report is published."
                        );
                    }

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
                    // 4. STANDARD PHOTO
                    // ==================================================

                    y += 12;

                    if (
                        y + 100 >
                        PAGE_BOTTOM
                    ) {
                        pageNumberRef.value +=
                            1;

                        doc.addPage();

                        drawFooter(
                            doc,
                            reportId,
                            pageNumberRef.value
                        );

                        y =
                            MARGIN_TOP;
                    }

                    y =
                        await drawVehiclePhotos(
                            doc,
                            normalizedReport,
                            y,
                            pageNumberRef
                        );

                    // ==================================================
                    // 5. DETAILED VEHICLE INSPECTION CHECKLIST
                    // ==================================================

                    y += 10;

                    if (
                        y + 120 >
                        PAGE_BOTTOM
                    ) {
                        pageNumberRef.value +=
                            1;

                        doc.addPage();

                        drawFooter(
                            doc,
                            reportId,
                            pageNumberRef.value
                        );

                        y =
                            MARGIN_TOP;
                    }

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