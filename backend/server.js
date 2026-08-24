// ======================================================
// CARSEY.IN BACKEND SERVER
// ======================================================

const app = require("./app");


// ======================================================
// EMAIL SERVICE
// ======================================================

const emailService =
    require("./services/email.service");


// ======================================================
// PORT
// ======================================================

// Railway automatically PORT environment variable deta hai.
// Local development ke liye 5000 fallback hai.

const PORT =
    process.env.PORT || 5000;


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
                process.env.NODE_ENV ||
                "development"
            }`
        );


        // ==================================================
        // EMAIL CONFIGURATION CHECK
        // ==================================================

        // Email configuration fail hone par server crash
        // nahi hona chahiye.

        if (
            emailService &&
            typeof emailService
                .verifyMailConfiguration ===
            "function"
        ) {

            Promise
                .resolve(
                    emailService
                        .verifyMailConfiguration()
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
                        error.message ||
                        error
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
    }
);


// ======================================================
// SERVER ERROR HANDLER
// ======================================================

server.on(
    "error",
    (error) => {

        console.error(
            "Server error:"
        );

        console.error(
            error
        );
    }
);


// ======================================================
// UNHANDLED PROMISE REJECTION
// ======================================================

process.on(
    "unhandledRejection",
    (reason) => {

        console.error(
            "Unhandled Promise Rejection:"
        );

        console.error(
            reason
        );
    }
);


// ======================================================
// UNCAUGHT EXCEPTION
// ======================================================

process.on(
    "uncaughtException",
    (error) => {

        console.error(
            "Uncaught Exception:"
        );

        console.error(
            error
        );
    }
);