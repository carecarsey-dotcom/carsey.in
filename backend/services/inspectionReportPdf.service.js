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

const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
const PAGE_BOTTOM = PAGE_HEIGHT - MARGIN_BOTTOM;

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

const safeValue = (value, fallback = "-") => {
    if (
        value === undefined ||
        value === null ||
        value === "" ||
        (typeof value === "string" && value.trim() === "")
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

const firstValue = (object, keys, fallback = "-") => {
    if (!object || typeof object !== "object") {
        return fallback;
    }

    for (const key of keys) {
        const value = object[key];

        if (
            value !== undefined &&
            value !== null &&
            value !== "" &&
            !(typeof value === "string" && value.trim() === "")
        ) {
            return value;
        }
    }

    return fallback;
};

const normalizeScore = (value) => {
    if (
        value === undefined ||
        value === null ||
        value === "" ||
        Number.isNaN(Number(value))
    ) {
        return "-";
    }

    const numeric = Number(value);

    if (numeric > 10 && numeric <= 100) {
        return `${(numeric / 10).toFixed(1)}`;
    }

    return numeric.toFixed(1);
};

const formatPrice = (value) => {
    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return "-";
    }

    if (typeof value === "string" && value.toLowerCase().includes("rs")) {
        return value;
    }

    const numeric = Number(String(value).replace(/,/g, ""));

    if (Number.isNaN(numeric)) {
        return String(value);
    }

    return `Rs. ${numeric.toLocaleString("en-IN")}`;
};

const formatDate = (value) => {
    if (!value) {
        return "-";
    }

    try {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return String(value);
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    } catch (error) {
        return String(value);
    }
};

const titleCase = (value) => {
    return String(value)
        .replace(/[_-]+/g, " ")
        .replace(/\./g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());
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
            "inspectionReportId",
            "inspection_report_id",
            "id"
        ],
        "-"
    );
};

// ======================================================
// PAGE NUMBER HELPER
// ======================================================

const addPageWithFooter = (doc, reportId, pageNumber) => {
    doc.addPage();

    drawFooter(
        doc,
        reportId,
        pageNumber
    );

    return MARGIN_TOP;
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
        Number.isFinite(Number(pageNumber))
            ? Number(pageNumber)
            : doc.page?.number || 1;

    doc.save();

    doc
        .strokeColor(COLORS.border)
        .lineWidth(0.5)
        .moveTo(
            MARGIN_LEFT,
            PAGE_HEIGHT - 25
        )
        .lineTo(
            PAGE_WIDTH - MARGIN_RIGHT,
            PAGE_HEIGHT - 25
        )
        .stroke();

    doc
        .font("Helvetica")
        .fontSize(7)
        .fillColor(COLORS.gray)
        .text(
            `Vehicle Inspection Report #${safeValue(reportId)}`,
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
        .fillColor(COLORS.gray)
        .text(
            `Page ${currentPage}`,
            PAGE_WIDTH - MARGIN_RIGHT - 100,
            PAGE_HEIGHT - 19,
            {
                width: 100,
                align: "right"
            }
        );

    doc.restore();
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
                width: CONTENT_WIDTH - 20,
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
            safeValue(label, "-").toUpperCase(),
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
// GET NESTED VEHICLE DATA
// ======================================================

const getVehicleObject = (report) => {
    if (
        report &&
        report.vehicle &&
        typeof report.vehicle === "object" &&
        !Array.isArray(report.vehicle)
    ) {
        return report.vehicle;
    }

    if (
        report &&
        report.vehicleData &&
        typeof report.vehicleData === "object" &&
        !Array.isArray(report.vehicleData)
    ) {
        return report.vehicleData;
    }

    return {};
};

// ======================================================
// GET OWNER OBJECT
// ======================================================

const getOwnerObject = (report) => {
    if (
        report &&
        report.owner &&
        typeof report.owner === "object" &&
        !Array.isArray(report.owner)
    ) {
        return report.owner;
    }

    if (
        report &&
        report.customer &&
        typeof report.customer === "object" &&
        !Array.isArray(report.customer)
    ) {
        return report.customer;
    }

    if (
        report &&
        report.customerDetails &&
        typeof report.customerDetails === "object" &&
        !Array.isArray(report.customerDetails)
    ) {
        return report.customerDetails;
    }

    return {};
};

// ======================================================
// NORMALIZE REPORT
// ======================================================

const normalizeReport = (sourceReport) => {
    const report =
        sourceReport &&
        typeof sourceReport === "object"
            ? sourceReport
            : {};

    const vehicleData = getVehicleObject(report);
    const ownerData = getOwnerObject(report);

    const inspectionData =
        report.inspection &&
        typeof report.inspection === "object"
            ? report.inspection
            : {};

    const customerName = firstValue(
        ownerData,
        [
            "ownerName",
            "owner_name",
            "customerName",
            "customer_name",
            "name",
            "fullName",
            "full_name",
            "customer",
            "customer_name"
        ],
        firstValue(
            vehicleData,
            [
                "ownerName",
                "owner_name",
                "customerName",
                "customer_name",
                "name",
                "fullName",
                "full_name"
            ],
            firstValue(
                report,
                [
                    "ownerName",
                    "owner_name",
                    "customerName",
                    "customer_name",
                    "name",
                    "fullName",
                    "full_name"
                ],
                "-"
            )
        )
    );

    const customerMobile = firstValue(
        ownerData,
        [
            "mobile",
            "ownerMobile",
            "owner_mobile",
            "customerMobile",
            "customer_mobile",
            "phone",
            "phoneNumber",
            "phone_number",
            "mobileNumber",
            "mobile_number"
        ],
        firstValue(
            vehicleData,
            [
                "mobile",
                "ownerMobile",
                "owner_mobile",
                "customerMobile",
                "customer_mobile",
                "phone",
                "phoneNumber",
                "phone_number",
                "mobileNumber",
                "mobile_number"
            ],
            firstValue(
                report,
                [
                    "mobile",
                    "ownerMobile",
                    "owner_mobile",
                    "customerMobile",
                    "customer_mobile",
                    "phone",
                    "phoneNumber",
                    "phone_number",
                    "mobileNumber",
                    "mobile_number"
                ],
                "-"
            )
        )
    );

    const customerEmail = firstValue(
        ownerData,
        [
            "email",
            "ownerEmail",
            "owner_email",
            "customerEmail",
            "customer_email"
        ],
        firstValue(
            vehicleData,
            [
                "email",
                "ownerEmail",
                "owner_email",
                "customerEmail",
                "customer_email"
            ],
            firstValue(
                report,
                [
                    "email",
                    "ownerEmail",
                    "owner_email",
                    "customerEmail",
                    "customer_email"
                ],
                "-"
            )
        )
    );

    const customerAddress = firstValue(
        ownerData,
        [
            "address",
            "ownerAddress",
            "owner_address",
            "customerAddress",
            "customer_address",
            "fullAddress",
            "full_address",
            "location",
            "city"
        ],
        firstValue(
            vehicleData,
            [
                "address",
                "ownerAddress",
                "owner_address",
                "customerAddress",
                "customer_address",
                "fullAddress",
                "full_address",
                "location",
                "city"
            ],
            firstValue(
                report,
                [
                    "address",
                    "ownerAddress",
                    "owner_address",
                    "customerAddress",
                    "customer_address",
                    "fullAddress",
                    "full_address",
                    "location",
                    "city"
                ],
                "-"
            )
        )
    );

    const checklist =
        report.checklist ||
        report.inspection_checklist ||
        report.inspectionChecklist ||
        report.checklists ||
        report.detailedInspection ||
        inspectionData.checklist ||
        inspectionData.inspection_checklist ||
        inspectionData.inspectionChecklist ||
        inspectionData.checklists ||
        inspectionData.detailedInspection ||
        [];

    const mergedVehicle = {
        ...vehicleData,

        customer_name: customerName,
        customerName: customerName,

        owner_name: customerName,
        ownerName: customerName,

        owner_mobile: customerMobile,
        ownerMobile: customerMobile,

        owner_email: customerEmail,
        ownerEmail: customerEmail,

        owner_address: customerAddress,
        ownerAddress: customerAddress
    };

    const mergedOwner = {
        ...ownerData,

        ownerName: customerName,
        owner_name: customerName,
        name: customerName,

        mobile: customerMobile,
        ownerMobile: customerMobile,
        owner_mobile: customerMobile,

        email: customerEmail,
        ownerEmail: customerEmail,
        owner_email: customerEmail,

        address: customerAddress,
        ownerAddress: customerAddress,
        owner_address: customerAddress
    };

    return {
        ...vehicleData,
        ...ownerData,
        ...inspectionData,
        ...report,

        customer_name: customerName,
        customerName: customerName,

        owner_name: customerName,
        ownerName: customerName,

        owner_mobile: customerMobile,
        ownerMobile: customerMobile,

        owner_email: customerEmail,
        ownerEmail: customerEmail,

        owner_address: customerAddress,
        ownerAddress: customerAddress,

        vehicle: mergedVehicle,
        owner: mergedOwner,

        inspection: inspectionData,

        checklist,
        inspection_checklist: checklist,
        inspectionChecklist: checklist,
        detailedInspection: checklist,

        overallScore: normalizeScore(
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

        engineRemark: firstValue(
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

        overallRemark: firstValue(
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

        vehicleNote: firstValue(
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

    const vehicle =
        getVehicleObject(report);

    const rowHeight = 43;
    const columnWidth =
        CONTENT_WIDTH / 3;

    const getVehicleValue = (
        keys,
        fallback = "-"
    ) => {
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

    const vehicleFields = [
        [
            "Brand",
            getVehicleValue([
                "brand",
                "make",
                "vehicleBrand"
            ])
        ],

        [
            "Model",
            getVehicleValue([
                "model",
                "vehicleModel"
            ])
        ],

        [
            "Variant",
            getVehicleValue([
                "variant",
                "vehicleVariant"
            ])
        ],

        [
            "Manufacturing Year",
            getVehicleValue([
                "manufacturingYear",
                "manufacturing_year",
                "year",
                "manufactureYear"
            ])
        ],

        [
            "Price",
            formatPrice(
                getVehicleValue([
                    "price",
                    "vehiclePrice",
                    "sellingPrice",
                    "askingPrice"
                ], "")
            )
        ],

        [
            "Price Note",
            getVehicleValue([
                "priceShortNote",
                "price_short_note",
                "priceNote",
                "price_note"
            ])
        ],

        [
            "Odometer",
            (() => {
                const value =
                    getVehicleValue(
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

                if (value === "-") {
                    return "-";
                }

                const stringValue =
                    String(value);

                if (
                    stringValue
                        .toLowerCase()
                        .includes("km")
                ) {
                    return stringValue;
                }

                return `${value} KM`;
            })()
        ],

        [
            "Fuel Type",
            getVehicleValue([
                "fuelType",
                "fuel_type",
                "fuel"
            ])
        ],

        [
            "Transmission",
            getVehicleValue([
                "transmission"
            ])
        ],

        [
            "Owner Classification",
            getVehicleValue([
                "ownerClassification",
                "owner_classification",
                "ownerType",
                "owner_type"
            ])
        ],

        [
            "Registration Number",
            getVehicleValue([
                "registrationNumber",
                "registration_number",
                "registrationNo",
                "registration_no",
                "regNumber",
                "reg_no"
            ])
        ],

        [
            "Chassis Number",
            getVehicleValue([
                "chassisNumber",
                "chassis_number",
                "chassisNo",
                "chassis_no"
            ])
        ],

        [
            "Engine Number",
            getVehicleValue([
                "engineNumber",
                "engine_number",
                "engineNo",
                "engine_no"
            ])
        ],

        [
            "Inspection Date",
            formatDate(
                getVehicleValue([
                    "inspectionDate",
                    "inspection_date",
                    "inspectionDateTime"
                ], "")
            )
        ],

        [
            "RTO",
            getVehicleValue([
                "rto",
                "rtoName",
                "rto_name",
                "rtoCode",
                "rto_code"
            ])
        ],

        [
            "Spare Key",
            getVehicleValue([
                "spareKey",
                "spare_key",
                "spareKeys",
                "spare_keys"
            ])
        ],

        [
            "Insurance Type",
            getVehicleValue([
                "insuranceType",
                "insurance_type",
                "insurance"
            ])
        ],

        [
            "Insurance Validity",
            formatDate(
                getVehicleValue([
                    "insuranceValidity",
                    "insurance_validity",
                    "insuranceExpiry",
                    "insurance_expiry",
                    "insuranceValidTill",
                    "insurance_valid_till"
                ], "")
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

        if (
            rowY + rowHeight >
            PAGE_BOTTOM
        ) {
            return y;
        }

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
                    rowY + rowHeight
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
            firstValue(
                vehicle,
                [
                    "vehicleNote",
                    "vehicle_note",
                    "note",
                    "vehicleNotes",
                    "vehicle_notes"
                ],
                "-"
            )
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
        "Customer / Owner Details",
        y
    );

    y += 5;

    const owner =
        getOwnerObject(report);

    const ownerName =
        firstValue(
            owner,
            [
                "ownerName",
                "owner_name",
                "customer_name",
                "customerName",
                "name",
                "fullName",
                "full_name"
            ],
            firstValue(
                report,
                [
                    "ownerName",
                    "owner_name",
                    "customer_name",
                    "customerName",
                    "name",
                    "fullName",
                    "full_name"
                ],
                "-"
            )
        );

    const mobile =
        firstValue(
            owner,
            [
                "mobile",
                "ownerMobile",
                "owner_mobile",
                "customerMobile",
                "customer_mobile",
                "phone",
                "phoneNumber",
                "phone_number",
                "mobileNumber",
                "mobile_number"
            ],
            firstValue(
                report,
                [
                    "mobile",
                    "ownerMobile",
                    "owner_mobile",
                    "customerMobile",
                    "customer_mobile",
                    "phone",
                    "phoneNumber",
                    "phone_number",
                    "mobileNumber",
                    "mobile_number"
                ],
                "-"
            )
        );

    const email =
        firstValue(
            owner,
            [
                "email",
                "ownerEmail",
                "owner_email",
                "customerEmail",
                "customer_email"
            ],
            firstValue(
                report,
                [
                    "email",
                    "ownerEmail",
                    "owner_email",
                    "customerEmail",
                    "customer_email"
                ],
                "-"
            )
        );

    const address =
        firstValue(
            owner,
            [
                "address",
                "ownerAddress",
                "owner_address",
                "customerAddress",
                "customer_address",
                "fullAddress",
                "full_address",
                "location",
                "city"
            ],
            firstValue(
                report,
                [
                    "address",
                    "ownerAddress",
                    "owner_address",
                    "customerAddress",
                    "customer_address",
                    "fullAddress",
                    "full_address",
                    "location",
                    "city"
                ],
                "-"
            )
        );

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
            MARGIN_LEFT + columnWidth,
            y
        )
        .lineTo(
            MARGIN_LEFT + columnWidth,
            y + rowHeight
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
            y + rowHeight
        )
        .stroke();

    drawField(
        doc,
        MARGIN_LEFT + 8,
        y + 8,
        columnWidth,
        "Owner Name",
        ownerName
    );

    drawField(
        doc,
        MARGIN_LEFT +
            columnWidth +
            8,
        y + 8,
        columnWidth,
        "Mobile",
        mobile
    );

    drawField(
        doc,
        MARGIN_LEFT +
            columnWidth * 2 +
            8,
        y + 8,
        columnWidth,
        "Email",
        email
    );

    y += rowHeight;

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

    const boxHeight = 90;

    doc
        .rect(
            MARGIN_LEFT,
            y,
            scoreWidth,
            boxHeight
        )
        .fillAndStroke(
            COLORS.lightBlue,
            COLORS.border
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(COLORS.gray)
        .text(
            "OVERALL SCORE",
            MARGIN_LEFT + 8,
            y + 10,
            {
                width: scoreWidth - 16,
                align: "center"
            }
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(24)
        .fillColor(COLORS.blue)
        .text(
            safeValue(score),
            MARGIN_LEFT + 8,
            y + 32,
            {
                width: scoreWidth - 16,
                align: "center"
            }
        );

    doc
        .font("Helvetica")
        .fontSize(7)
        .fillColor(COLORS.gray)
        .text(
            "out of 10",
            MARGIN_LEFT + 8,
            y + 65,
            {
                width: scoreWidth - 16,
                align: "center"
            }
        );

    const engineX =
        MARGIN_LEFT +
        scoreWidth +
        boxGap;

    doc
        .rect(
            engineX,
            y,
            remarkWidth,
            boxHeight
        )
        .fillAndStroke(
            COLORS.white,
            COLORS.border
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(7)
        .fillColor(COLORS.gray)
        .text(
            "ENGINE REMARK",
            engineX + 8,
            y + 9
        );

    doc
        .font("Helvetica")
        .fontSize(8.5)
        .fillColor(COLORS.dark)
        .text(
            safeValue(engineRemark),
            engineX + 8,
            y + 25,
            {
                width:
                    remarkWidth - 16,
                height: 55
            }
        );

    const overallX =
        engineX +
        remarkWidth +
        boxGap;

    doc
        .rect(
            overallX,
            y,
            remarkWidth,
            boxHeight
        )
        .fillAndStroke(
            COLORS.white,
            COLORS.border
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(7)
        .fillColor(COLORS.gray)
        .text(
            "OVERALL REMARK",
            overallX + 8,
            y + 9
        );

    doc
        .font("Helvetica")
        .fontSize(8.5)
        .fillColor(COLORS.dark)
        .text(
            safeValue(overallRemark),
            overallX + 8,
            y + 25,
            {
                width:
                    remarkWidth - 16,
                height: 55
            }
        );

    y += boxHeight + 12;

    return y;
};

// ======================================================
// CHECKLIST VALUE HELPER
// ======================================================

const getChecklistValue = (
    item,
    keys,
    fallback = "-"
) => {
    if (
        !item ||
        typeof item !== "object"
    ) {
        return fallback;
    }

    return firstValue(
        item,
        keys,
        fallback
    );
};

// ======================================================
// NORMALIZE CHECKLIST ITEM
// ======================================================

const normalizeChecklistItem = (
    item,
    index
) => {
    if (
        typeof item === "string"
    ) {
        return {
            category: `Inspection ${index + 1}`,
            item: item,
            status: "-",
            remark: "-"
        };
    }

    if (
        !item ||
        typeof item !== "object"
    ) {
        return {
            category: `Inspection ${index + 1}`,
            item: "-",
            status: "-",
            remark: "-"
        };
    }

    const category =
        getChecklistValue(
            item,
            [
                "category",
                "section",
                "group",
                "title",
                "heading",
                "type",
                "name"
            ],
            `Inspection ${index + 1}`
        );

    const name =
        getChecklistValue(
            item,
            [
                "item",
                "label",
                "question",
                "inspectionItem",
                "inspection_item",
                "check",
                "description",
                "name"
            ],
            "-"
        );

    const status =
        getChecklistValue(
            item,
            [
                "status",
                "result",
                "condition",
                "rating",
                "value",
                "answer",
                "inspectionStatus",
                "inspection_status"
            ],
            "-"
        );

    const remark =
        getChecklistValue(
            item,
            [
                "remark",
                "remarks",
                "note",
                "notes",
                "comment",
                "comments",
                "observation",
                "observations",
                "description"
            ],
            "-"
        );

    return {
        category,
        item: name,
        status,
        remark
    };
};

// ======================================================
// DRAW CHECKLIST
// ======================================================

const drawChecklist = (
    doc,
    report,
    y,
    pageNumberRef
) => {
    let checklist =
        report.checklist ||
        report.inspection_checklist ||
        report.inspectionChecklist ||
        report.detailedInspection ||
        [];

    if (
        !Array.isArray(checklist)
    ) {
        checklist = [];
    }

    y = drawSectionHeader(
        doc,
        "Detailed Inspection",
        y
    );

    y += 5;

    const normalized =
        checklist.map(
            normalizeChecklistItem
        );

    if (
        normalized.length === 0
    ) {
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
            .font("Helvetica")
            .fontSize(8)
            .fillColor(COLORS.gray)
            .text(
                "No detailed inspection checklist data provided.",
                MARGIN_LEFT + 8,
                y + 16,
                {
                    width:
                        CONTENT_WIDTH - 16
                }
            );

        return y + 55;
    }

    const col1 =
        CONTENT_WIDTH * 0.25;

    const col2 =
        CONTENT_WIDTH * 0.30;

    const col3 =
        CONTENT_WIDTH * 0.15;

    const col4 =
        CONTENT_WIDTH -
        col1 -
        col2 -
        col3;

    const headerHeight = 27;

    doc
        .rect(
            MARGIN_LEFT,
            y,
            CONTENT_WIDTH,
            headerHeight
        )
        .fillAndStroke(
            COLORS.headerGray,
            COLORS.border
        );

    const headerX = [
        MARGIN_LEFT,
        MARGIN_LEFT + col1,
        MARGIN_LEFT + col1 + col2,
        MARGIN_LEFT + col1 + col2 + col3
    ];

    const widths = [
        col1,
        col2,
        col3,
        col4
    ];

    const headers = [
        "SECTION",
        "INSPECTION ITEM",
        "STATUS",
        "REMARK"
    ];

    headers.forEach(
        (header, index) => {
            doc
                .font("Helvetica-Bold")
                .fontSize(6.5)
                .fillColor(COLORS.gray)
                .text(
                    header,
                    headerX[index] + 6,
                    y + 9,
                    {
                        width:
                            widths[index] - 12,
                        ellipsis: true
                    }
                );
        }
    );

    y += headerHeight;

    normalized.forEach(
        (item) => {
            const sectionText =
                safeValue(
                    item.category
                );

            const itemText =
                safeValue(
                    item.item
                );

            const statusText =
                safeValue(
                    item.status
                );

            const remarkText =
                safeValue(
                    item.remark
                );

            const textWidths = [
                col1 - 12,
                col2 - 12,
                col3 - 12,
                col4 - 12
            ];

            const heights = [
                doc.heightOfString(
                    sectionText,
                    {
                        width:
                            textWidths[0],
                        font:
                            "Helvetica",
                        fontSize: 7
                    }
                ),
                doc.heightOfString(
                    itemText,
                    {
                        width:
                            textWidths[1],
                        font:
                            "Helvetica",
                        fontSize: 7
                    }
                ),
                doc.heightOfString(
                    statusText,
                    {
                        width:
                            textWidths[2],
                        font:
                            "Helvetica",
                        fontSize: 7
                    }
                ),
                doc.heightOfString(
                    remarkText,
                    {
                        width:
                            textWidths[3],
                        font:
                            "Helvetica",
                        fontSize: 7
                    }
                )
            ];

            const rowHeight =
                Math.max(
                    32,
                    Math.min(
                        70,
                        Math.max(...heights) + 16
                    )
                );

            if (
                y + rowHeight >
                PAGE_BOTTOM
            ) {
                pageNumberRef.value += 1;

                y = addPageWithFooter(
                    doc,
                    getReportId(report),
                    pageNumberRef.value
                );

                y = drawSectionHeader(
                    doc,
                    "Detailed Inspection - Continued",
                    y
                );

                y += 5;

                doc
                    .rect(
                        MARGIN_LEFT,
                        y,
                        CONTENT_WIDTH,
                        headerHeight
                    )
                    .fillAndStroke(
                        COLORS.headerGray,
                        COLORS.border
                    );

                headers.forEach(
                    (header, index) => {
                        doc
                            .font("Helvetica-Bold")
                            .fontSize(6.5)
                            .fillColor(COLORS.gray)
                            .text(
                                header,
                                headerX[index] + 6,
                                y + 9,
                                {
                                    width:
                                        widths[index] - 12,
                                    ellipsis: true
                                }
                            );
                    }
                );

                y += headerHeight;
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

            doc
                .strokeColor(COLORS.border)
                .lineWidth(0.5);

            for (
                let i = 1;
                i < 4;
                i++
            ) {
                doc
                    .moveTo(
                        MARGIN_LEFT +
                            widths
                                .slice(0, i)
                                .reduce(
                                    (a, b) => a + b,
                                    0
                                ),
                        y
                    )
                    .lineTo(
                        MARGIN_LEFT +
                            widths
                                .slice(0, i)
                                .reduce(
                                    (a, b) => a + b,
                                    0
                                ),
                        y + rowHeight
                    )
                    .stroke();
            }

            const values = [
                sectionText,
                itemText,
                statusText,
                remarkText
            ];

            values.forEach(
                (value, index) => {
                    doc
                        .font(
                            index === 2
                                ? "Helvetica-Bold"
                                : "Helvetica"
                        )
                        .fontSize(7)
                        .fillColor(
                            index === 2
                                ? COLORS.dark
                                : COLORS.dark
                        )
                        .text(
                            value,
                            headerX[index] + 6,
                            y + 8,
                            {
                                width:
                                    widths[index] - 12,
                                height:
                                    rowHeight - 12
                            }
                        );
                }
            );

            y += rowHeight;
        }
    );

    y += 10;

    return y;
};

// ======================================================
// ADDITIONAL VEHICLE INFORMATION
// ======================================================

const drawAdditionalVehicleInformation = (
    doc,
    report,
    y,
    pageNumberRef
) => {
    const excludedKeys =
        new Set([
            "created_at",
            "updated_at",
            "createdAt",
            "updatedAt",

            "vehicleNote",
            "vehicle_note",
            "note",
            "vehicleNotes",
            "vehicle_notes",

            "owner",
            "vehicle",
            "inspection",

            "checklist",
            "inspection_checklist",
            "inspectionChecklist",
            "checklists",
            "detailedInspection",

            "overallScore",
            "overall_score",
            "score",

            "engineRemark",
            "engine_remark",
            "engineNotes",
            "engine_notes",

            "overallRemark",
            "overall_remark",
            "remarks",
            "remark",
            "comments",
            "comment",

            "ownerName",
            "owner_name",
            "customerName",
            "customer_name",
            "fullName",
            "full_name",
            "name",

            "mobile",
            "ownerMobile",
            "owner_mobile",
            "customerMobile",
            "customer_mobile",
            "phone",
            "phoneNumber",
            "phone_number",
            "mobileNumber",
            "mobile_number",

            "email",
            "ownerEmail",
            "owner_email",
            "customerEmail",
            "customer_email",

            "address",
            "ownerAddress",
            "owner_address",
            "customerAddress",
            "customer_address",
            "fullAddress",
            "full_address",
            "location"
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

        Object.entries(
            object
        ).forEach(
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

                if (
                    Array.isArray(value)
                ) {
                    if (
                        value.length > 0
                    ) {
                        values.push([
                            titleCase(
                                fullKey
                            ),
                            value
                                .map(
                                    (item) =>
                                        typeof item ===
                                        "object"
                                            ? JSON.stringify(
                                                  item
                                              )
                                            : String(
                                                  item
                                              )
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

    if (
        values.length === 0
    ) {
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
            pageNumberRef.value += 1;

            y = addPageWithFooter(
                doc,
                getReportId(report),
                pageNumberRef.value
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
                    y + rowHeight
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

    return y + 8;
};

// ======================================================
// IMAGE HELPERS
// ======================================================

const normalizeImages = (
    images
) => {
    if (!images) {
        return [];
    }

    if (
        Array.isArray(images)
    ) {
        return images;
    }

    if (
        typeof images === "object"
    ) {
        return Object.values(
            images
        );
    }

    return [images];
};

const getImagePathFromItem = (
    item
) => {
    if (
        typeof item === "string"
    ) {
        return item;
    }

    if (
        !item ||
        typeof item !== "object"
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
// DRAW PHOTOS
// ======================================================

const drawVehiclePhotos = async (
    doc,
    report,
    y,
    pageNumberRef
) => {
    let images =
        report.images ||
        report.vehicleImages ||
        report.vehicle_images ||
        [];

    images =
        normalizeImages(images);

    if (
        images.length === 0
    ) {
        return y;
    }

    y = drawSectionHeader(
        doc,
        "Vehicle Photos",
        y
    );

    y += 8;

    const imageGap = 10;

    const imageWidth =
        (CONTENT_WIDTH -
            imageGap) /
        2;

    const imageHeight = 210;

    for (
        let i = 0;
        i < images.length;
        i++
    ) {
        const rawImage =
            images[i];

        let imagePath =
            getImagePathFromItem(
                rawImage
            );

        if (
            !imagePath &&
            vehicleImageService &&
            typeof vehicleImageService
                .getImagePath ===
                "function"
        ) {
            try {
                imagePath =
                    await vehicleImageService
                        .getImagePath(
                            rawImage
                        );
            } catch (error) {
                console.error(
                    "Vehicle image path error:",
                    error
                );
            }
        }

        if (
            !imagePath
        ) {
            continue;
        }

        if (
            typeof imagePath === "string" &&
            imagePath.startsWith("/")
        ) {
            imagePath =
                path.resolve(
                    process.cwd(),
                    imagePath.replace(
                        /^[/\\]+/,
                        ""
                    )
                );
        }

        if (
            typeof imagePath === "string" &&
            imagePath.startsWith("file://")
        ) {
            imagePath =
                imagePath.replace(
                    "file://",
                    ""
                );
        }

        if (
            !fs.existsSync(
                imagePath
            )
        ) {
            console.warn(
                "Vehicle image not found:",
                imagePath
            );

            continue;
        }

        const column =
            i % 2;

        if (
            column === 0 &&
            y + imageHeight >
                PAGE_BOTTOM
        ) {
            pageNumberRef.value += 1;

            y = addPageWithFooter(
                doc,
                getReportId(report),
                pageNumberRef.value
            );

            y = drawSectionHeader(
                doc,
                "Vehicle Photos - Continued",
                y
            );

            y += 8;
        }

        const x =
            MARGIN_LEFT +
            column *
                (imageWidth +
                    imageGap);

        if (
            column === 0
        ) {
            doc
                .rect(
                    MARGIN_LEFT,
                    y,
                    CONTENT_WIDTH,
                    imageHeight
                )
                .fillAndStroke(
                    COLORS.white,
                    COLORS.border
                );
        }

        try {
            doc.image(
                imagePath,
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
                error
            );

            doc
                .font("Helvetica")
                .fontSize(8)
                .fillColor(COLORS.gray)
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
            i === images.length - 1
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
        getReportId(report);

    doc
        .rect(
            0,
            0,
            PAGE_WIDTH,
            72
        )
        .fill(COLORS.navy);

    doc
        .font("Helvetica-Bold")
        .fontSize(18)
        .fillColor(COLORS.white)
        .text(
            "CARSEY.IN",
            MARGIN_LEFT,
            18
        );

    doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor("#CBD5E1")
        .text(
            "VEHICLE INSPECTION REPORT",
            MARGIN_LEFT,
            43
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(COLORS.white)
        .text(
            `REPORT #${safeValue(reportId)}`,
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
        (resolve, reject) => {
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
                    const normalizedReport =
                        normalizeReport(
                            report
                        );

                    /*
                     * IMPORTANT:
                     * PDF generation itself is allowed only when
                     * the report is published.
                     */
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

                    if (
                        String(
                            publishStatus
                        ).toLowerCase() !==
                            "yes" &&
                        String(
                            publishStatus
                        ).toLowerCase() !==
                            "published"
                    ) {
                        throw new Error(
                            "Inspection PDF can only be generated after vehicle/report is published."
                        );
                    }

                    const reportId =
                        getReportId(
                            normalizedReport
                        );

                    const uploadsDir =
                        path.join(
                            process.cwd(),
                            "uploads"
                        );

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
                                recursive: true
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
                                recursive: true
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

                    const doc =
                        new PDFDocument({
                            size: "A4",
                            margin: 0,
                            autoFirstPage: true
                        });

                    const writeStream =
                        fs.createWriteStream(
                            filePath
                        );

                    let pageNumber = 1;

                    const pageNumberRef = {
                        value: pageNumber
                    };

                    doc.pipe(
                        writeStream
                    );

                    drawHeader(
                        doc,
                        normalizedReport
                    );

                    let y = 92;

                    // --------------------------------------------------
                    // VEHICLE DETAILS
                    // --------------------------------------------------

                    y =
                        drawVehicleDetails(
                            doc,
                            normalizedReport,
                            y
                        );

                    y += 12;

                    // --------------------------------------------------
                    // OWNER DETAILS
                    // --------------------------------------------------

                    if (
                        y + 150 >
                        PAGE_BOTTOM
                    ) {
                        pageNumberRef.value += 1;

                        y =
                            addPageWithFooter(
                                doc,
                                reportId,
                                pageNumberRef.value
                            );

                        drawHeader(
                            doc,
                            normalizedReport
                        );

                        y = 92;
                    }

                    y =
                        drawOwnerDetails(
                            doc,
                            normalizedReport,
                            y
                        );

                    y += 12;

                    // --------------------------------------------------
                    // INSPECTION SUMMARY
                    // --------------------------------------------------

                    if (
                        y + 130 >
                        PAGE_BOTTOM
                    ) {
                        pageNumberRef.value += 1;

                        y =
                            addPageWithFooter(
                                doc,
                                reportId,
                                pageNumberRef.value
                            );

                        y = 50;
                    }

                    y =
                        drawInspectionSummary(
                            doc,
                            normalizedReport,
                            y
                        );

                    y += 5;

                    // --------------------------------------------------
                    // CHECKLIST
                    // --------------------------------------------------

                    if (
                        y + 150 >
                        PAGE_BOTTOM
                    ) {
                        pageNumberRef.value += 1;

                        y =
                            addPageWithFooter(
                                doc,
                                reportId,
                                pageNumberRef.value
                            );

                        y = 50;
                    }

                    y =
                        drawChecklist(
                            doc,
                            normalizedReport,
                            y,
                            pageNumberRef
                        );

                    // --------------------------------------------------
                    // ADDITIONAL VEHICLE DATA
                    // --------------------------------------------------

                    if (
                        y + 100 >
                        PAGE_BOTTOM
                    ) {
                        pageNumberRef.value += 1;

                        y =
                            addPageWithFooter(
                                doc,
                                reportId,
                                pageNumberRef.value
                            );

                        y = 50;
                    }

                    y =
                        drawAdditionalVehicleInformation(
                            doc,
                            normalizedReport,
                            y,
                            pageNumberRef
                        );

                    // --------------------------------------------------
                    // PHOTOS
                    // --------------------------------------------------

                    if (
                        y + 150 >
                        PAGE_BOTTOM
                    ) {
                        pageNumberRef.value += 1;

                        y =
                            addPageWithFooter(
                                doc,
                                reportId,
                                pageNumberRef.value
                            );

                        y = 50;
                    }

                    y =
                        await drawVehiclePhotos(
                            doc,
                            normalizedReport,
                            y,
                            pageNumberRef
                        );

                    // --------------------------------------------------
                    // FINAL FOOTER
                    // --------------------------------------------------

                    drawFooter(
                        doc,
                        reportId,
                        pageNumberRef.value
                    );

                    // --------------------------------------------------
                    // PDF FINALIZE
                    // --------------------------------------------------

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
                        (error) => {
                            rejectOnce(
                                error
                            );
                        }
                    );

                    doc.on(
                        "error",
                        (error) => {
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