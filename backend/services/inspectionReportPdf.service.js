const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const vehicleImageService = require("./vehicleImage.service");

// ======================================================
// PAGE SETTINGS
// ======================================================

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_LEFT = 30;
const MARGIN_RIGHT = 30;
const MARGIN_TOP = 30;
const MARGIN_BOTTOM = 42;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
const PAGE_BOTTOM = PAGE_HEIGHT - MARGIN_BOTTOM;

const COLORS = {
    navy: "#111827",
    blue: "#2563EB",
    lightBlue: "#EFF6FF",
    border: "#D7DEE8",
    gray: "#64748B",
    dark: "#172033",
    green: "#15803D",
    greenLight: "#DCFCE7",
    amber: "#B45309",
    amberLight: "#FEF3C7",
    white: "#FFFFFF",
    black: "#000000",
    lightGray: "#F8FAFC"
};

const DETAILED_SECTION_TITLES = {
    exterior: "EXTERIOR + TYRE",
    engine_bay: "ENGINE + TRANSMISSION",
    suspension_steering: "STEERING + SUSPENSION + BRAKE",
    interior_electricals: "ELECTRICAL + INTERIOR + FEATURES",
    electricals_ac: "AC + LIGHT",
    transmission_system: "TRANSMISSION",
    braking_system: "BRAKING",
    tires_wheels: "TYRES + WHEELS",
    documents_title: "DOCUMENTS + TITLE"
};

const safeString = (value, fallback = "-") => {
    if (value === undefined || value === null || value === "") {
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
        if (value !== undefined && value !== null && value !== "") {
            return value;
        }
    }

    return fallback;
};

const vehicleValue = (report, keys, fallback = "-") => {
    const vehicle =
        report && report.vehicle && typeof report.vehicle === "object"
            ? report.vehicle
            : {};

    const value = firstValue(vehicle, keys, undefined);

    if (value !== undefined) {
        return value;
    }

    return firstValue(report, keys, fallback);
};

const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
};

const formatScore = (value) => {
    if (value === undefined || value === null || value === "") {
        return "-";
    }

    const number = Number(value);
    if (!Number.isFinite(number)) {
        return String(value);
    }

    return Number(number.toFixed(1)).toString();
};

const formatOdometer = (value) => {
    if (value === undefined || value === null || value === "") {
        return "-";
    }

    return `${value} KM`;
};

// ======================================================
// REPORT / IMAGE HELPERS
// ======================================================

const getReportId = (report) =>
    firstValue(report, ["reportId", "report_id", "id"], "-");

const getCarId = (report) => {
    const vehicle =
        report && report.vehicle && typeof report.vehicle === "object"
            ? report.vehicle
            : {};

    return firstValue(
        report,
        ["carId", "car_id", "vehicleId", "vehicle_id"],
        firstValue(vehicle, ["car_id", "carId", "vehicle_id", "vehicleId"], "-")
    );
};

const normalizeImagePath = (image) => {
    if (!image) return null;

    const value =
        typeof image === "string"
            ? image
            : firstValue(
                  image,
                  ["image_path", "imagePath", "path", "url", "src"],
                  ""
              );

    if (!value) return null;

    return String(value)
        .trim()
        .replace(/\\/g, "/")
        .replace(/^https?:\/\/[^/]+/i, "")
        .split("?")[0]
        .split("#")[0];
};

const resolveImagePath = (imagePath) => {
    if (!imagePath) return null;

    let value = String(imagePath).trim();
    if (!value) return null;

    value = value.replace(/\\/g, "/");

    try {
        value = decodeURIComponent(value);
    } catch (error) {
        // Keep original value.
    }

    if (path.isAbsolute(value)) {
        try {
            if (fs.existsSync(value)) return value;
        } catch (error) {
            // Continue with relative candidates.
        }
    }

    value = value.replace(/^\/+/, "");

    const withoutUploads = value.replace(/^uploads\//i, "");
    const withoutPublic = value.replace(/^public\//i, "");

    const candidates = [
        path.join(process.cwd(), value),
        path.join(process.cwd(), "uploads", withoutUploads),
        path.join(process.cwd(), "public", value),
        path.join(process.cwd(), "public", withoutPublic),
        path.join(__dirname, value),
        path.join(__dirname, "uploads", withoutUploads),
        path.join(__dirname, "..", value),
        path.join(__dirname, "..", "uploads", withoutUploads),
        path.join(__dirname, "..", "public", value),
        path.join(__dirname, "..", "public", withoutPublic)
    ];

    for (const candidate of candidates) {
        try {
            if (fs.existsSync(candidate)) return candidate;
        } catch (error) {
            // Continue.
        }
    }

    return null;
};

const loadVehicleImages = async (report) => {
    let images = [];

    if (Array.isArray(report?.images)) {
        images = report.images;
    } else if (Array.isArray(report?.vehicleImages)) {
        images = report.vehicleImages;
    }

    if (images.length === 0) {
        const carId = getCarId(report);

        if (carId !== "-" && carId !== null && carId !== undefined) {
            try {
                const dbImages = await vehicleImageService.getVehicleImages(Number(carId));
                if (Array.isArray(dbImages)) {
                    images = dbImages;
                }
            } catch (error) {
                console.warn("PDF image read warning:", error.message);
            }
        }
    }

    return images
        .map((image, index) => {
            const imagePath = normalizeImagePath(image);
            const filePath = resolveImagePath(imagePath);

            return {
                ...(image && typeof image === "object" ? image : {}),
                imagePath,
                filePath,
                index: index + 1,
                imageType: String(
                    firstValue(
                        image && typeof image === "object" ? image : {},
                        ["image_type", "imageType", "type"],
                        ""
                    )
                )
            };
        })
        .filter((image) => {
            if (!image.filePath) return false;

            try {
                return fs.existsSync(image.filePath);
            } catch (error) {
                return false;
            }
        });
};

const isDetailedImage = (image) => {
    const type = String(image?.imageType || "").toLowerCase();
    return type.startsWith("detailed|") || type.startsWith("detailed inspection");
};

const getDetailedImageKey = (image) => {
    const type = String(image?.imageType || "");

    if (type.toLowerCase().startsWith("detailed|")) {
        const parts = type.split("|");
        if (parts.length >= 3) {
            return `${parts[1]}__${parts.slice(2).join("|")}`;
        }
    }

    const match = type.match(/detailed inspection\s*[:|-]\s*(.*?)\s*[:|-]\s*(.*)$/i);
    if (match) {
        return `${match[1]}__${match[2]}`;
    }

    return "";
};

// ======================================================
// DETAILED CHECKLIST NORMALIZATION
// ======================================================

const parseJsonIfNeeded = (value) => {
    if (typeof value !== "string") return value;

    const trimmed = value.trim();
    if (!trimmed) return value;

    try {
        return JSON.parse(trimmed);
    } catch (error) {
        return value;
    }
};

const normalizeSelectedOptions = (value) => {
    value = parseJsonIfNeeded(value);

    if (Array.isArray(value)) {
        return value
            .filter((item) => item !== undefined && item !== null && String(item).trim())
            .map((item) => String(item));
    }

    if (value && typeof value === "object") {
        const nested = firstValue(
            value,
            ["selected_options", "selectedOptions", "options", "values"],
            []
        );

        return normalizeSelectedOptions(nested);
    }

    if (typeof value === "string" && value.trim()) {
        return value
            .split(/\s*[,|]\s*/)
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
};

const getRawChecklist = (report) => {
    let checklist =
        report?.checklist ??
        report?.inspection_checklist ??
        report?.inspectionChecklist ??
        report?.detailedInspection ??
        report?.checklists ??
        report?.inspection?.checklist ??
        report?.inspection?.inspection_checklist ??
        report?.inspection?.detailedInspection ??
        [];

    checklist = parseJsonIfNeeded(checklist);

    if (checklist && typeof checklist === "object" && !Array.isArray(checklist)) {
        const nested = firstValue(
            checklist,
            ["items", "data", "checklist", "inspection_data", "inspectionData"],
            undefined
        );

        if (nested !== undefined) {
            const parsedNested = parseJsonIfNeeded(nested);
            if (Array.isArray(parsedNested) || (parsedNested && typeof parsedNested === "object")) {
                checklist = parsedNested;
            }
        }
    }

    return checklist;
};

const normalizeDetailedChecklist = (report) => {
    const raw = getRawChecklist(report);
    const result = [];

    // --------------------------------------------------
    // ARRAY FORMAT - preferred database format
    // --------------------------------------------------
    if (Array.isArray(raw)) {
        raw.forEach((item, index) => {
            if (!item || typeof item !== "object") return;

            const sectionKey = firstValue(
                item,
                ["section", "section_key", "sectionKey", "category", "category_key"],
                "other"
            );

            const sectionTitle = firstValue(
                item,
                ["section_title", "sectionTitle", "section_name", "sectionName"],
                DETAILED_SECTION_TITLES[sectionKey] || "INSPECTION CHECKLIST"
            );

            const rowName = firstValue(
                item,
                ["item_name", "itemName", "row_name", "rowName", "area", "inspection_area", "title", "name"],
                `Inspection Item ${index + 1}`
            );

            let selectedOptions = normalizeSelectedOptions(
                firstValue(
                    item,
                    ["selected_options", "selectedOptions", "options", "values"],
                    []
                )
            );

            if (selectedOptions.length === 0) {
                selectedOptions = normalizeSelectedOptions(
                    firstValue(item, ["status", "condition", "result", "value"], [])
                );
            }

            const remark = safeString(
                firstValue(item, ["remark", "remarks", "note", "comment"], ""),
                ""
            );

            const status = safeString(
                firstValue(item, ["status", "condition", "result"], ""),
                ""
            );

            result.push({
                sectionKey: String(sectionKey),
                sectionTitle: String(sectionTitle),
                rowName: String(rowName),
                selectedOptions,
                remark,
                status
            });
        });

        return result;
    }

    // --------------------------------------------------
    // OBJECT FORMAT - raw Employee Inspection structure
    // section -> row -> selected checkbox array
    // --------------------------------------------------
    if (raw && typeof raw === "object") {
        for (const [sectionKey, sectionRowsValue] of Object.entries(raw)) {
            if (!sectionRowsValue || typeof sectionRowsValue !== "object" || Array.isArray(sectionRowsValue)) {
                continue;
            }

            const sectionTitle =
                DETAILED_SECTION_TITLES[sectionKey] ||
                String(sectionKey).replace(/_/g, " ").toUpperCase();

            for (const [rowName, rawSelected] of Object.entries(sectionRowsValue)) {
                const selectedOptions = normalizeSelectedOptions(rawSelected);

                result.push({
                    sectionKey,
                    sectionTitle,
                    rowName,
                    selectedOptions,
                    remark: "",
                    status: selectedOptions.some((option) => option !== "Ok/No imperfection")
                        ? "Need Attention"
                        : "Good"
                });
            }
        }
    }

    return result;
};

const mergeDetailedRemarks = (rows, report) => {
    const remarks =
        parseJsonIfNeeded(
            report?.detailedInspectionRemarks ||
            report?.detailed_inspection_remarks ||
            {}
        ) || {};

    if (!remarks || typeof remarks !== "object") {
        return rows;
    }

    return rows.map((row) => {
        const key = `${row.sectionKey}__${row.rowName}`;
        const value = remarks[key];

        if (value !== undefined && value !== null && String(value).trim()) {
            return {
                ...row,
                remark: String(value).trim()
            };
        }

        return row;
    });
};

// ======================================================
// DRAWING HELPERS
// ======================================================

const drawFooter = (doc, reportId) => {
    const footerY = PAGE_HEIGHT - 25;

    doc.save();
    doc.strokeColor(COLORS.border).lineWidth(0.5);
    doc.moveTo(MARGIN_LEFT, footerY - 8)
        .lineTo(PAGE_WIDTH - MARGIN_RIGHT, footerY - 8)
        .stroke();

    doc.font("Helvetica").fontSize(7).fillColor(COLORS.gray)
        .text("Carsey.in | Vehicle Inspection Report", MARGIN_LEFT, footerY, {
            width: 250,
            align: "left"
        });

    doc.text(`Report #${reportId} | Page ${doc.page.number}`, PAGE_WIDTH - 280, footerY, {
        width: 250,
        align: "right"
    });
    doc.restore();
};

const newPage = (doc, reportId) => {
    drawFooter(doc, reportId);
    doc.addPage();
    return MARGIN_TOP;
};

const ensureSpace = (doc, y, requiredHeight, reportId) => {
    if (y + requiredHeight > PAGE_BOTTOM) {
        return newPage(doc, reportId);
    }

    return y;
};

const drawHeader = (doc, report) => {
    const reportId = getReportId(report);

    doc.roundedRect(MARGIN_LEFT, MARGIN_TOP, CONTENT_WIDTH, 64, 6)
        .fillAndStroke(COLORS.navy, COLORS.navy);

    doc.font("Helvetica-Bold").fontSize(21).fillColor(COLORS.white)
        .text("CARSEY.IN", MARGIN_LEFT + 13, MARGIN_TOP + 12);

    doc.font("Helvetica").fontSize(9).fillColor(COLORS.white)
        .text("VEHICLE INSPECTION REPORT", MARGIN_LEFT + 14, MARGIN_TOP + 39);

    doc.font("Helvetica-Bold").fontSize(8).fillColor(COLORS.white)
        .text(`REPORT #${reportId}`, PAGE_WIDTH - 150, MARGIN_TOP + 25, {
            width: 120,
            align: "right"
        });

    return MARGIN_TOP + 76;
};

const drawSectionHeader = (doc, title, y) => {
    const height = 25;

    doc.roundedRect(MARGIN_LEFT, y, CONTENT_WIDTH, height, 4)
        .fill(COLORS.navy);

    doc.font("Helvetica-Bold").fontSize(10.5).fillColor(COLORS.white)
        .text(title, MARGIN_LEFT + 9, y + 7, {
            width: CONTENT_WIDTH - 18,
            ellipsis: true
        });

    return y + height;
};

const drawField = (doc, x, y, width, label, value) => {
    doc.font("Helvetica-Bold").fontSize(6.3).fillColor(COLORS.gray)
        .text(String(label).toUpperCase(), x, y, {
            width: width - 12,
            height: 9,
            ellipsis: true
        });

    doc.font("Helvetica-Bold").fontSize(8.4).fillColor(COLORS.dark)
        .text(safeString(value), x, y + 11, {
            width: width - 14,
            height: 23,
            ellipsis: true
        });
};

const drawVehicleDetails = (doc, report, y, reportId) => {
    y = drawSectionHeader(doc, "Vehicle Details", y) + 5;

    const fields = [
        ["Brand", vehicleValue(report, ["brand", "make", "vehicleBrand"])],
        ["Model", vehicleValue(report, ["model", "vehicleModel"])],
        ["Variant", vehicleValue(report, ["variant", "vehicleVariant"])],
        ["Manufacturing Year", vehicleValue(report, ["manufacturing_year", "manufacturingYear", "year"])],
        ["Odometer", formatOdometer(vehicleValue(report, ["odometer", "kmDriven", "km_driven", "mileage"], "-"))],
        ["City", vehicleValue(report, ["city", "location", "vehicleCity"])],
        ["Transmission", vehicleValue(report, ["transmission"])],
        ["Fuel Type", vehicleValue(report, ["fuel_type", "fuelType", "fuel"])],
        ["Owner Classification", vehicleValue(report, ["owner_classification", "ownerClassification", "owner_type"])],
        ["Registration Number", vehicleValue(report, ["registration_number", "registrationNumber", "registration_no"])],
        ["Chassis Number", vehicleValue(report, ["chassis_number", "chassisNumber", "chassis_no"])],
        ["Engine Number", vehicleValue(report, ["engine_number", "engineNumber", "engine_no"])],
        ["Inspection Date", formatDate(vehicleValue(report, ["inspection_date", "inspectionDate"]))],
        ["RTO", vehicleValue(report, ["rto", "rtoName", "rto_name"])],
        ["Spare Key", vehicleValue(report, ["spare_key", "spareKey", "spareKeys"])],
        ["Insurance Type", vehicleValue(report, ["insurance_type", "insuranceType", "insurance"])],
        ["Insurance Validity", formatDate(vehicleValue(report, ["insurance_validity", "insuranceValidity", "insurance_expiry"]))]
    ];

    const columnWidth = CONTENT_WIDTH / 3;
    const rowHeight = 43;

    for (let i = 0; i < fields.length; i += 3) {
        y = ensureSpace(doc, y, rowHeight + 5, reportId);

        const row = fields.slice(i, i + 3);

        doc.rect(MARGIN_LEFT, y, CONTENT_WIDTH, rowHeight)
            .fillAndStroke(COLORS.white, COLORS.border);

        for (let c = 1; c < 3; c++) {
            doc.strokeColor(COLORS.border).lineWidth(0.5)
                .moveTo(MARGIN_LEFT + columnWidth * c, y)
                .lineTo(MARGIN_LEFT + columnWidth * c, y + rowHeight)
                .stroke();
        }

        row.forEach(([label, value], index) => {
            drawField(
                doc,
                MARGIN_LEFT + columnWidth * index + 8,
                y + 8,
                columnWidth,
                label,
                value
            );
        });

        y += rowHeight;
    }

    return y + 8;
};

// ======================================================
// DETAILED CHECKLIST
// ======================================================

const drawSelectedOptions = (doc, options, x, y, width) => {
    const text = options.length > 0 ? options.join(", ") : "No option selected";

    doc.font("Helvetica-Bold").fontSize(7).fillColor(COLORS.gray)
        .text("SELECTED OPTION(S)", x, y, { width });

    doc.font("Helvetica").fontSize(8.5).fillColor(COLORS.dark)
        .text(text, x, y + 11, { width, lineGap: 1.5 });

    return y + 11 + doc.heightOfString(text, {
        width,
        lineGap: 1.5
    });
};

const drawDetailedRow = (doc, row, detailedImage, y, reportId) => {
    const textWidth = CONTENT_WIDTH - 20;
    const title = safeString(row.rowName, "Inspection Item");
    const options = row.selectedOptions || [];
    const remark = row.remark || "";

    const imageHeight = detailedImage ? 145 : 0;
    const optionText = options.length ? options.join(", ") : "No option selected";

    const optionHeight = doc.heightOfString(optionText, {
        width: textWidth,
        lineGap: 1.5
    });

    const remarkHeight = remark
        ? doc.heightOfString(remark, { width: textWidth, lineGap: 1.5 })
        : 0;

    const required = 40 + optionHeight + remarkHeight + (remark ? 30 : 0) + (detailedImage ? imageHeight + 18 : 0);
    y = ensureSpace(doc, y, Math.min(required, 220), reportId);

    // Row card header.
    doc.roundedRect(MARGIN_LEFT, y, CONTENT_WIDTH, 28, 4)
        .fill(COLORS.lightGray)
        .stroke(COLORS.border);

    doc.font("Helvetica-Bold").fontSize(9.5).fillColor(COLORS.dark)
        .text(title, MARGIN_LEFT + 9, y + 8, {
            width: CONTENT_WIDTH - 18,
            ellipsis: true
        });

    y += 35;

    y = drawSelectedOptions(doc, options, MARGIN_LEFT + 10, y, textWidth) + 7;

    if (detailedImage) {
        y = ensureSpace(doc, y, imageHeight + 25, reportId);

        doc.font("Helvetica-Bold").fontSize(7).fillColor(COLORS.gray)
            .text("INSPECTION IMAGE", MARGIN_LEFT + 10, y, {
                width: textWidth
            });

        y += 11;

        doc.roundedRect(MARGIN_LEFT + 10, y, textWidth, imageHeight, 5)
            .fillAndStroke(COLORS.white, COLORS.border);

        try {
            doc.image(detailedImage.filePath, MARGIN_LEFT + 16, y + 6, {
                fit: [textWidth - 12, imageHeight - 12],
                align: "center",
                valign: "center"
            });
        } catch (error) {
            doc.font("Helvetica").fontSize(8).fillColor(COLORS.gray)
                .text("Image could not be loaded", MARGIN_LEFT + 20, y + imageHeight / 2, {
                    width: textWidth - 20,
                    align: "center"
                });
        }

        y += imageHeight + 8;
    }

    if (remark) {
        y = ensureSpace(doc, y, remarkHeight + 28, reportId);

        doc.font("Helvetica-Bold").fontSize(7).fillColor(COLORS.gray)
            .text("REMARK", MARGIN_LEFT + 10, y, {
                width: textWidth
            });

        y += 11;

        doc.font("Helvetica").fontSize(8.5).fillColor(COLORS.dark)
            .text(remark, MARGIN_LEFT + 10, y, {
                width: textWidth,
                lineGap: 1.5
            });

        y += remarkHeight + 4;
    }

    return y + 8;
};

const drawDetailedChecklist = (doc, rows, detailedImages, reportId) => {
    doc.addPage();
    let y = MARGIN_TOP;

    y = drawSectionHeader(doc, "Detailed Vehicle Inspection Checklist", y);
    y += 8;

    if (!rows.length) {
        doc.font("Helvetica").fontSize(9).fillColor(COLORS.gray)
            .text("No detailed inspection checklist data provided.", MARGIN_LEFT, y, {
                width: CONTENT_WIDTH
            });
        return;
    }

    let currentSection = null;

    for (const row of rows) {
        if (row.sectionKey !== currentSection) {
            currentSection = row.sectionKey;
            y = ensureSpace(doc, y, 35, reportId);

            doc.roundedRect(MARGIN_LEFT, y, CONTENT_WIDTH, 26, 4)
                .fill(COLORS.navy);

            doc.font("Helvetica-Bold").fontSize(9.5).fillColor(COLORS.white)
                .text(row.sectionTitle, MARGIN_LEFT + 9, y + 7, {
                    width: CONTENT_WIDTH - 120,
                    ellipsis: true
                });

            const sectionRows = rows.filter(
                item => item.sectionKey === row.sectionKey
            );

            const sectionNeedsAttention = sectionRows.some(
                item => {
                    const options = item.selectedOptions || [];
                    return (
                        item.status === "Need Attention" ||
                        options.some(option => option !== "Ok/No imperfection")
                    );
                }
            );

            const badgeText = sectionNeedsAttention
                ? "Need Attention"
                : "Good";

            const badgeWidth = sectionNeedsAttention ? 82 : 42;
            const badgeX = MARGIN_LEFT + CONTENT_WIDTH - badgeWidth - 8;

            doc.roundedRect(
                badgeX,
                y + 5,
                badgeWidth,
                16,
                8
            ).fill(
                sectionNeedsAttention
                    ? COLORS.amberLight
                    : COLORS.greenLight
            );

            doc.font("Helvetica-Bold").fontSize(6.5)
                .fillColor(
                    sectionNeedsAttention
                        ? COLORS.amber
                        : COLORS.green
                )
                .text(
                    badgeText,
                    badgeX,
                    y + 10,
                    {
                        width: badgeWidth,
                        align: "center"
                    }
                );

            y += 34;
        }

        const key = `${row.sectionKey}__${row.rowName}`;
        const image = detailedImages.get(key) || null;
        y = drawDetailedRow(doc, row, image, y, reportId);
    }
};

// ======================================================
// VEHICLE PHOTOS
// ======================================================

const drawVehiclePhotos = (doc, images, reportId) => {
    const vehicleImages = images.filter((image) => !isDetailedImage(image));

    doc.addPage();
    let y = MARGIN_TOP;

    y = drawSectionHeader(doc, "Vehicle Photos", y) + 8;

    if (!vehicleImages.length) {
        doc.font("Helvetica").fontSize(9).fillColor(COLORS.gray)
            .text("No vehicle photos uploaded.", MARGIN_LEFT, y, {
                width: CONTENT_WIDTH
            });
        return;
    }

    const gap = 10;
    const columns = 2;
    const cardWidth = (CONTENT_WIDTH - gap) / columns;
    const cardHeight = 205;

    for (let i = 0; i < vehicleImages.length; i++) {
        const col = i % columns;
        const rowIndex = Math.floor(i / columns);

        if (col === 0 && i > 0) {
            y += cardHeight + gap;
        }

        if (y + cardHeight > PAGE_BOTTOM) {
            y = newPage(doc, reportId);
            y = drawSectionHeader(doc, "Vehicle Photos - Continued", y) + 8;
        }

        const x = MARGIN_LEFT + col * (cardWidth + gap);
        const image = vehicleImages[i];

        doc.roundedRect(x, y, cardWidth, cardHeight, 5)
            .fillAndStroke(COLORS.white, COLORS.border);

        const title = firstValue(
            image,
            ["image_type", "imageType", "type"],
            `Vehicle Photo ${i + 1}`
        );

        doc.font("Helvetica-Bold").fontSize(8).fillColor(COLORS.dark)
            .text(title, x + 8, y + 8, {
                width: cardWidth - 16,
                ellipsis: true,
                align: "center"
            });

        try {
            doc.image(image.filePath, x + 8, y + 25, {
                fit: [cardWidth - 16, cardHeight - 33],
                align: "center",
                valign: "center"
            });
        } catch (error) {
            doc.font("Helvetica").fontSize(8).fillColor(COLORS.gray)
                .text("Image could not be loaded", x + 8, y + cardHeight / 2, {
                    width: cardWidth - 16,
                    align: "center"
                });
        }

        if (col === 1 || i === vehicleImages.length - 1) {
            // The y increment happens at the next item.
        }
    }
};

// ======================================================
// INSPECTION SUMMARY
// ======================================================

const drawInspectionSummary = (doc, report, y, reportId) => {
    y = ensureSpace(doc, y, 150, reportId);
    y = drawSectionHeader(doc, "Inspection Summary", y) + 8;

    const engineRemark = firstValue(
        report,
        ["engine_remark", "engineRemark", "engine_notes", "engineNotes"],
        firstValue(report.inspection, ["engine_remark", "engineRemark"], "-")
    );

    const overallRemark = firstValue(
        report,
        ["overall_remark", "overallRemark", "remarks", "remark"],
        firstValue(report.inspection, ["overall_remark", "overallRemark"], "-")
    );

    const employeeRemark = firstValue(
        report,
        ["employeeRemark", "employee_remark"],
        ""
    );

    const score = firstValue(
        report,
        ["overall_score", "overallScore", "score"],
        firstValue(report.inspection, ["overall_score", "overallScore", "score"], "-")
    );

    const boxGap = 8;
    const scoreWidth = 100;
    const remarkWidth = (CONTENT_WIDTH - scoreWidth - boxGap * 2) / 2;
    const boxHeight = 85;

    // Score.
    doc.roundedRect(MARGIN_LEFT, y, scoreWidth, boxHeight, 6)
        .fillAndStroke(COLORS.lightBlue, COLORS.border);

    doc.font("Helvetica-Bold").fontSize(6.5).fillColor(COLORS.gray)
        .text("OVERALL SCORE", MARGIN_LEFT + 9, y + 10);

    doc.font("Helvetica-Bold").fontSize(25).fillColor(COLORS.dark)
        .text(formatScore(score), MARGIN_LEFT + 9, y + 28);

    doc.font("Helvetica-Bold").fontSize(9).fillColor(COLORS.dark)
        .text("/ 10", MARGIN_LEFT + 62, y + 41);

    const drawRemarkBox = (x, label, value) => {
        doc.roundedRect(x, y, remarkWidth, boxHeight, 6)
            .fillAndStroke(COLORS.lightBlue, COLORS.border);

        doc.font("Helvetica-Bold").fontSize(6.5).fillColor(COLORS.gray)
            .text(label, x + 9, y + 10);

        doc.font("Helvetica").fontSize(8.5).fillColor(COLORS.dark)
            .text(safeString(value), x + 9, y + 27, {
                width: remarkWidth - 18,
                height: boxHeight - 34,
                lineGap: 1.5
            });
    };

    const firstX = MARGIN_LEFT + scoreWidth + boxGap;
    const secondX = firstX + remarkWidth + boxGap;

    drawRemarkBox(firstX, "ENGINE REMARK", engineRemark);
    drawRemarkBox(secondX, "OVERALL REMARK", overallRemark);

    y += boxHeight + 10;

    if (employeeRemark) {
        y = ensureSpace(doc, y, 65, reportId);

        doc.roundedRect(MARGIN_LEFT, y, CONTENT_WIDTH, 58, 6)
            .fillAndStroke(COLORS.white, COLORS.border);

        doc.font("Helvetica-Bold").fontSize(6.5).fillColor(COLORS.gray)
            .text("EMPLOYEE REMARK", MARGIN_LEFT + 9, y + 9);

        doc.font("Helvetica").fontSize(8.5).fillColor(COLORS.dark)
            .text(employeeRemark, MARGIN_LEFT + 9, y + 24, {
                width: CONTENT_WIDTH - 18,
                height: 27,
                lineGap: 1.5
            });

        y += 68;
    }

    return y;
};

// ======================================================
// NORMALIZED REPORT
// ======================================================

const buildNormalizedReport = (report) => {
    const vehicle =
        report?.vehicle && typeof report.vehicle === "object"
            ? report.vehicle
            : {};

    const normalized = {
        ...report,
        vehicle,
        inspection:
            report?.inspection && typeof report.inspection === "object"
                ? report.inspection
                : {},
        overall_score: firstValue(
            report,
            ["overall_score", "overallScore", "score"],
            firstValue(report?.inspection, ["overall_score", "overallScore", "score"], "-")
        ),
        engine_remark: firstValue(
            report,
            ["engine_remark", "engineRemark", "engine_notes", "engineNotes"],
            firstValue(report?.inspection, ["engine_remark", "engineRemark"], "-")
        ),
        overall_remark: firstValue(
            report,
            ["overall_remark", "overallRemark", "remarks", "remark"],
            firstValue(report?.inspection, ["overall_remark", "overallRemark"], "-")
        )
    };

    return normalized;
};

// ======================================================
// GENERATE PDF
// ======================================================

const generateInspectionReportPdf = (report) => {
    return new Promise((resolve, reject) => {
        (async () => {
            try {
                if (!report || typeof report !== "object") {
                    throw new Error("Inspection report data is missing.");
                }

                const reportId = getReportId(report);
                if (reportId === "-") {
                    throw new Error("Report ID is missing.");
                }

                const normalizedReport = buildNormalizedReport(report);
                const detailedRows = mergeDetailedRemarks(
                    normalizeDetailedChecklist(normalizedReport),
                    normalizedReport
                );

                const allImages = await loadVehicleImages(normalizedReport);
                const detailedImages = new Map();

                for (const image of allImages) {
                    if (!isDetailedImage(image)) continue;

                    const key = getDetailedImageKey(image);
                    if (key) detailedImages.set(key, image);
                }

                const reportsDirectory = path.join(
                    process.cwd(),
                    "uploads",
                    "reports"
                );

                if (!fs.existsSync(reportsDirectory)) {
                    fs.mkdirSync(reportsDirectory, { recursive: true });
                }

                const carId = getCarId(normalizedReport);
                const safeCarId = carId === "-" ? "vehicle" : carId;
                const fileName = `car-${safeCarId}-inspection-report-${reportId}.pdf`;
                const filePath = path.join(reportsDirectory, fileName);

                const doc = new PDFDocument({
                    size: "A4",
                    margin: 0,
                    autoFirstPage: true,
                    bufferPages: false
                });

                const stream = fs.createWriteStream(filePath);

                stream.on("error", reject);
                doc.on("error", reject);

                stream.on("finish", () => {
                    resolve({
                        fileName,
                        filePath,
                        pdfPath: `uploads/reports/${fileName}`
                    });
                });

                doc.pipe(stream);

                // ==================================================
                // PAGE 1+ : VEHICLE DETAILS ONLY
                // No customer name, mobile, email or address.
                // ==================================================

                let y = drawHeader(doc, normalizedReport);
                y = drawVehicleDetails(doc, normalizedReport, y, reportId);

                // ==================================================
                // DETAILED VEHICLE INSPECTION CHECKLIST
                // ==================================================

                drawFooter(doc, reportId);
                drawDetailedChecklist(
                    doc,
                    detailedRows,
                    detailedImages,
                    reportId
                );

                // ==================================================
                // VEHICLE PHOTOS - SEPARATE SECTION
                // ==================================================

                drawVehiclePhotos(doc, allImages, reportId);

                // ==================================================
                // INSPECTION SUMMARY - SEPARATE SECTION
                // ==================================================

                doc.addPage();
                y = MARGIN_TOP;
                y = drawInspectionSummary(doc, normalizedReport, y, reportId);

                drawFooter(doc, reportId);
                doc.end();
            } catch (error) {
                console.error("Generate Inspection PDF Error:", error);
                reject(error);
            }
        })();
    });
};

module.exports = {
    generateInspectionReportPdf
};
