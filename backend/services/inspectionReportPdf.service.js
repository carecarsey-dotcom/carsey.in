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

// ======================================================
// EMPLOYEE DETAILED INSPECTION MASTER OPTIONS
// These are the exact checkbox options used by Employee Inspection.
// The database stores selected options, while the PDF needs to show
// every available option with the selected option(s) ticked.
// ======================================================
const DETAILED_CHECKLIST_OPTIONS = {
    exterior: {
        "Door Front RHS": ["Ok/No imperfection", "Broking/Crack", "Dented", "Rusted", "Scratch", "Paint Mismatch", "Repair + Repaint"],
        "Door Rear RHS": ["Ok/No imperfection", "Broking/Crack", "Dented", "Rusted", "Scratch", "Paint Mismatch", "Repair + Repaint"],
        "Door Front LHS": ["Ok/No imperfection", "Broking/Crack", "Dented", "Rusted", "Scratch", "Paint Mismatch", "Repair + Repaint"],
        "Door Rear LHS": ["Ok/No imperfection", "Broking/Crack", "Dented", "Rusted", "Scratch", "Paint Mismatch", "Repair + Repaint"],
        "ORVM RHS": ["Ok/No imperfection", "Scratch + Faded", "Mirror Crack", "Folding Motor Not Working", "Light Not Working"],
        "ORVM LHS": ["Ok/No imperfection", "Scratch + Faded", "Mirror Crack", "Folding Motor Not Working", "Light Not Working"],
        "Pillar A - RHS": ["Ok/No imperfection", "Paint Faded / Mismatch", "Scratches", "Dent", "Rusting", "Repaired + Welded"],
        "Pillar B - RHS": ["Ok/No imperfection", "Paint Faded / Mismatch", "Scratches", "Dent", "Rusting", "Repaired + Welded"],
        "Pillar C - RHS": ["Ok/No imperfection", "Paint Faded / Mismatch", "Scratches", "Dent", "Rusting", "Repaired + Welded"],
        "Pillar A - LHS": ["Ok/No imperfection", "Paint Faded / Mismatch", "Scratches", "Dent", "Rusting", "Repaired + Welded"],
        "Pillar B - LHS": ["Ok/No imperfection", "Paint Faded / Mismatch", "Scratches", "Dent", "Rusting", "Repaired + Welded"],
        "Pillar C - LHS": ["Ok/No imperfection", "Paint Faded / Mismatch", "Scratches", "Dent", "Rusting", "Repaired + Welded"],
        "Quarter Panel RHS": ["Ok/No imperfection", "Fuel Lid Lock Not Working", "Paint Issue + Mismatch + Faded", "Dent", "Rusting", "Scratches", "Repair + Repaint + Welded"],
        "Quarter Panel LHS": ["Ok/No imperfection", "Fuel Lid Lock Not Working", "Paint Issue + Mismatch + Faded", "Dent", "Rusting", "Scratches", "Repair + Repaint + Welded"],
        "Running Board RHS": ["Ok/No imperfection", "Scratches", "Dent", "Rusted", "Cladding Broken / Not Fixed Properly", "Paint Mismatch / Hole / Crack"],
        "Running Board LHS": ["Ok/No imperfection", "Scratches", "Dent", "Rusted", "Cladding Broken / Not Fixed Properly", "Paint Mismatch / Hole / Crack"],
        "Dicky / Boot Door": ["Ok/No imperfection", "Scratches", "Dent", "Rusted", "Boot Partial Missing", "Jack & Tools Missing", "Shocker Not Working", "Dicky Lock Not Working", "Spoiler Broken / Damage"],
        "Tyre Front RHS": ["Ok/No imperfection", "Tyre Crack", "Rim Rusting", "Wheel Cap Missing", "Lug Nut Missing"],
        "Tyre Rear RHS": ["Ok/No imperfection", "Tyre Crack", "Rim Rusting", "Wheel Cap Missing", "Lug Nut Missing"],
        "Tyre Front LHS": ["Ok/No imperfection", "Tyre Crack", "Rim Rusting", "Wheel Cap Missing", "Lug Nut Missing"],
        "Tyre Rear LHS": ["Ok/No imperfection", "Tyre Crack", "Rim Rusting", "Wheel Cap Missing", "Lug Nut Missing"],
        "Spare Tyre": ["Ok/No imperfection", "Tyre Crack", "Rim Rusting", "Wheel Cap Missing", "Lug Nut Missing"],
        "Boot Floor": ["Ok/No imperfection", "Water Logging", "Welded / Repaired", "Rusting", "Dent", "Hole & Crack"],
        "Fender RHS": ["Ok/No imperfection", "Dent", "Scratch", "Rusting", "Lug Missing"],
        "Fender LHS": ["Ok/No imperfection", "Dent", "Scratch", "Rusting", "Lug Missing"],
        "Bonnet / Hood": ["Ok/No imperfection", "Dent", "Scratch", "Rusting", "Scooper Not Working", "Crack / Hole"],
        "Upper Cross Member": ["Ok/No imperfection", "Rusting", "Damage", "Repaired / Welded"],
        "Roof": ["Ok/No imperfection", "Paint Mismatch + Faded", "Dent", "Crack / Hole", "Scratches", "Roof Rail Broken", "Sun Roof Not Working"],
        "Apron Both RHS": ["Ok/No imperfection", "Repaired / Welded", "Repainted", "Rusting", "Dent", "Crack / Hole"],
        "Apron Both LHS": ["Ok/No imperfection", "Repaired / Welded", "Repainted", "Rusting", "Dent", "Crack / Hole"],
        "Firewall": ["Ok/No imperfection", "Rusted", "Cover Damage", "Carpet Damage", "Crack & Hole", "Repaired / Welded"]
    },
    engine_bay: {
        "Engine Oil": ["Ok/No imperfection", "Level Low", "Dirty", "Replace Oil"],
        "Cooling System": ["Ok/No imperfection", "Mixed With Oil", "Bottle Broken + Leakage", "Coolant Dirty"],
        "Engine": ["Ok/No imperfection", "Leakage From Seal", "Tappet Cover Loose", "Engine Misfiring", "Dipstick Missing / Broken", "Exhaust Smoke", "Air Filter Box Damage", "RPM Fluctuate", "Fuse Box Cover Missing"],
        "UnderBody": ["Ok/No imperfection", "Rusted", "Repaired + Welded"],
        "Engine Blow By": ["Ok/No imperfection", "Engine Permissible Low Blow By", "Engine Blow By / Back Compressor"],
        "Transmission": ["Ok/No imperfection", "Low Pickup", "Clutch Noise", "Bearing Damage", "Spongy Clutch"],
        "Gear Shifting / Gear Box Mount": ["Ok/No imperfection", "Hard", "Bearing Damage", "Broken", "Gear Box Mount Damage"],
        "Turbocharger": ["Ok/No imperfection", "Not Applicable", "Housing Worn Out", "Not Working", "Oil Leakage", "Bearing Damage"],
        "Battery": ["Ok/No imperfection", "Battery Terminal Broken", "Acid Leakage", "Dead / Not Restart"],
        "Alternator": ["Ok/No imperfection", "Not Charging", "Bearing Damage", "Belt Damage"],
        "Engine Assembly": ["Ok/No imperfection", "Engine Mount Broken", "Leakage From Exhaust Pipe", "Starter Motor Noise"],
        "Radiator Support": ["Ok/No imperfection", "Leakage", "Support Broken", "Radiator Cap Missing", "Support Welding", "Support Rusted", "Damage / Breakage"],
        "Axle": ["Ok/No imperfection", "Boot Damage", "Boot Leakage", "Broken"],
        "4WD / AWD": ["Ok/No imperfection", "Not Applicable", "Leakage", "Switch Not Working"]
    },
    suspension_steering: {
        "Suspension": ["Ok/No imperfection", "Lower + Upper Arm Noise", "Major Leakage Noise", "Boot Damage", "Strut Noise", "Shocker Mount Noise"],
        "Brakes Front RHS": ["Ok/No imperfection", "Brake Oil Cap Missing", "Brake Oil Level Low", "Brake Pad Worn Out", "Brake Disk Worn Out"],
        "Brakes Rear RHS": ["Ok/No imperfection", "Brake Oil Cap Missing", "Brake Oil Level Low", "Brake Pad Worn Out", "Brake Disk Worn Out"],
        "Brakes Front LHS": ["Ok/No imperfection", "Brake Oil Cap Missing", "Brake Oil Level Low", "Brake Pad Worn Out", "Brake Disk Worn Out"],
        "Brakes Rear LHS": ["Ok/No imperfection", "Brake Oil Cap Missing", "Brake Oil Level Low", "Brake Pad Worn Out", "Brake Disk Worn Out"],
        "Jumping Rod Bush Front RHS": ["Ok/No imperfection", "Rusting", "Assembly Noise"],
        "Jumping Rod Bush Rear RHS": ["Ok/No imperfection", "Rusting", "Assembly Noise"],
        "Jumping Rod Bush Rear LHS": ["Ok/No imperfection", "Rusting", "Assembly Noise"],
        "Jumping Rod Bush Front LHS": ["Ok/No imperfection", "Rusting", "Assembly Noise"],
        "Steering": ["Ok/No imperfection", "Rack Boot Damage", "Steering Pump Hard", "Power Steering Oil Dirty", "Steering Rack Noise"],
        "Brake Master Cylinder": ["Ok/No imperfection", "Leakage", "Hard Brake", "Spongy Brake"]
    },
    interior_electricals: {
        "Cabinette Switch": ["Ok/No imperfection", "Switch Broken", "Not Working"],
        "All Window Switch": ["Ok/No imperfection", "Not Working", "Power Window Noise", "Switch Damage", "Broken"],
        "Dashboard": ["Ok/No imperfection", "Faded", "Glove Box Cover Damage", "Broken", "Bonnet Lever Not Working", "Scratches"],
        "Flooring": ["Ok/No imperfection", "Water On Floor", "Floor Rusting", "Mat Missing", "Crack & Hole"],
        "Ceiling": ["Ok/No imperfection", "Sun Visor Missing + Damage", "Roof Handle Missing + Broken", "Rear View Mirror Broken"],
        "Lock System": ["Ok/No imperfection", "Remote Key Not Working + Broken", "Door Lock Knob Broken / Missing", "Keyless Sensor Not Working", "Mechanical Key Damage", "Push Start Not Working"],
        "Seat All": ["Ok/No imperfection", "Seat Belt Damage", "Dirty", "Cover Torn", "Seat Adjuster Not Working"],
        "Steering Handle": ["Ok/No imperfection", "Horn Not Working", "Steering Handle Faded", "Steering System Control Not Working"],
        "Gear Lever": ["Ok/No imperfection", "Boot Cover Torn", "Knob Torn", "Knob Broken"],
        "Infotainment System": ["Ok/No imperfection", "Not Applicable", "Music System Crack", "Speaker Not Working / Broken"],
        "Instrument Cluster": ["Ok/No imperfection", "Odometer Not Working", "Glass Scratch / Minor / Major Deep", "Speedometer Not Working", "Tachometer Not Working", "Air Bag Deployed", "Air Bag Warning Light Glowing", "Fuel Low", "EPS", "Air Suspension", "Alternator + Battery", "Air Bag", "ABS", "Transmission Warning", "Oil Pressure Low", "Engine Warning", "Cruise Control", "Non-Critical Warning Light", "Trip Meter", "Idle Start / Stop Not Working"]
    },
    electricals_ac: {
        "AC Unit": ["Ok/No imperfection", "AC Cooling Not Working", "AC Vent Not Fixed / Broken", "Blower Motor Not Working", "Noise", "Heater Ineffective", "AC Not Cooling", "Cooling Fan Noise"],
        "Head Light Both": ["Ok/No imperfection", "Fading", "Broken", "Crack", "Moisture", "Scratch", "Light Not Working"],
        "Fog Light Both": ["Ok/No imperfection", "Not Applicable", "Fading", "Broken", "Crack", "Moisture", "Scratch", "Light Not Working"],
        "Tail Light": ["Ok/No imperfection", "Fading", "Broken", "Crack", "Moisture", "Scratch", "Light Not Working"]
    },
    transmission_system: {
        "Transmission Overall": ["Ok/No imperfection", "Low Pickup", "Clutch Noise", "Bearing Damage", "Spongy Clutch", "Gear Shifting Hard"]
    },
    braking_system: {
        "Brake Overall": ["Ok/No imperfection", "Brake Oil Cap Missing", "Brake Oil Level Low", "Brake Pad Worn Out", "Brake Disk Worn Out", "Hard Brake", "Spongy Brake"]
    },
    tires_wheels: {
        "Tyres / Wheels Overall": ["Ok/No imperfection", "Tyre Crack", "Rim Rusting", "Wheel Cap Missing", "Lug Nut Missing"]
    },
    documents_title: {
        "Documents / Title": ["Ok/No imperfection", "RC Available", "Insurance Available", "PUC Available", "Service History Available", "Duplicate Key Available", "Chassis / VIN Match", "Registration Details Match"]
    }
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

const unwrapChecklistPayload = (payload) => {
    let value = parseJsonIfNeeded(payload);

    for (let i = 0; i < 10; i++) {
        if (!value || typeof value !== "object" || Array.isArray(value)) {
            break;
        }

        const nested = firstValue(
            value,
            [
                "item",
                "data",
                "value",
                "checklist_item",
                "checklistItem",
                "inspection_data",
                "inspectionData"
            ],
            undefined
        );

        if (nested === undefined || nested === null || nested === value) {
            break;
        }

        const parsedNested = parseJsonIfNeeded(nested);

        if (!parsedNested || typeof parsedNested !== "object") {
            break;
        }

        value = parsedNested;
    }

    return value;
};

const expandChecklistArray = (checklist) => {
    if (!Array.isArray(checklist)) {
        return checklist;
    }

    const result = [];

    const walk = (value) => {
        value = parseJsonIfNeeded(value);

        if (Array.isArray(value)) {
            for (const item of value) {
                walk(item);
            }
            return;
        }

        if (!value || typeof value !== "object") {
            return;
        }

        const nested = firstValue(
            value,
            [
                "items",
                "data",
                "checklist",
                "inspection_data",
                "inspectionData"
            ],
            undefined
        );

        const parsedNested = parseJsonIfNeeded(nested);

        if (Array.isArray(parsedNested)) {
            walk(parsedNested);
            return;
        }

        result.push(value);
    };

    walk(checklist);

    return result;
};

const getAvailableOptions = (
    sectionKey,
    rowName,
    selectedOptions = []
) => {
    const section =
        DETAILED_CHECKLIST_OPTIONS[String(sectionKey)] ||
        DETAILED_CHECKLIST_OPTIONS[sectionKey];

    if (section && typeof section === "object") {
        if (Array.isArray(section[String(rowName)])) {
            return [...section[String(rowName)]];
        }

        const normalizedRowName = String(rowName || "")
            .trim()
            .toLowerCase();

        const matchedKey = Object.keys(section).find(
            (key) => key.trim().toLowerCase() === normalizedRowName
        );

        if (matchedKey && Array.isArray(section[matchedKey])) {
            return [...section[matchedKey]];
        }
    }

    return [
        ...new Set(
            (Array.isArray(selectedOptions) ? selectedOptions : [])
                .map((option) => String(option).trim())
                .filter(Boolean)
        )
    ];
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

    return Array.isArray(checklist) ? expandChecklistArray(checklist) : checklist;
};

const normalizeDetailedChecklist = (report) => {
    const raw = getRawChecklist(report);
    const result = [];

    // --------------------------------------------------
    // ARRAY FORMAT - database / employee payload
    // --------------------------------------------------
    if (Array.isArray(raw)) {
        raw.forEach((rawItem, index) => {
            if (!rawItem || typeof rawItem !== "object") return;

            const item = unwrapChecklistPayload(rawItem);
            if (!item || typeof item !== "object" || Array.isArray(item)) return;

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

            const availableOptions = getAvailableOptions(
                sectionKey,
                rowName,
                selectedOptions
            );

            const remark = safeString(
                firstValue(item, ["remark", "remarks", "note", "comment"], ""),
                ""
            );

            const status = safeString(
                firstValue(item, ["status", "condition", "result"], ""),
                selectedOptions.some((option) => option !== "Ok/No imperfection")
                    ? "Need Attention"
                    : "Good"
            );

            result.push({
                sectionKey: String(sectionKey),
                sectionTitle: String(sectionTitle),
                rowName: String(rowName),
                availableOptions,
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
                const availableOptions = getAvailableOptions(sectionKey, rowName, selectedOptions);

                result.push({
                    sectionKey,
                    sectionTitle,
                    rowName,
                    availableOptions,
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

const drawAllOptions = (doc, availableOptions, selectedOptions, x, y, width) => {
    const options = Array.isArray(availableOptions) && availableOptions.length
        ? availableOptions
        : (selectedOptions || []);

    const selectedSet = new Set(
        (selectedOptions || []).map((option) => String(option).trim().toLowerCase())
    );

    doc.font("Helvetica-Bold").fontSize(7).fillColor(COLORS.gray)
        .text("INSPECTION OPTIONS", x, y, { width });

    y += 13;

    if (!options.length) {
        doc.font("Helvetica").fontSize(8.5).fillColor(COLORS.gray)
            .text("No option selected", x, y, { width });
        return y + 12;
    }

    for (const option of options) {
        const label = String(option);
        const selected = selectedSet.has(label.trim().toLowerCase());

        doc.roundedRect(x, y + 1, 9, 9, 1)
            .fillAndStroke(COLORS.white, COLORS.border);

        if (selected) {
            // Draw the tick with PDF lines instead of a Unicode glyph so it
            // renders correctly with PDFKit's built-in fonts.
            doc.save();
            doc.strokeColor(COLORS.blue).lineWidth(1.4);
            doc.moveTo(x + 2, y + 6)
                .lineTo(x + 4, y + 8)
                .lineTo(x + 8, y + 3)
                .stroke();
            doc.restore();
        }

        doc.font("Helvetica").fontSize(8.2).fillColor(COLORS.dark)
            .text(label, x + 15, y, {
                width: width - 15,
                lineGap: 1
            });

        const height = doc.heightOfString(label, {
            width: width - 15,
            lineGap: 1
        });

        y += Math.max(13, height + 3);
    }

    return y;
};

const drawDetailedRow = (doc, row, detailedImage, y, reportId) => {
    const textWidth = CONTENT_WIDTH - 20;
    const title = safeString(row.rowName, "Inspection Item");
    const availableOptions = row.availableOptions || [];
    const selectedOptions = row.selectedOptions || [];
    const remark = row.remark || "";

    // Keep the complete row together when possible. If the row is larger than
    // one page, ensureSpace() below will create continuation pages naturally.
    y = ensureSpace(doc, y, 55, reportId);

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

    y = drawAllOptions(
        doc,
        availableOptions,
        selectedOptions,
        MARGIN_LEFT + 10,
        y,
        textWidth
    ) + 7;

    if (detailedImage) {
        const imageHeight = 145;
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
        const remarkHeight = doc.heightOfString(remark, {
            width: textWidth,
            lineGap: 1.5
        });

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
