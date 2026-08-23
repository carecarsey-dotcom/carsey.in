require("dotenv").config();


// ======================================================
// ENVIRONMENT CONFIGURATION
// ======================================================

const env = {

    // ==================================================
    // SERVER
    // ==================================================

    PORT:
        process.env.PORT,

    NODE_ENV:
        process.env.NODE_ENV,


    // ==================================================
    // DATABASE
    // ==================================================

    DB_HOST:
        process.env.DB_HOST,

    DB_PORT:
        process.env.DB_PORT,

    DB_USER:
        process.env.DB_USER,

    DB_PASSWORD:
        process.env.DB_PASSWORD,

    DB_NAME:
        process.env.DB_NAME,


    // ==================================================
    // JWT
    // ==================================================

    JWT_SECRET:
        process.env.JWT_SECRET,

    JWT_EXPIRES_IN:
        process.env.JWT_EXPIRES_IN,


    // ==================================================
    // ADMIN
    // ==================================================

    ADMIN_EMAIL:
        process.env.ADMIN_EMAIL,


    // ==================================================
    // UPLOAD
    // ==================================================

    UPLOAD_PATH:
        process.env.UPLOAD_PATH,


    // ==================================================
    // MAIL
    // ==================================================

    MAIL_HOST:
        process.env.MAIL_HOST,

    MAIL_PORT:
        process.env.MAIL_PORT,

    MAIL_USER:
        process.env.MAIL_USER,

    MAIL_PASS:
        process.env.MAIL_PASS

};


// ======================================================
// EXPORT
// ======================================================

module.exports = env;