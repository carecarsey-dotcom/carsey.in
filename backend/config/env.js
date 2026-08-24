require("dotenv").config({
    path: require("path").join(__dirname, "..", ".env")
});

// ======================================================
// ENVIRONMENT CONFIGURATION
// ======================================================

const env = {

    // ==================================================
    // SERVER
    // ==================================================

    PORT:
        process.env.PORT || 5000,

    NODE_ENV:
        process.env.NODE_ENV || "development",


    // ==================================================
    // DATABASE
    // ==================================================

    // Local .env ke DB_* variables support honge.
    // Railway MySQL ke MYSQL* variables bhi support honge.
    // Railway par MYSQL* automatically available hain.

    DB_HOST:
        process.env.DB_HOST ||
        process.env.MYSQLHOST,

    DB_PORT:
        process.env.DB_PORT ||
        process.env.MYSQLPORT ||
        3306,

    DB_USER:
        process.env.DB_USER ||
        process.env.MYSQLUSER,

    DB_PASSWORD:
        process.env.DB_PASSWORD ||
        process.env.MYSQLPASSWORD,

    DB_NAME:
        process.env.DB_NAME ||
        process.env.MYSQLDATABASE,


    // ==================================================
    // JWT
    // ==================================================

    JWT_SECRET:
        process.env.JWT_SECRET,

    JWT_EXPIRES_IN:
        process.env.JWT_EXPIRES_IN || "1d",


    // ==================================================
    // ADMIN
    // ==================================================

    ADMIN_EMAIL:
        process.env.ADMIN_EMAIL,


    // ==================================================
    // UPLOAD
    // ==================================================

    UPLOAD_PATH:
        process.env.UPLOAD_PATH || "uploads",


    // ==================================================
    // RESEND EMAIL
    // ==================================================

    RESEND_API_KEY:
        process.env.RESEND_API_KEY,

    MAIL_FROM:
        process.env.MAIL_FROM

};


// ======================================================
// DATABASE CONFIGURATION CHECK
// ======================================================

console.log("======================================");
console.log("CARSEY DATABASE CONFIGURATION");
console.log("======================================");

console.log(
    "DB_HOST:",
    env.DB_HOST || "NOT SET"
);

console.log(
    "DB_PORT:",
    env.DB_PORT || "NOT SET"
);

console.log(
    "DB_USER:",
    env.DB_USER || "NOT SET"
);

console.log(
    "DB_NAME:",
    env.DB_NAME || "NOT SET"
);

console.log(
    "DB_PASSWORD:",
    env.DB_PASSWORD
        ? "SET"
        : "NOT SET"
);

console.log("======================================");


// ======================================================
// EMAIL CONFIGURATION CHECK
// ======================================================

console.log(
    "RESEND_API_KEY:",
    env.RESEND_API_KEY
        ? "SET"
        : "NOT SET"
);

console.log(
    "MAIL_FROM:",
    env.MAIL_FROM || "NOT SET"
);

console.log(
    "ADMIN_EMAIL:",
    env.ADMIN_EMAIL || "NOT SET"
);

console.log("======================================");


// ======================================================
// EXPORT
// ======================================================

module.exports = env;