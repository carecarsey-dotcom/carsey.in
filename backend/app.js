const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

require("dotenv").config();
require("./config/db");


// ======================================================
// CONTROLLERS
// ======================================================

const vehicleController =
    require("./controllers/vehicle.controller");


// ======================================================
// MIDDLEWARES
// ======================================================

const {
    verifyToken
} = require("./middlewares/auth.middleware");


// ======================================================
// ROUTES
// ======================================================

const authRoutes = require(
    "./routes/auth.routes"
);

const vehicleRoutes = require(
    "./routes/vehicle.routes"
);

const vehicleImageRoutes = require(
    "./routes/vehicleImage.routes"
);

const reportUnlockRoutes = require(
    "./routes/reportUnlock.routes"
);

const inspectionReportRoutes = require(
    "./routes/inspectionReport.routes"
);

const testDriveRoutes = require(
    "./routes/testDrive.routes"
);


// ======================================================
// EDIT VEHICLE ROUTES
// ======================================================

const editVehicleRoutes = require(
    "./routes/editVehicle.routes"
);


// ======================================================
// FINANCE ROUTES
// ======================================================

const financeRoutes = require(
    "./routes/finance.routes"
);


// ======================================================
// SELL CAR ROUTES
// ======================================================

const sellCarRoutes = require(
    "./routes/sellCar.routes"
);


// ======================================================
// EXCHANGE ROUTES
// ======================================================

const exchangeRoutes = require(
    "./routes/exchange.routes"
);


// ======================================================
// LOAN ROUTES
// ======================================================

const loanRoutes = require(
    "./routes/loan.routes"
);


// ======================================================
// INSPECTION BOOKING ROUTES
// ======================================================

const inspectionBookingRoutes = require(
    "./routes/inspectionBooking.routes"
);


// ======================================================
// DASHBOARD ROUTES
// ======================================================

const dashboardRoutes = require(
    "./routes/dashboard.routes"
);


// ======================================================
// EXPRESS APP
// ======================================================

const app = express();


// ======================================================
// GLOBAL MIDDLEWARES
// ======================================================

app.use(
    cors()
);


// ======================================================
// JSON BODY PARSER
// ======================================================

app.use(
    express.json({
        limit: "50mb"
    })
);


// ======================================================
// URL ENCODED BODY PARSER
// ======================================================

app.use(
    express.urlencoded({
        extended: true,
        limit: "50mb"
    })
);


// ======================================================
// RAILWAY / LOCAL UPLOAD DIRECTORY
// ======================================================
//
// Railway Volume:
//
//     /app/uploads
//
// Local development:
//
//     backend/uploads
//
// Railway Volume ko automatically detect kiya jayega.
//
// ======================================================

const railwayUploadDirectory =
    "/app/uploads";

const localUploadDirectory =
    path.join(
        __dirname,
        "uploads"
    );


// ======================================================
// SELECT UPLOAD DIRECTORY
// ======================================================

const uploadDirectory =
    fs.existsSync(
        railwayUploadDirectory
    )
        ? railwayUploadDirectory
        : localUploadDirectory;


// ======================================================
// CREATE UPLOAD DIRECTORY
// ======================================================

if (
    !fs.existsSync(
        uploadDirectory
    )
) {
    fs.mkdirSync(
        uploadDirectory,
        {
            recursive: true
        }
    );
}


// ======================================================
// VEHICLE IMAGE DIRECTORY
// ======================================================

const vehicleUploadDirectory =
    path.join(
        uploadDirectory,
        "vehicles"
    );


// ======================================================
// CREATE VEHICLE IMAGE DIRECTORY
// ======================================================

if (
    !fs.existsSync(
        vehicleUploadDirectory
    )
) {
    fs.mkdirSync(
        vehicleUploadDirectory,
        {
            recursive: true
        }
    );
}


// ======================================================
// DEBUG UPLOAD PATH
// ======================================================

console.log(
    "========================================"
);

console.log(
    "UPLOAD DIRECTORY:"
);

console.log(
    uploadDirectory
);

console.log(
    "VEHICLE UPLOAD DIRECTORY:"
);

console.log(
    vehicleUploadDirectory
);

console.log(
    "========================================"
);


// ======================================================
// STATIC UPLOAD FOLDER
// ======================================================
//
// Browser URL:
//
// /uploads/vehicles/filename.jpg
//
// Railway physical path:
//
// /app/uploads/vehicles/filename.jpg
//
// Local physical path:
//
// backend/uploads/vehicles/filename.jpg
//
// ======================================================

app.use(
    "/uploads",
    express.static(
        uploadDirectory,
        {
            maxAge: "1d",
            fallthrough: true
        }
    )
);


// ======================================================
// AUTHENTICATION ROUTES
// ======================================================

app.use(
    "/api/auth",
    authRoutes
);


// ======================================================
// CUSTOMER VEHICLE ROUTES
// PUBLIC
// ======================================================

app.use(
    "/api/vehicles",
    vehicleRoutes
);


// ======================================================
// CUSTOMER REPORT UNLOCK
// ======================================================

app.use(
    "/api/vehicles",
    reportUnlockRoutes
);


// ======================================================
// CUSTOMER INSPECTION REPORT
// ======================================================

app.use(
    "/api/vehicles",
    inspectionReportRoutes
);


// ======================================================
// CUSTOMER TEST DRIVE
// ======================================================

app.use(
    "/api/vehicles",
    testDriveRoutes
);


// ======================================================
// CUSTOMER FINANCE
// ======================================================

app.use(
    "/api/vehicles",
    financeRoutes
);


// ======================================================
// CUSTOMER SELL CAR
// ======================================================

app.use(
    "/api/vehicles",
    sellCarRoutes
);


// ======================================================
// CUSTOMER EXCHANGE
// ======================================================

app.use(
    "/api/vehicles",
    exchangeRoutes
);


// ======================================================
// CUSTOMER LOAN
// ======================================================

app.use(
    "/api/vehicles",
    loanRoutes
);


// ======================================================
// CUSTOMER BOOK INSPECTION
// ======================================================

app.use(
    "/api/vehicles",
    inspectionBookingRoutes
);


// ======================================================
// ADMIN REPORT UNLOCK
// PROTECTED
// ======================================================

app.use(
    "/api/admin",
    reportUnlockRoutes
);


// ======================================================
// ADMIN INSPECTION REPORT
// PROTECTED
// ======================================================

app.use(
    "/api/admin",
    inspectionReportRoutes
);


// ======================================================
// ADMIN TEST DRIVE
// PROTECTED
// ======================================================

app.use(
    "/api/admin",
    testDriveRoutes
);


// ======================================================
// ADMIN FINANCE
// PROTECTED
// ======================================================

app.use(
    "/api/admin",
    financeRoutes
);


// ======================================================
// ADMIN SELL CAR
// PROTECTED
// ======================================================

app.use(
    "/api/admin",
    sellCarRoutes
);


// ======================================================
// ADMIN EXCHANGE
// PROTECTED
// ======================================================

app.use(
    "/api/admin",
    exchangeRoutes
);


// ======================================================
// ADMIN LOAN
// PROTECTED
// ======================================================

app.use(
    "/api/admin",
    loanRoutes
);


// ======================================================
// ADMIN INSPECTION BOOKING
// PROTECTED
// ======================================================

app.use(
    "/api/admin",
    inspectionBookingRoutes
);


// ======================================================
// ADMIN DASHBOARD
// PROTECTED
// ======================================================

app.use(
    "/api/admin",
    dashboardRoutes
);


// ======================================================
// ADMIN VEHICLES
// PROTECTED
// ======================================================


// ------------------------------------------------------
// GET ALL VEHICLES
// ------------------------------------------------------
//
// GET
// /api/admin/vehicles
//
// Token required
//
// ------------------------------------------------------

app.get(
    "/api/admin/vehicles",
    verifyToken,
    vehicleController
        .getAllAdminVehicles
);


// ------------------------------------------------------
// ADD / OTHER VEHICLE APIs
// ------------------------------------------------------
//
// POST
// /api/admin/vehicles
//
// Existing vehicleRoutes handles this.
//
// ------------------------------------------------------

app.use(
    "/api/admin/vehicles",
    vehicleRoutes
);


// ======================================================
// EDIT VEHICLE
// PROTECTED
// ======================================================
//
// GET
// /api/admin/vehicles/:carId
//
// PUT
// /api/admin/vehicles/:carId
//
// ======================================================

app.use(
    "/api/admin/vehicles",
    verifyToken,
    editVehicleRoutes
);


// ======================================================
// ADMIN VEHICLE IMAGES
// PROTECTED
// ======================================================
//
// POST
// /api/admin/vehicles/:carId/images
//
// GET
// /api/admin/vehicles/:carId/images
//
// PUT
// /api/admin/vehicles/:carId/images/:imageId
//
// DELETE
// /api/admin/vehicles/:carId/images/:imageId
//
// PUT
// /api/admin/vehicles/:carId/images/:imageId/primary
//
// ======================================================

app.use(
    "/api/admin/vehicles",
    verifyToken,
    vehicleImageRoutes
);


// ======================================================
// HEALTH CHECK
// ======================================================

app.get(
    "/health",
    (req, res) => {

        return res.status(200).json({

            success: true,

            message:
                "Carsey.in Backend is Healthy.",

            uploadDirectory,

            vehicleUploadDirectory

        });

    }
);


// ======================================================
// HOME ROUTE
// ======================================================

app.get(
    "/",
    (req, res) => {

        return res.status(200).json({

            success: true,

            message:
                "Carsey.in Backend is Running..."

        });

    }
);


// ======================================================
// 404 ROUTE
// ======================================================

app.use(
    (req, res) => {

        return res.status(404).json({

            success: false,

            message:
                "Route Not Found"

        });

    }
);


// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use(
    (
        err,
        req,
        res,
        next
    ) => {

        console.error(
            "Global Error:",
            err
        );


        return res.status(500).json({

            success: false,

            message:
                err.message ||
                "Internal Server Error"

        });

    }
);


// ======================================================
// EXPORT APP
// ======================================================

module.exports = app;