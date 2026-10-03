// ======================================================
// CARSEY.IN BACKEND SERVER
// ======================================================

const app = require("./app");

// ======================================================
// EMAIL SERVICE
// ======================================================

const emailService = require("./services/email.service");

// ======================================================
// GOOGLE SHEETS WATCHER
// ======================================================

const {
    startGoogleSheetsWatcher
} = require("./services/googleSheetsWatcher");

// ======================================================
// PORT
// ======================================================

// Railway automatically PORT environment variable deta hai.
// Local development ke liye 5000 fallback hai.

const PORT = process.env.PORT || 5000;

// ======================================================
// START SERVER
// ======================================================

const server = app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Carsey backend running on port ${PORT}`
        );

        console.log(
            `Environment: ${
                process.env.NODE_ENV || "development"
            }`
        );

        // ==================================================
        // EMAIL CONFIGURATION CHECK
        // ==================================================

        // Email configuration fail hone par
        // server crash nahi hona chahiye.

        if (
            emailService &&
            typeof emailService.verifyMailConfiguration ===
                "function"
        ) {

            Promise
                .resolve(
                    emailService.verifyMailConfiguration()
                )
                .then(() => {

                    console.log(
                        "Email configuration check completed."
                    );

                })
                .catch((error) => {

                    console.error(
                        "Email configuration check failed:"
                    );

                    console.error(
                        error.message || error
                    );

                    console.warn(
                        "Server will continue running without email verification."
                    );

                });

        } else {

            console.warn(
                "verifyMailConfiguration() is not available in email.service."
            );

        }

        // ==================================================
        // GOOGLE SHEETS DATABASE WATCHER
        // ==================================================

        // MySQL me direct INSERT / UPDATE / DELETE hone par
        // MySQL triggers google_sheets_sync_state ko update karte hain.
        //
        // Watcher us change ko detect karke
        // Google Sheets ka automatic sync start karega.

        try {

            if (
                typeof startGoogleSheetsWatcher ===
                "function"
            ) {

                startGoogleSheetsWatcher();

                console.log(
                    "Google Sheets database watcher started."
                );

            } else {

                console.warn(
                    "startGoogleSheetsWatcher() is not available."
                );

            }

        } catch (error) {

            console.error(
                "Google Sheets watcher failed to start:"
            );

            console.error(
                error.message || error
            );

            console.warn(
                "Server will continue running without the Google Sheets watcher."
            );

        }

    }
);

// ======================================================
// SERVER ERROR HANDLER
// ======================================================

server.on("error", (error) => {

    console.error("Server error:");

    console.error(error);

});

// ======================================================
// UNHANDLED PROMISE REJECTION
// ======================================================

process.on("unhandledRejection", (reason) => {

    console.error("Unhandled Promise Rejection:");

    console.error(reason);

});

// ======================================================
// UNCAUGHT EXCEPTION
// ======================================================

process.on("uncaughtException", (error) => {

    console.error("Uncaught Exception:");

    console.error(error);

});

// ======================================================
// SIGTERM HANDLER
// ======================================================

process.on("SIGTERM", () => {

    console.log(
        "SIGTERM received. Server is shutting down..."
    );

    server.close(() => {

        console.log(
            "Carsey backend server closed."
        );

        process.exit(0);

    });

});

// ======================================================
// SIGINT HANDLER
// ======================================================

process.on("SIGINT", () => {

    console.log(
        "SIGINT received. Server is shutting down..."
    );

    server.close(() => {

        console.log(
            "Carsey backend server closed."
        );

        process.exit(0);

    });

});