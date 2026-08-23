const mysql = require("mysql2");

const env = require("./env");

// ======================================================
// MYSQL CONNECTION POOL
// ======================================================

const db = mysql.createPool({

    host: env.DB_HOST,

    port: Number(env.DB_PORT) || 3306,

    user: env.DB_USER,

    password: env.DB_PASSWORD,

    database: env.DB_NAME,

    waitForConnections: true,

    connectionLimit: 10,

    queueLimit: 0

});


// ======================================================
// CONNECTION TEST
// ======================================================

db.getConnection((err, connection) => {

    if (err) {

        console.error(
            "❌ Database Connection Failed:"
        );

        console.error(
            err.message
        );

        return;
    }

    console.log(
        "✅ MySQL Connected Successfully"
    );

    connection.release();

});


// ======================================================
// EXPORT
// ======================================================

module.exports = db;