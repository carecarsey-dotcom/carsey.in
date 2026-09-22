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

// ======================================================
// CARSEY.IN PDF BRANDING
// ======================================================
const PDF_OFFICE_ADDRESS =
    "LGC-11, Galaxy Diamond Plaza, Lower Ground Floor, Plot C-1A, Sector 4, Greater Noida West";

const PDF_CONTACT_NUMBER =
    "9329833404";

const resolvePdfLogoPath = () => {
    const candidates = [
        // Actual backend logo location used by this project.
        path.join(process.cwd(), "uploads", "favicon.png"),
        path.join(__dirname, "..", "uploads", "favicon.png"),

        // Existing/fallback logo locations are preserved.
        path.join(process.cwd(), "uploads", "logo.png"),
        path.join(__dirname, "..", "uploads", "logo.png"),
        path.join(process.cwd(), "public", "favicon.png"),
        path.join(process.cwd(), "public", "logo.png"),
        path.join(process.cwd(), "public", "images", "logo.png"),

        // Angular frontend logo fallback.
        path.join(process.cwd(), "frontend", "src", "assets", "images", "carsey-logo.png"),
        path.join(__dirname, "..", "..", "frontend", "src", "assets", "images", "carsey-logo.png"),
        path.join(__dirname, "..", "..", "frontend", "public", "images", "carsey-logo.png"),

        path.join(__dirname, "..", "public", "favicon.png"),
        path.join(__dirname, "..", "public", "logo.png"),
        path.join(__dirname, "..", "public", "images", "logo.png")
    ];

    for (const candidate of candidates) {
        try {
            if (fs.existsSync(candidate)) {
                return candidate;
            }
        } catch (error) {
            // Continue.
        }
    }

    return null;
};

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
    // Legacy section keys retained for old saved reports.
    // normalizeDetailedSectionKey() maps them into the consolidated sections.
    transmission_system: "ENGINE + TRANSMISSION",
    braking_system: "ELECTRICAL + INTERIOR + FEATURES",
    tires_wheels: "EXTERIOR + TYRE",
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

  // ==================== FRONT SIDE ====================

  "Front Bumper": [
    "Ok/No imperfection",
    "Broken/Crack",
    "Dent",
    "Scratch",
    "Paint Mismatch",
    "Repair + Repaint"
  ],

  "Bonnet / Hood": [
    "Ok/No imperfection",
    "Dent",
    "Scratch",
    "Rusting",
    "Scooper Not Working",
    "Crack / Hole"
  ],

  "Front Windshield": [
    "Ok/No imperfection",
    "Glass Crack",
    "Glass Chip",
    "Scratch",
    "Rubber Damage",
    "Water Leakage"
  ],

  "Roof": [
    "Ok/No imperfection",
    "Paint Mismatch + Faded",
    "Dent",
    "Crack / Hole",
    "Scratches",
    "Roof Rail Broken",
    "Sun Roof Not Working"
  ],

  // Kept here for legacy exterior records; normalization renders it in ENGINE + TRANSMISSION.
  "Upper Cross Member": [
    "Ok/No imperfection",
    "Rusting",
    "Damage",
    "Repaired / Welded"
  ],

  // ==================== RIGHT SIDE ====================

  "RHS Fender": [
    "Ok/No imperfection",
    "Dent",
    "Scratch",
    "Rusting",
    "Lug Missing"
  ],

  "RHS Front Tyre": [
    "Ok/No imperfection",
    "Tyre Crack",
    "Rim Rusting",
    "Wheel Cap Missing",
    "Lug Nut Missing"
  ],

  "RHS Front Door": [
    "Ok/No imperfection",
    "Broken/Crack",
    "Dented",
    "Rusted",
    "Scratch",
    "Paint Mismatch",
    "Repair + Repaint"
  ],

  "RHS ORVM": [
    "Ok/No imperfection",
    "Scratch + Faded",
    "Mirror Crack",
    "Folding Motor Not Working",
    "Light Not Working"
  ],

  "RHS A-Pillar": [
    "Ok/No imperfection",
    "Paint Faded / Mismatch",
    "Scratches",
    "Dent",
    "Rusting",
    "Repaired + Welded"
  ],

  "RHS B-Pillar": [
    "Ok/No imperfection",
    "Paint Faded / Mismatch",
    "Scratches",
    "Dent",
    "Rusting",
    "Repaired + Welded"
  ],

  "RHS C-Pillar": [
    "Ok/No imperfection",
    "Paint Faded / Mismatch",
    "Scratches",
    "Dent",
    "Rusting",
    "Repaired + Welded"
  ],

  "RHS Rear Door": [
    "Ok/No imperfection",
    "Broken/Crack",
    "Dented",
    "Rusted",
    "Scratch",
    "Paint Mismatch",
    "Repair + Repaint"
  ],

  "RHS Running Board": [
    "Ok/No imperfection",
    "Scratches",
    "Dent",
    "Rusted",
    "Cladding Broken / Not Fixed Properly",
    "Paint Mismatch / Hole / Crack"
  ],

  "RHS Rear Tyre": [
    "Ok/No imperfection",
    "Tyre Crack",
    "Rim Rusting",
    "Wheel Cap Missing",
    "Lug Nut Missing"
  ],

  "RHS Quarter Panel": [
    "Ok/No imperfection",
    "Fuel Lid Lock Not Working",
    "Paint Issue + Mismatch + Faded",
    "Dent",
    "Rusting",
    "Scratches",
    "Repair + Repaint + Welded"
  ],


  // ==================== REAR SIDE ====================

  "Dicky / Boot Door": [
    "Ok/No imperfection",
    "Scratches",
    "Dent",
    "Rusted",
    "Boot Partial Missing",
    "Jack & Tools Missing",
    "Shocker Not Working",
    "Dicky Lock Not Working",
    "Spoiler Broken / Damage"
  ],

  "Rear Windshield": [
    "Ok/No imperfection",
    "Glass Crack",
    "Glass Chip",
    "Scratch",
    "Rubber Damage",
    "Water Leakage"
  ],

  "Spare Tyre": [
    "Ok/No imperfection",
    "Tyre Crack",
    "Rim Rusting",
    "Wheel Cap Missing",
    "Lug Nut Missing"
  ],

  "Boot Floor": [
    "Ok/No imperfection",
    "Water Logging",
    "Welded / Repaired",
    "Rusting",
    "Dent",
    "Hole & Crack"
  ],

  "Rear Bumper": [
    "Ok/No imperfection",
    "Broken/Crack",
    "Dent",
    "Scratch",
    "Paint Mismatch",
    "Repair + Repaint"
  ],


  // ==================== LEFT SIDE ====================

  "LHS Quarter Panel": [
    "Ok/No imperfection",
    "Fuel Lid Lock Not Working",
    "Paint Issue + Mismatch + Faded",
    "Dent",
    "Rusting",
    "Scratches",
    "Repair + Repaint + Welded"
  ],

  "LHS Rear Tyre": [
    "Ok/No imperfection",
    "Tyre Crack",
    "Rim Rusting",
    "Wheel Cap Missing",
    "Lug Nut Missing"
  ],

  "LHS Running Board": [
    "Ok/No imperfection",
    "Scratches",
    "Dent",
    "Rusted",
    "Cladding Broken / Not Fixed Properly",
    "Paint Mismatch / Hole / Crack"
  ],

  "LHS Rear Door": [
    "Ok/No imperfection",
    "Broken/Crack",
    "Dented",
    "Rusted",
    "Scratch",
    "Paint Mismatch",
    "Repair + Repaint"
  ],

  "LHS C-Pillar": [
    "Ok/No imperfection",
    "Paint Faded / Mismatch",
    "Scratches",
    "Dent",
    "Rusting",
    "Repaired + Welded"
  ],

  "LHS B-Pillar": [
    "Ok/No imperfection",
    "Paint Faded / Mismatch",
    "Scratches",
    "Dent",
    "Rusting",
    "Repaired + Welded"
  ],

  "LHS A-Pillar": [
    "Ok/No imperfection",
    "Paint Faded / Mismatch",
    "Scratches",
    "Dent",
    "Rusting",
    "Repaired + Welded"
  ],

  "LHS Front Door": [
    "Ok/No imperfection",
    "Broken/Crack",
    "Dented",
    "Rusted",
    "Scratch",
    "Paint Mismatch",
    "Repair + Repaint"
  ],

  "LHS ORVM": [
    "Ok/No imperfection",
    "Scratch + Faded",
    "Mirror Crack",
    "Folding Motor Not Working",
    "Light Not Working"
  ],

  "LHS Front Tyre": [
    "Ok/No imperfection",
    "Tyre Crack",
    "Rim Rusting",
    "Wheel Cap Missing",
    "Lug Nut Missing"
  ],

  "LHS Fender": [
    "Ok/No imperfection",
    "Dent",
    "Scratch",
    "Rusting",
    "Lug Missing"
  ],

  "Tyres / Wheels Overall": [
    "Ok/No imperfection",
    "Tyre Crack",
    "Rim Rusting",
    "Wheel Cap Missing",
    "Lug Nut Missing"
  ],


  // ==================== INNER / ENGINE AREA ====================

},
    engine_bay: {
        "Apron RHS": [
            "Ok/No imperfection",
            "Repaired / Welded",
            "Repainted",
            "Rusting",
            "Dent",
            "Crack / Hole"
        ],
        "Apron LHS": [
            "Ok/No imperfection",
            "Repaired / Welded",
            "Repainted",
            "Rusting",
            "Dent",
            "Crack / Hole"
        ],
        "Firewall": [
            "Ok/No imperfection",
            "Rusted",
            "Cover Damage",
            "Carpet Damage",
            "Crack & Hole",
            "Repaired / Welded"
        ],
        "Engine Oil": ["Ok/No imperfection", "Level Low", "Dirty", "Replace Oil"],
        "Cooling System": ["Ok/No imperfection", "Mixed With Oil", "Bottle Broken + Leakage", "Coolant Dirty"],
        "Upper Cross Member": ["Ok/No imperfection", "Rusting", "Damage", "Repaired / Welded"],
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
        // Jumping Rod Bush rows are intentionally not part of the current UI.
        // Old DB rows are ignored during PDF normalization; stored data is untouched.
        "Steering": ["Ok/No imperfection", "Rack Boot Damage", "Steering Pump Hard", "Power Steering Oil Dirty", "Steering Rack Noise"],
        "Brake Master Cylinder": ["Ok/No imperfection", "Leakage", "Hard Brake", "Spongy Brake"]
    },
    interior_electricals: {
        "Cabinette Switch": ["Ok/No imperfection", "Switch Broken", "Not Working"],
        "ALL SIDE WINDOW": ["Ok/No imperfection", "Not Working", "Power Window Noise", "Switch Damage", "Broken"],
        "Dashboard": ["Ok/No imperfection", "Faded", "Glove Box Cover Damage", "Broken", "Bonnet Lever Not Working", "Scratches"],
        "Flooring": ["Ok/No imperfection", "Water On Floor", "Floor Rusting", "Mat Missing", "Crack & Hole"],
        "Ceiling": ["Ok/No imperfection", "Sun Visor Missing + Damage", "Roof Handle Missing + Broken", "Rear View Mirror Broken"],
        "Lock System": ["Ok/No imperfection", "Remote Key Not Working + Broken", "Door Lock Knob Broken / Missing", "Keyless Sensor Not Working", "Mechanical Key Damage", "Push Start Not Working"],
        "Seat All": ["Ok/No imperfection", "Seat Belt Damage", "Dirty", "Cover Torn", "Seat Adjuster Not Working"],
        "Steering Handle": ["Ok/No imperfection", "Horn Not Working", "Steering Handle Faded", "Steering System Control Not Working"],
        "Gear Lever": ["Ok/No imperfection", "Boot Cover Torn", "Knob Torn", "Knob Broken"],
        "Infotainment System": ["Ok/No imperfection", "Not Applicable", "Music System Crack", "Speaker Not Working / Broken"],
        "Instrument Cluster": ["Ok/No imperfection", "Odometer Not Working", "Glass Scratch / Minor / Major Deep", "Speedometer Not Working", "Tachometer Not Working", "Air Bag Deployed", "Air Bag Warning Light Glowing", "Fuel Low", "EPS", "Air Suspension", "Alternator + Battery", "Air Bag", "ABS", "Transmission Warning", "Oil Pressure Low", "Engine Warning", "Cruise Control", "Non-Critical Warning Light", "Trip Meter", "Idle Start / Stop Not Working"],
        "Brake Overall": ["Ok/No imperfection", "Brake Oil Cap Missing", "Brake Oil Level Low", "Brake Pad Worn Out", "Brake Disk Worn Out", "Hard Brake", "Spongy Brake"]
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
    },
    all_seats: {
        "Seat 1st Row RHS": ["Ok/No imperfection", "Seat Belt Damage", "Dirty", "Cover Torn", "Seat Adjuster Not Working"],
        "Seat 1st Row LHS": ["Ok/No imperfection", "Seat Belt Damage", "Dirty", "Cover Torn", "Seat Adjuster Not Working"],
        "Seat 2nd Row RHS": ["Ok/No imperfection", "Seat Belt Damage", "Dirty", "Cover Torn", "Seat Adjuster Not Working"],
        "Seat 2nd Row LHS": ["Ok/No imperfection", "Seat Belt Damage", "Dirty", "Cover Torn", "Seat Adjuster Not Working"],
        "Seat 3rd Row RHS": ["Ok/No imperfection", "Not Applicable", "Seat Belt Damage", "Dirty", "Cover Torn", "Seat Adjuster Not Working"],
        "Seat 3rd Row LHS": ["Ok/No imperfection", "Not Applicable", "Seat Belt Damage", "Dirty", "Cover Torn", "Seat Adjuster Not Working"]
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

const getBookingId = (report) => {
    const vehicle =
        report && report.vehicle && typeof report.vehicle === "object"
            ? report.vehicle
            : {};

    return firstValue(
        report,
        ["bookingId", "booking_id"],
        firstValue(vehicle, ["booking_id", "bookingId"], "-")
    );
};

const getBookingCode = (report) => {
    const bookingId = getBookingId(report);

    if (
        bookingId === undefined ||
        bookingId === null ||
        bookingId === "" ||
        bookingId === "-"
    ) {
        return "-";
    }

    const value = String(bookingId).trim();

    if (/^CAR-\d{6}$/i.test(value)) {
        return value.toUpperCase();
    }

    const numericId = Number(value);

    if (Number.isFinite(numericId)) {
        return `CAR-${String(Math.trunc(numericId)).padStart(6, "0")}`;
    }

    return value;
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

const getImageType = (image) =>
    String(
        firstValue(
            image && typeof image === "object" ? image : {},
            ["image_type", "imageType", "type"],
            ""
        )
    ).trim();

const getImageTitle = (image, fallback = "Image") => {
    const type = getImageType(image);
    if (!type) return fallback;

    const normalized = type.trim();
    const parts = normalized.split("|");
    const prefix = String(parts[0] || "").trim().toLowerCase();

    // Detailed|sectionKey|rowName
    if (prefix === "detailed") {
        return parts.slice(2).join("|").trim() || parts[1]?.trim() || fallback;
    }

    // Document|documentKey|documentTitle
    if (prefix === "document") {
        return parts.slice(2).join("|").trim() || parts[1]?.trim() || fallback;
    }

    // Legacy database format: "Document - RC"
    // The submit service currently stores documents using this format.
    if (prefix.startsWith("document -") || prefix.startsWith("document:")) {
        return normalized
            .replace(/^document\s*[-:]\s*/i, "")
            .trim() || fallback;
    }

    // Test Drive Photo|key|title
    if (prefix === "test drive photo") {
        return parts.slice(2).join("|").trim() || parts[1]?.trim() || fallback;
    }

    // Legacy/alternate test-drive photo formats.
    if (prefix.startsWith("test drive photo -") || prefix.startsWith("test drive photo:")) {
        return normalized
            .replace(/^test\s+drive\s+photo\s*[-:]\s*/i, "")
            .trim() || fallback;
    }

    // Video|key|title
    if (prefix === "video") {
        return parts.slice(2).join("|").trim() || parts[1]?.trim() || fallback;
    }

    // Normal vehicle photo: Front View, Rear View, etc.
    return parts[parts.length - 1]?.trim() || fallback;
};

const isDetailedImage = (image) => {
    const type = getImageType(image).toLowerCase();
    return type.startsWith("detailed|") || type.startsWith("detailed inspection");
};

const isDocumentImage = (image) => {
    const type = getImageType(image)
        .trim()
        .toLowerCase();

    // Current + legacy DB formats:
    // Document|key|title
    // Document: key: title
    // Document - RC
    // Document: RC
    return (
        type.startsWith("document|") ||
        type.startsWith("document:") ||
        type.startsWith("document -")
    );
};

const isTestDrivePhotoImage = (image) => {
    const type = getImageType(image)
        .trim()
        .toLowerCase();

    // Support both current prefixed DB values and the plain option names
    // used by older/current inspection records.
    const title = getImageTitle(image, "")
        .trim()
        .toLowerCase();

    return (
        type.startsWith("test drive photo|") ||
        type.startsWith("test drive photo:") ||
        type.startsWith("test drive photo -") ||
        title === "test drive photo 1" ||
        title === "test drive photo 2"
    );
};

const isVideoImage = (image) => {
    const type = getImageType(image)
        .trim()
        .toLowerCase();

    return (
        type.startsWith("video|") ||
        type.startsWith("video:") ||
        type.startsWith("video -") ||
        type.startsWith("test drive video|") ||
        type.startsWith("test drive video:") ||
        type.startsWith("test drive video -")
    );
};

const normalizeVehiclePhotoTitle = (title = "") => {
    const normalized = String(title || "").trim().toLowerCase();

    const aliases = {
        "front view": "Front View",
        "right side": "Right View",
        "right view": "Right View",
        "rear view": "Rear View",
        "left side": "Left View",
        "left view": "Left View",
        "interior": "Interior Front Seat",
        "interior front seat": "Interior Front Seat",
        "interior seat rear": "Interior Seat Rear",
        "seat": "Interior Seat Rear",
        "engine": "Open Engine",
        "open engine": "Open Engine",
        "dicky": "Open Dicky",
        "open dicky": "Open Dicky",
        "odometer": "Odometer",
        "dashboard": "Dashboard"
    };

    return aliases[normalized] || String(title || "").trim();
};

const isStandardVehiclePhoto = (image) => {
    if (!image) return false;

    // PDF Vehicle Photos must contain ONLY the 10 standard vehicle photo options.
    // This is intentionally a strict whitelist so documents, test-drive photos,
    // inspection videos, test-drive videos, and any unknown media can NEVER
    // appear in the Vehicle Photos section.
    const title = normalizeVehiclePhotoTitle(getImageTitle(image, ""))
        .trim()
        .toLowerCase();

    return VEHICLE_PHOTO_ORDER.some(
        (expectedTitle) => expectedTitle.trim().toLowerCase() === title
    );
};

const getDetailedImageKey = (image) => {
    const type = String(image?.imageType || "").trim();

    if (!type) {
        return "";
    }

    // Employee Inspection upload format:
    // Detailed|sectionKey|rowName
    if (
        type.toLowerCase().startsWith("detailed|")
    ) {
        const parts = type.split("|");

        if (parts.length >= 3) {
            const sectionKey = String(parts[1]).trim();
            const rowName = parts
                .slice(2)
                .join("|")
                .trim();

            if (sectionKey && rowName) {
                const normalizedRowName = normalizeDetailedRowName(rowName);
                const normalizedSectionKey = normalizeDetailedSectionKey(
                    sectionKey,
                    normalizedRowName
                );

                if (normalizedSectionKey === "__removed_jumping_rod_bush__") {
                    return "";
                }

                return `${normalizedSectionKey}__${normalizedRowName}`;
            }
        }
    }

    // Alternative formats.
    const match = type.match(
        /detailed inspection\s*[:|-]\s*(.*?)\s*[:|-]\s*(.*)$/i
    );

    if (match) {
        const sectionKey = String(match[1]).trim();
        const rowName = String(match[2]).trim();

        if (sectionKey && rowName) {
            const normalizedRowName = normalizeDetailedRowName(rowName);
            const normalizedSectionKey = normalizeDetailedSectionKey(
                sectionKey,
                normalizedRowName
            );

            if (normalizedSectionKey === "__removed_jumping_rod_bush__") {
                return "";
            }

            return `${normalizedSectionKey}__${normalizedRowName}`;
        }
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

const normalizeDetailedSectionKey = (sectionKey, rowName = "") => {
    const normalizedSection = String(sectionKey || "").trim().toLowerCase();
    const normalizedRow = String(rowName || "").trim().toLowerCase();

    // --------------------------------------------------
    // MOVED CHECKLIST ITEMS / LEGACY DATA COMPATIBILITY
    // --------------------------------------------------
    // Old saved inspection records may still contain these rows
    // under their previous section. We normalize them only while
    // reading/rendering the report; the stored DB data is untouched.

    if (normalizedRow === "upper cross member") {
        return "engine_bay";
    }

    if (normalizedRow === "brake overall") {
        return "interior_electricals";
    }

    if (normalizedRow === "all window switch") {
        return "interior_electricals";
    }

    if (normalizedRow === "tyres / wheels overall" || normalizedRow === "tyres + wheels overall") {
        return "exterior";
    }

    if (normalizedRow === "transmission overall") {
        return "engine_bay";
    }

    if (
        [
            "jumping rod bush front rhs",
            "jumping rod bush rear rhs",
            "jumping rod bush rear lhs",
            "jumping rod bush front lhs"
        ].includes(normalizedRow)
    ) {
        return "__removed_jumping_rod_bush__";
    }

    // Legacy/alternate AC + LIGHT section keys.
    if (
        normalizedSection === "lights_ac" ||
        normalizedSection === "light_ac" ||
        normalizedSection === "lights + ac"
    ) {
        return "electricals_ac";
    }

    // Legacy standalone section keys are now represented by the
    // consolidated sections requested by the inspection form.
    if (normalizedSection === "transmission_system") {
        return "engine_bay";
    }

    if (normalizedSection === "braking_system") {
        return "interior_electricals";
    }

    if (normalizedSection === "tires_wheels") {
        return "exterior";
    }

    // Legacy/alternate payloads may keep these moved items under exterior.
    if (
        normalizedSection === "exterior" &&
        ["apron rhs", "apron lhs", "firewall", "upper cross member"].includes(normalizedRow)
    ) {
        return "engine_bay";
    }

    // Seat rows belong to ALL SEATS.
    if (
        [
            "1st row rhs",
            "1st row lhs",
            "2nd row rhs",
            "2nd row lhs",
            "3rd row rhs",
            "3rd row lhs",
            "3rd row seat",
            "seat 1st row rhs",
            "seat 1st row lhs",
            "seat 2nd row rhs",
            "seat 2nd row lhs",
            "seat 3rd row rhs",
            "seat 3rd row lhs",
            "seat 3rd row"
        ].includes(normalizedRow)
    ) {
        return "all_seats";
    }

    return String(sectionKey || "").trim();
};

const normalizeDetailedRowName = (rowName = "") => {
    const normalized = String(rowName || "").trim().toLowerCase();

    const aliases = {
        "1st row rhs": "Seat 1st Row RHS",
        "1st row lhs": "Seat 1st Row LHS",
        "2nd row rhs": "Seat 2nd Row RHS",
        "2nd row lhs": "Seat 2nd Row LHS",
        "3rd row rhs": "Seat 3rd Row RHS",
        "3rd row lhs": "Seat 3rd Row LHS",
        "3rd row seat": "Seat 3rd Row",
        "all window switch": "ALL SIDE WINDOW",
        "all side window": "ALL SIDE WINDOW",
        "tyres / wheels overall": "Tyres / Wheels Overall",
        "tyres + wheels overall": "Tyres / Wheels Overall",
        "transmission overall": "Transmission",
        "upper cross member": "Upper Cross Member"
    };

    return aliases[normalized] || String(rowName || "").trim();
};

const getAvailableOptions = (
    sectionKey,
    rowName,
    selectedOptions = []
) => {
    const normalizedRowName = normalizeDetailedRowName(rowName);
    const normalizedSectionKey = normalizeDetailedSectionKey(
        sectionKey,
        normalizedRowName
    );

  const section =
    DETAILED_CHECKLIST_OPTIONS[String(normalizedSectionKey)] ||
    DETAILED_CHECKLIST_OPTIONS[normalizedSectionKey] ||
    DETAILED_CHECKLIST_OPTIONS[String(sectionKey)] ||
    DETAILED_CHECKLIST_OPTIONS[sectionKey];

    if (section && typeof section === "object") {
        if (Array.isArray(section[String(rowName)])) {
            return [...section[String(rowName)]];
        }

        const lookupRowName = normalizedRowName.trim().toLowerCase();

        const matchedKey = Object.keys(section).find(
            (key) => key.trim().toLowerCase() === lookupRowName
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

const getRawChecklist = (report = {}) => {
    const candidates = [
        report?.checklist,
        report?.inspection_checklist,
        report?.inspectionChecklist,
        report?.detailedInspection,
        report?.detailed_inspection,
        report?.checklists,

        report?.vehicle?.checklist,
        report?.vehicle?.inspection_checklist,
        report?.vehicle?.inspectionChecklist,
        report?.vehicle?.detailedInspection,

        report?.vehicleData?.checklist,
        report?.vehicleData?.inspection_checklist,
        report?.vehicleData?.inspectionChecklist,
        report?.vehicleData?.detailedInspection,

        report?.inspection?.checklist,
        report?.inspection?.inspection_checklist,
        report?.inspection?.inspectionChecklist,
        report?.inspection?.detailedInspection
    ];

    let checklist = [];

    for (const candidate of candidates) {
        const parsed = parseJsonIfNeeded(candidate);

        if (
            Array.isArray(parsed) &&
            parsed.length > 0
        ) {
            checklist = parsed;
            break;
        }

        if (
            parsed &&
            typeof parsed === "object" &&
            !Array.isArray(parsed) &&
            Object.keys(parsed).length > 0
        ) {
            checklist = parsed;
            break;
        }
    }

    if (!checklist || checklist === "") {
        return [];
    }

    checklist = parseJsonIfNeeded(checklist);

    // --------------------------------------------------
    // DB / API WRAPPER
    // --------------------------------------------------
    if (
        checklist &&
        typeof checklist === "object" &&
        !Array.isArray(checklist)
    ) {
        const nestedKeys = [
            "items",
            "data",
            "checklist",
            "inspection_checklist",
            "inspectionChecklist",
            "inspection_data",
            "inspectionData",
            "rows",
            "results"
        ];

        for (const key of nestedKeys) {
            if (
                checklist[key] !== undefined &&
                checklist[key] !== null
            ) {
                const nested = parseJsonIfNeeded(checklist[key]);

                if (
                    Array.isArray(nested) ||
                    (
                        nested &&
                        typeof nested === "object"
                    )
                ) {
                    checklist = nested;
                    break;
                }
            }
        }
    }

    if (Array.isArray(checklist)) {
        return expandChecklistArray(checklist);
    }

    return checklist;
};

const normalizeDetailedChecklist = (report = {}) => {
    const raw = getRawChecklist(report);
    const result = [];

    // ==================================================
    // ARRAY FORMAT
    // DB inspection_checklist / Employee submit payload
    // ==================================================

    if (Array.isArray(raw)) {
        raw.forEach((rawItem, index) => {
            if (
                rawItem === undefined ||
                rawItem === null
            ) {
                return;
            }

            let item = parseJsonIfNeeded(rawItem);

            if (
                !item ||
                typeof item !== "object"
            ) {
                return;
            }

            item = unwrapChecklistPayload(item);

            if (
                !item ||
                typeof item !== "object" ||
                Array.isArray(item)
            ) {
                return;
            }

            // --------------------------------------------------
            // IMPORTANT:
            // DB row can contain checklist_data / data /
            // inspection_data JSON.
            // --------------------------------------------------

            const nestedChecklist = firstValue(
                item,
                [
                    "checklist_data",
                    "checklistData",
                    "data",
                    "inspection_data",
                    "inspectionData"
                ],
                undefined
            );

            let source = item;

            if (
                nestedChecklist !== undefined &&
                nestedChecklist !== null &&
                nestedChecklist !== ""
            ) {
                const parsedNested =
                    parseJsonIfNeeded(nestedChecklist);

                if (
                    parsedNested &&
                    typeof parsedNested === "object" &&
                    !Array.isArray(parsedNested)
                ) {
                    source = {
                        ...item,
                        ...parsedNested
                    };
                }
            }

            // --------------------------------------------------
            // SECTION
            // --------------------------------------------------

            const rawSectionKey = String(
                firstValue(
                    source,
                    [
                        "section",
                        "section_key",
                        "sectionKey",
                        "category",
                        "category_key",
                        "categoryKey"
                    ],
                    firstValue(
                        item,
                        [
                            "section",
                            "section_key",
                            "sectionKey",
                            "category",
                            "category_key",
                            "categoryKey"
                        ],
                        "other"
                    )
                )
            ).trim();

            // --------------------------------------------------
            // SECTION TITLE
            // --------------------------------------------------

            // --------------------------------------------------
            // ROW / ITEM NAME
            // --------------------------------------------------

            const rawRowName = String(
                firstValue(
                    source,
                    [
                        "item_name",
                        "itemName",
                        "row_name",
                        "rowName",
                        "area",
                        "inspection_area",
                        "inspectionArea",
                        "title",
                        "name"
                    ],
                    `Inspection Item ${index + 1}`
                )
            ).trim();

            const rowName = normalizeDetailedRowName(rawRowName);
            const sectionKey = normalizeDetailedSectionKey(
                rawSectionKey,
                rowName
            );

            // Do not display the four removed Jumping Rod Bush rows.
            // Their historical DB records remain untouched.
            if (sectionKey === "__removed_jumping_rod_bush__") {
                return;
            }

            const sectionTitle = String(
                DETAILED_SECTION_TITLES[sectionKey] ||
                firstValue(
                    source,
                    [
                        "section_title",
                        "sectionTitle",
                        "section_name",
                        "sectionName"
                    ],
                    String(sectionKey)
                        .replace(/_/g, " ")
                        .toUpperCase()
                )
            );

            // --------------------------------------------------
            // SELECTED OPTIONS
            // --------------------------------------------------

            let selectedValue = firstValue(
                source,
                [
                    "selected_options",
                    "selectedOptions",
                    "options",
                    "values"
                ],
                undefined
            );

            if (
                selectedValue === undefined ||
                selectedValue === null
            ) {
                selectedValue = firstValue(
                    item,
                    [
                        "selected_options",
                        "selectedOptions",
                        "options",
                        "values"
                    ],
                    []
                );
            }

            let selectedOptions =
                normalizeSelectedOptions(selectedValue);

            // --------------------------------------------------
            // FALLBACK: status / condition / result
            // --------------------------------------------------

            if (selectedOptions.length === 0) {
                const statusValue = firstValue(
                    source,
                    [
                        "status",
                        "condition",
                        "result"
                    ],
                    undefined
                );

                if (
                    statusValue !== undefined &&
                    statusValue !== null &&
                    String(statusValue).trim()
                ) {
                    selectedOptions =
                        normalizeSelectedOptions(statusValue);
                }
            }

            // --------------------------------------------------
            // REMARK
            // --------------------------------------------------

            let remarkValue = firstValue(
                source,
                [
                    "remark",
                    "remarks",
                    "note",
                    "comment"
                ],
                undefined
            );

            if (
                remarkValue === undefined ||
                remarkValue === null
            ) {
                remarkValue = firstValue(
                    item,
                    [
                        "remark",
                        "remarks",
                        "note",
                        "comment"
                    ],
                    ""
                );
            }

            let remark = "";

            if (
                remarkValue !== undefined &&
                remarkValue !== null
            ) {
                remark = String(remarkValue).trim();
            }

            // --------------------------------------------------
            // AVAILABLE OPTIONS
            // --------------------------------------------------

            const availableOptions =
                getAvailableOptions(
                    sectionKey,
                    rowName,
                    selectedOptions
                );

            // --------------------------------------------------
            // STATUS
            // --------------------------------------------------

            const rawStatus = firstValue(
                source,
                [
                    "status",
                    "condition",
                    "result"
                ],
                ""
            );

            let status = String(rawStatus || "").trim();

            if (!status) {
                status =
                    selectedOptions.some(
                        (option) =>
                            String(option)
                                .trim()
                                .toLowerCase() !==
                            "ok/no imperfection"
                                .toLowerCase()
                    )
                        ? "Need Attention"
                        : "Good";
            }

            // --------------------------------------------------
            // IGNORE EMPTY / INVALID DB ROW
            // --------------------------------------------------

            const hasUsefulData =
                rowName &&
                (
                    selectedOptions.length > 0 ||
                    remark ||
                    availableOptions.length > 0 ||
                    status
                );

            if (!hasUsefulData) {
                return;
            }

            result.push({
                sectionKey,
                sectionTitle,
                rowName,
                availableOptions,
                selectedOptions,
                remark,
                status
            });
        });

        return result;
    }

    // ==================================================
    // OBJECT FORMAT
    // section -> row -> selected options
    // ==================================================

    if (
        raw &&
        typeof raw === "object" &&
        !Array.isArray(raw)
    ) {
        for (
            const [rawSectionKey, sectionRowsValue]
            of Object.entries(raw)
        ) {
            const sectionKey = normalizeDetailedSectionKey(rawSectionKey);
            if (
                !sectionRowsValue ||
                typeof sectionRowsValue !== "object"
            ) {
                continue;
            }

            if (Array.isArray(sectionRowsValue)) {
                sectionRowsValue.forEach(
                    (rawRow, index) => {
                        const rowObject =
                            parseJsonIfNeeded(rawRow);

                        if (
                            !rowObject ||
                            typeof rowObject !== "object"
                        ) {
                            return;
                        }

                        const rawRowName = String(
                            firstValue(
                                rowObject,
                                [
                                    "item_name",
                                    "itemName",
                                    "row_name",
                                    "rowName",
                                    "area",
                                    "title",
                                    "name"
                                ],
                                `Inspection Item ${index + 1}`
                            )
                        ).trim();

                        const rowName = normalizeDetailedRowName(rawRowName);
                        const normalizedRowSectionKey = normalizeDetailedSectionKey(
                            rawSectionKey,
                            rowName
                        );

                        if (normalizedRowSectionKey === "__removed_jumping_rod_bush__") {
                            return;
                        }

                        const selectedOptions =
                            normalizeSelectedOptions(
                                firstValue(
                                    rowObject,
                                    [
                                        "selected_options",
                                        "selectedOptions",
                                        "options",
                                        "values",
                                        "status",
                                        "condition",
                                        "result"
                                    ],
                                    []
                                )
                            );

                        const remark = String(
                            firstValue(
                                rowObject,
                                [
                                    "remark",
                                    "remarks",
                                    "note",
                                    "comment"
                                ],
                                ""
                            ) || ""
                        ).trim();

                        const availableOptions =
                            getAvailableOptions(
                                normalizedRowSectionKey,
                                rowName,
                                selectedOptions
                            );

                        const status =
                            selectedOptions.some(
                                (option) =>
                                    String(option)
                                        .trim()
                                        .toLowerCase() !==
                                    "ok/no imperfection"
                                        .toLowerCase()
                            )
                                ? "Need Attention"
                                : "Good";

                        result.push({
                            sectionKey: normalizedRowSectionKey,
                            sectionTitle:
                                DETAILED_SECTION_TITLES[
                                    normalizedRowSectionKey
                                ] ||
                                String(normalizedRowSectionKey)
                                    .replace(/_/g, " ")
                                    .toUpperCase(),
                            rowName,
                            availableOptions,
                            selectedOptions,
                            remark,
                            status
                        });
                    }
                );

                continue;
            }

            const sectionTitle =
                DETAILED_SECTION_TITLES[
                    sectionKey
                ] ||
                String(sectionKey)
                    .replace(/_/g, " ")
                    .toUpperCase();

            for (
                const [rawRowName, rawSelected]
                of Object.entries(sectionRowsValue)
            ) {
                const rowName = normalizeDetailedRowName(rawRowName);
                const rowSectionKey = normalizeDetailedSectionKey(
                    rawSectionKey,
                    rowName
                );

                if (rowSectionKey === "__removed_jumping_rod_bush__") {
                    continue;
                }

                let selectedOptions = [];
                let remark = "";
                let status = "";

                const parsedValue =
                    parseJsonIfNeeded(rawSelected);

                if (
                    parsedValue &&
                    typeof parsedValue === "object" &&
                    !Array.isArray(parsedValue)
                ) {
                    selectedOptions =
                        normalizeSelectedOptions(
                            firstValue(
                                parsedValue,
                                [
                                    "selected_options",
                                    "selectedOptions",
                                    "options",
                                    "values",
                                    "status",
                                    "condition",
                                    "result"
                                ],
                                []
                            )
                        );

                    remark = String(
                        firstValue(
                            parsedValue,
                            [
                                "remark",
                                "remarks",
                                "note",
                                "comment"
                            ],
                            ""
                        ) || ""
                    ).trim();

                    status = String(
                        firstValue(
                            parsedValue,
                            [
                                "status",
                                "condition",
                                "result"
                            ],
                            ""
                        ) || ""
                    ).trim();
                } else {
                    selectedOptions =
                        normalizeSelectedOptions(
                            parsedValue
                        );
                }

                const availableOptions =
                    getAvailableOptions(
                        rowSectionKey,
                        rowName,
                        selectedOptions
                    );

                if (!status) {
                    status =
                        selectedOptions.some(
                            (option) =>
                                String(option)
                                    .trim()
                                    .toLowerCase() !==
                                "ok/no imperfection"
                                    .toLowerCase()
                        )
                            ? "Need Attention"
                            : "Good";
                }

                result.push({
                    sectionKey: rowSectionKey,
                    sectionTitle:
                        DETAILED_SECTION_TITLES[rowSectionKey] ||
                        String(rowSectionKey)
                            .replace(/_/g, " ")
                            .toUpperCase(),
                    rowName,
                    availableOptions,
                    selectedOptions,
                    remark,
                    status
                });
            }
        }
    }

    return result;
};

const mergeDetailedRemarks = (rows, report = {}) => {
    const possibleRemarks = [
        report?.detailedInspectionRemarks,
        report?.detailed_inspection_remarks,
        report?.detailedInspection?.remarks,
        report?.detailed_inspection?.remarks,
        report?.inspection?.detailedInspectionRemarks,
        report?.inspection?.detailed_inspection_remarks
    ];

    let remarks = {};

    for (const candidate of possibleRemarks) {
        const parsed = parseJsonIfNeeded(candidate);

        if (
            parsed &&
            typeof parsed === "object" &&
            !Array.isArray(parsed) &&
            Object.keys(parsed).length > 0
        ) {
            remarks = parsed;
            break;
        }
    }

    if (
        !remarks ||
        typeof remarks !== "object"
    ) {
        return rows;
    }

    return rows.map((row) => {
        const exactKey =
            `${row.sectionKey}__${row.rowName}`;

        const alternateKeys = [
            exactKey,
            `${row.sectionKey}|${row.rowName}`,
            `${row.sectionKey}:${row.rowName}`,
            row.rowName
        ];

        let value;

        for (const key of alternateKeys) {
            if (
                remarks[key] !== undefined &&
                remarks[key] !== null &&
                String(remarks[key]).trim()
            ) {
                value = remarks[key];
                break;
            }
        }

        if (
            value !== undefined &&
            value !== null &&
            String(value).trim()
        ) {
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

    doc.text(`Page ${doc.page.number}`, PAGE_WIDTH - 280, footerY, {
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

const drawHeader = (doc, report, heroImage = null) => {
    const bookingCode = getBookingCode(report);
    const logoPath = resolvePdfLogoPath();
    const headerHeight = 92;

    // ==================================================
    // TOP HEADER
    // Logo       : TOP LEFT
    // ID         : DIRECTLY BELOW LOGO
    // Address    : TOP RIGHT
    // Contact No : RIGHT
    // ==================================================
    doc.roundedRect(
        MARGIN_LEFT,
        MARGIN_TOP,
        CONTENT_WIDTH,
        headerHeight,
        6
    ).fillAndStroke(COLORS.white, COLORS.border);

    if (logoPath) {
        try {
            doc.image(
                logoPath,
                MARGIN_LEFT + 12,
                MARGIN_TOP + 8,
                {
                    fit: [155, 55],
                    align: "left",
                    valign: "center"
                }
            );
        } catch (error) {
            doc.font("Helvetica-Bold")
                .fontSize(19)
                .fillColor(COLORS.navy)
                .text("CARSEY.IN", MARGIN_LEFT + 14, MARGIN_TOP + 17);
        }
    } else {
        doc.font("Helvetica-Bold")
            .fontSize(19)
            .fillColor(COLORS.navy)
            .text("CARSEY.IN", MARGIN_LEFT + 14, MARGIN_TOP + 17);
    }

    // ID directly below logo.
    doc.font("Helvetica-Bold")
        .fontSize(8.5)
        .fillColor(COLORS.navy)
        .text(`ID ${bookingCode}`, MARGIN_LEFT + 14, MARGIN_TOP + 66, {
            width: 155,
            align: "left"
        });

    // Office address and contact on the right.
    const rightX = PAGE_WIDTH - MARGIN_RIGHT - 250;
    const rightWidth = 250;

    doc.font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(COLORS.dark)
        .text("Office Address", rightX, MARGIN_TOP + 12, {
            width: rightWidth,
            align: "right"
        });

    doc.font("Helvetica")
        .fontSize(7.2)
        .fillColor(COLORS.gray)
        .text(PDF_OFFICE_ADDRESS, rightX, MARGIN_TOP + 25, {
            width: rightWidth,
            height: 30,
            align: "right",
            lineGap: 1
        });

    doc.font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(COLORS.dark)
        .text(`Contact No - ${PDF_CONTACT_NUMBER}`, rightX, MARGIN_TOP + 61, {
            width: rightWidth,
            align: "right"
        });

    let y = MARGIN_TOP + headerHeight + 10;

    // ==================================================
    // HERO IMAGE - FRONT VIEW
    // ==================================================
    if (heroImage?.filePath) {
        const heroHeight = 205;
        const heroX = MARGIN_LEFT;
        const heroY = y;

        doc.roundedRect(
            heroX,
            heroY,
            CONTENT_WIDTH,
            heroHeight,
            6
        ).fillAndStroke(COLORS.white, COLORS.border);

        try {
            doc.image(
                heroImage.filePath,
                heroX + 6,
                heroY + 6,
                {
                    fit: [CONTENT_WIDTH - 12, heroHeight - 12],
                    align: "center",
                    valign: "center"
                }
            );
        } catch (error) {
            doc.font("Helvetica")
                .fontSize(9)
                .fillColor(COLORS.gray)
                .text(
                    "Front View image could not be loaded.",
                    heroX + 10,
                    heroY + heroHeight / 2 - 5,
                    {
                        width: CONTENT_WIDTH - 20,
                        align: "center"
                    }
                );
        }

        y += heroHeight + 12;
    }

    return y;
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
    // PDF ME SIRF SELECTED / TICKED OPTIONS DIKHAYENGE
    const options = Array.isArray(selectedOptions)
        ? selectedOptions
        : [];

    const selectedSet = new Set(
        (selectedOptions || []).map((option) =>
            String(option).trim().toLowerCase()
        )
    );

    doc.font("Helvetica-Bold")
        .fontSize(7)
        .fillColor(COLORS.gray)
        .text("INSPECTION OPTIONS", x, y, { width });

    y += 13;

    if (!options.length) {
        doc.font("Helvetica")
            .fontSize(8.5)
            .fillColor(COLORS.gray)
            .text("No option selected", x, y, { width });

        return y + 12;
    }

    for (const option of options) {
        const label = String(option);
        const selected = selectedSet.has(
            label.trim().toLowerCase()
        );

        doc.roundedRect(
            x,
            y + 1,
            9,
            9,
            1
        )
            .fillAndStroke(
                COLORS.white,
                COLORS.border
            );

        if (selected) {
            doc.save();

            doc.strokeColor(COLORS.blue)
                .lineWidth(1.4);

            doc.moveTo(x + 2, y + 6)
                .lineTo(x + 4, y + 8)
                .lineTo(x + 8, y + 3)
                .stroke();

            doc.restore();
        }

        doc.font("Helvetica")
            .fontSize(8.2)
            .fillColor(COLORS.dark)
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
            .text(`INSPECTION IMAGE - ${safeString(row.rowName, "Inspection Item")}`, MARGIN_LEFT + 10, y, {
                width: textWidth,
                ellipsis: true
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
    // Sirf wahi rows PDF me dikhani hain jisme employee ne
    // kam se kam ek option select/tick kiya hai.
    const selectedRows = (Array.isArray(rows) ? rows : []).filter((row) => {
        const selectedOptions = Array.isArray(row.selectedOptions)
            ? row.selectedOptions.filter(
                (option) =>
                    option !== null &&
                    option !== undefined &&
                    String(option).trim() !== ""
            )
            : [];

        return selectedOptions.length > 0;
    });

    // Agar koi bhi option select nahi hai to detailed checklist ka
    // extra page create hi nahi karna.
    if (!selectedRows.length) {
        return;
    }

    doc.addPage();

    let y = MARGIN_TOP;

    y = drawSectionHeader(
        doc,
        "Detailed Vehicle Inspection Checklist",
        y
    );

    y += 8;

    let currentSection = null;

    // Sirf selected rows ke sections nikalo.
    const sectionKeys = [
        ...new Set(
            selectedRows.map((row) => row.sectionKey)
        )
    ];

    for (const sectionKey of sectionKeys) {
        const sectionRows = selectedRows.filter(
            (item) => item.sectionKey === sectionKey
        );

        // Safety check
        if (!sectionRows.length) {
            continue;
        }

        const firstRow = sectionRows[0];

        if (firstRow.sectionKey !== currentSection) {
            currentSection = firstRow.sectionKey;

            y = ensureSpace(
                doc,
                y,
                35,
                reportId
            );

            // ==================================================
            // SECTION HEADER
            // ==================================================

            doc.roundedRect(
                MARGIN_LEFT,
                y,
                CONTENT_WIDTH,
                26,
                4
            )
                .fill(COLORS.navy);

            doc.font("Helvetica-Bold")
                .fontSize(9.5)
                .fillColor(COLORS.white)
                .text(
                    firstRow.sectionTitle,
                    MARGIN_LEFT + 9,
                    y + 7,
                    {
                        width: CONTENT_WIDTH - 120,
                        ellipsis: true
                    }
                );

            // ==================================================
            // SECTION STATUS
            // ==================================================

            const sectionNeedsAttention = sectionRows.some(
                (item) => {
                    const options = Array.isArray(
                        item.selectedOptions
                    )
                        ? item.selectedOptions
                        : [];

                    return (
                        String(item.status || "")
                            .trim()
                            .toLowerCase() ===
                        "need attention".toLowerCase() ||
                        options.some(
                            (option) =>
                                String(option)
                                    .trim()
                                    .toLowerCase() !==
                                "ok/no imperfection"
                            )
                        );
                }
            );

            const badgeText = sectionNeedsAttention
                ? "Need Attention"
                : "Good";

            const badgeWidth = sectionNeedsAttention
                ? 82
                : 42;

            const badgeX =
                MARGIN_LEFT +
                CONTENT_WIDTH -
                badgeWidth -
                8;

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

            doc.font("Helvetica-Bold")
                .fontSize(6.5)
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

        // ======================================================
        // SELECTED ROWS ONLY
        // ======================================================

        for (const row of sectionRows) {
            const selectedOptions = Array.isArray(
                row.selectedOptions
            )
                ? row.selectedOptions.filter(
                    (option) =>
                        option !== null &&
                        option !== undefined &&
                        String(option).trim() !== ""
                )
                : [];

            // Double safety:
            // koi selected option nahi hai to row skip.
            if (!selectedOptions.length) {
                continue;
            }

            const key =
                `${row.sectionKey}__${row.rowName}`;

            const image =
                detailedImages.get(key) || null;

            // drawDetailedRow ko sirf selected options pass karo.
            const rowForPdf = {
                ...row,
                selectedOptions
            };

            y = drawDetailedRow(
                doc,
                rowForPdf,
                image,
                y,
                reportId
            );
        }
    }
};

// ======================================================
// VEHICLE PHOTOS
// ======================================================

const VEHICLE_PHOTO_ORDER = [
    "Front View",
    "Right View",
    "Rear View",
    "Left View",
    "Interior Seat Rear",
    "Interior Front Seat",
    "Open Engine",
    "Open Dicky",
    "Odometer",
    "Dashboard"
];

const DOCUMENT_PHOTO_ORDER = [
    "RC",
    "Insurance",
    "PUC",
    "Service History",
    "Duplicate Key",
    "Registration Details"
];

const TEST_DRIVE_PHOTO_ORDER = [
    "Test Drive Photo 1",
    "Test Drive Photo 2"
];

const drawImageGridSection = (
    doc,
    images,
    reportId,
    sectionTitle,
    emptyText,
    startY = null,
    showImageTitle = true
) => {
    const validImages = Array.isArray(images)
        ? images.filter((image) => image?.filePath)
        : [];

    // If a start position is supplied, continue on the current page.
    // Otherwise preserve the existing behavior and start a new page.
    let y;

    if (startY === null || startY === undefined) {
        doc.addPage();
        y = MARGIN_TOP;
    } else {
        y = startY;
    }

    y = drawSectionHeader(doc, sectionTitle, y) + 8;

    if (!validImages.length) {
        doc.font("Helvetica").fontSize(9).fillColor(COLORS.gray)
            .text(emptyText, MARGIN_LEFT, y, { width: CONTENT_WIDTH });
        return;
    }

    const gap = 10;
    const columns = 2;
    const cardWidth = (CONTENT_WIDTH - gap) / columns;
    const cardHeight = 205;

    for (let i = 0; i < validImages.length; i++) {
        const col = i % columns;

        if (col === 0 && i > 0) {
            y += cardHeight + gap;
        }

        if (y + cardHeight > PAGE_BOTTOM) {
            y = newPage(doc, reportId);
            y = drawSectionHeader(doc, `${sectionTitle} - Continued`, y) + 8;
        }

        const x = MARGIN_LEFT + col * (cardWidth + gap);
        const image = validImages[i];
        const title = getImageTitle(image, `${sectionTitle} ${i + 1}`);

        doc.roundedRect(x, y, cardWidth, cardHeight, 5)
            .fillAndStroke(COLORS.white, COLORS.border);

        if (showImageTitle) {
            doc.font("Helvetica-Bold").fontSize(8).fillColor(COLORS.dark)
                .text(title, x + 8, y + 8, {
                    width: cardWidth - 16,
                    ellipsis: true,
                    align: "center"
                });
        }

        try {
            doc.image(image.filePath, x + 8, y + (showImageTitle ? 25 : 8), {
                fit: [
                    cardWidth - 16,
                    showImageTitle ? cardHeight - 33 : cardHeight - 16
                ],
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
    }

    // Return the bottom of the last image row so another section can
    // continue directly below it on the same page when there is room.
    const lastRowStartY = y;
    return lastRowStartY + cardHeight;
};

const orderImagesByTitle = (images, orderedTitles) => {
    const source = Array.isArray(images) ? images : [];
    const result = [];
    const used = new Set();

    for (const expectedTitle of orderedTitles) {
        const index = source.findIndex((image, i) =>
            !used.has(i) &&
            normalizeVehiclePhotoTitle(getImageTitle(image, "")).trim().toLowerCase() === expectedTitle.trim().toLowerCase()
        );

        if (index !== -1) {
            used.add(index);
            result.push(source[index]);
        }
    }

    // Never lose an uploaded image just because its title is not in the standard list.
    source.forEach((image, index) => {
        if (!used.has(index)) result.push(image);
    });

    return result;
};

// ======================================================
// VEHICLE PHOTOS
// ======================================================

const drawVehiclePhotos = (doc, images, reportId) => {
    const vehicleImages = Array.isArray(images) ? images : [];

    // Only these 10 vehicle photo types are allowed.
    const allowedPhotos = new Map();

    for (const image of vehicleImages) {
        if (!isStandardVehiclePhoto(image)) {
            continue;
        }

        const title = normalizeVehiclePhotoTitle(
            getImageTitle(image, "")
        ).trim();

        if (!title) {
            continue;
        }

        // Only ONE image per vehicle-photo slot.
        // This prevents duplicate/extra images from appearing.
        if (!allowedPhotos.has(title)) {
            allowedPhotos.set(title, image);
        }
    }

    // Always follow the exact form order.
    const orderedImages = VEHICLE_PHOTO_ORDER
        .map((title) => allowedPhotos.get(title))
        .filter(Boolean);

    // Maximum 10 images — never more.
    const finalVehicleImages = orderedImages.slice(
        0,
        VEHICLE_PHOTO_ORDER.length
    );

    drawImageGridSection(
        doc,
        finalVehicleImages,
        reportId,
        "Vehicle Photos",
        "No vehicle photos uploaded."
    );
};

// ======================================================
// ADDITIONAL VEHICLE PHOTOS
// Optional photos uploaded from Employee Inspection.
// Maximum supported by the frontend: 6.
// ======================================================

const isAdditionalVehiclePhoto = (image) => {
    const type = getImageType(image).trim();
    const title = getImageTitle(image, "").trim();

    return (
        /^Additional Vehicle Photo [1-6]$/i.test(type) ||
        /^Additional Photo [1-6]$/i.test(type) ||
        /^additional_vehicle_photo_[1-6]$/i.test(type) ||
        /^Additional Vehicle Photo [1-6]$/i.test(title) ||
        /^Additional Photo [1-6]$/i.test(title)
    );
};

const getAdditionalVehiclePhotoNumber = (image) => {
    const values = [
        getImageType(image),
        getImageTitle(image, "")
    ];

    for (const value of values) {
        const match = String(value || "").match(
            /(?:Photo|photo)[ _-]*([1-6])$/i
        );

        if (match) {
            return Number(match[1]);
        }

        const keyMatch = String(value || "").match(
            /additional_vehicle_photo_([1-6])/i
        );

        if (keyMatch) {
            return Number(keyMatch[1]);
        }
    }

    return 99;
};

const drawAdditionalVehiclePhotos = (
    doc,
    images,
    reportId
) => {
    const source =
        Array.isArray(images)
            ? images
            : [];

    const additionalImages =
        source
            .filter(
                (image) =>
                    image?.filePath &&
                    isAdditionalVehiclePhoto(image)
            )
            .sort(
                (a, b) =>
                    getAdditionalVehiclePhotoNumber(a) -
                    getAdditionalVehiclePhotoNumber(b)
            )
            .slice(0, 6);

    if (!additionalImages.length) {
        return;
    }

    doc.addPage();

    let y = MARGIN_TOP;

    y = drawSectionHeader(
        doc,
        "Additional Vehicle Photos",
        y
    ) + 8;

    const gap = 8;
    const columns = 3;
    const cardWidth =
        (CONTENT_WIDTH - gap * (columns - 1)) /
        columns;
    const cardHeight = 170;

    for (
        let i = 0;
        i < additionalImages.length;
        i++
    ) {
        const col = i % columns;

        if (col === 0 && i > 0) {
            y += cardHeight + gap;
        }

        if (y + cardHeight > PAGE_BOTTOM) {
            y = newPage(doc, reportId);

            y = drawSectionHeader(
                doc,
                "Additional Vehicle Photos - Continued",
                y
            ) + 8;
        }

        const x =
            MARGIN_LEFT +
            col * (cardWidth + gap);

        const image =
            additionalImages[i];

        const number =
            getAdditionalVehiclePhotoNumber(
                image
            );

        const title =
            `Additional Vehicle Photo ${number}`;

        doc.roundedRect(
            x,
            y,
            cardWidth,
            cardHeight,
            5
        ).fillAndStroke(
            COLORS.white,
            COLORS.border
        );

        try {
            doc.image(
                image.filePath,
                x + 6,
                y + 6,
                {
                    fit: [
                        cardWidth - 12,
                        cardHeight - 34
                    ],
                    align: "center",
                    valign: "center"
                }
            );
        } catch (error) {
            doc.font("Helvetica")
                .fontSize(7.5)
                .fillColor(COLORS.gray)
                .text(
                    "Image could not be loaded",
                    x + 6,
                    y + cardHeight / 2 - 5,
                    {
                        width: cardWidth - 12,
                        align: "center"
                    }
                );
        }

        doc.font("Helvetica-Bold")
            .fontSize(7.5)
            .fillColor(COLORS.dark)
            .text(
                title,
                x + 6,
                y + cardHeight - 22,
                {
                    width: cardWidth - 12,
                    align: "center",
                    ellipsis: true
                }
            );
    }
};

// ======================================================
// DOCUMENT / TITLE IMAGES
// ======================================================

const drawDocumentPhotos = (doc, images, reportId, startY = null) => {
    const documentImages = (Array.isArray(images) ? images : [])
        .filter(isDocumentImage);

    const orderedImages = orderImagesByTitle(
        documentImages,
        DOCUMENT_PHOTO_ORDER
    );

    drawImageGridSection(
        doc,
        orderedImages,
        reportId,
        "Documents / Title Images",
        "No document images uploaded.",
        startY,
        false
    );
};

// ======================================================
// TEST DRIVE PHOTOS
// ======================================================

const drawTestDrivePhotos = (doc, images, reportId) => {
    const testDriveImages = (Array.isArray(images) ? images : [])
        .filter(isTestDrivePhotoImage);

    const orderedImages = orderImagesByTitle(testDriveImages, TEST_DRIVE_PHOTO_ORDER);

    return drawImageGridSection(
        doc,
        orderedImages,
        reportId,
        "Test Drive Photos",
        "No test drive photos uploaded."
    );
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
                const bookingId = getBookingId(normalizedReport);

                if (bookingId === "-" || bookingId === null || bookingId === undefined) {
                    throw new Error("Booking ID is missing.");
                }

                normalizedReport.bookingId = bookingId;
                normalizedReport.booking_id = bookingId;

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
                // PAGE 1+ : BRANDED HEADER + FRONT VIEW HERO
                // ==================================================

                const frontViewImage =
                    allImages.find((image) => {
                        if (!isStandardVehiclePhoto(image)) {
                            return false;
                        }

                        return normalizeVehiclePhotoTitle(
                            getImageTitle(image, "")
                        ).trim().toLowerCase() === "front view";
                    }) || null;

                let y = drawHeader(
                    doc,
                    normalizedReport,
                    frontViewImage
                );

                // ==================================================
                // VEHICLE DETAILS
                // No customer name, mobile, email or address.
                // ==================================================

                y = drawVehicleDetails(
                    doc,
                    normalizedReport,
                    y,
                    reportId
                );

                // ==================================================
                // DOCUMENT / TITLE IMAGES
                // Immediately below Vehicle Details on page 1.
                // Documents are classified explicitly so they never
                // appear inside Vehicle Photos.
                // ==================================================

                drawDocumentPhotos(
                    doc,
                    allImages,
                    reportId,
                    y
                );

                // The document grid may continue onto additional pages.
                // Start the next major report section on a clean page.
                drawFooter(doc, reportId);

                // ==================================================
                // DETAILED VEHICLE INSPECTION CHECKLIST
                // ==================================================

                drawDetailedChecklist(
                    doc,
                    detailedRows,
                    detailedImages,
                    reportId
                );

                // ==================================================
                // VEHICLE PHOTOS - SEPARATE SECTION
                // ==================================================

                drawVehiclePhotos(
                    doc,
                    allImages,
                    reportId
                );

                // ==================================================
                // ADDITIONAL VEHICLE PHOTOS - SEPARATE SECTION
                // ==================================================

                drawAdditionalVehiclePhotos(
                    doc,
                    allImages,
                    reportId
                );

                // ==================================================
                // TEST DRIVE PHOTOS - SEPARATE SECTION
                // ==================================================

                const testDriveEndY =
                    drawTestDrivePhotos(doc, allImages, reportId);

                // ==================================================
                // INSPECTION SUMMARY
                // Continue directly below Test Drive Photos when possible.
                // ==================================================

                y = drawInspectionSummary(
                    doc,
                    normalizedReport,
                    testDriveEndY === undefined
                        ? MARGIN_TOP
                        : testDriveEndY + 10,
                    reportId
                );

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
