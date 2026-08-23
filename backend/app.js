const express = require("express");
const cors = require("cors");
const path = require("path");

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
    express.json()
);


// ======================================================
// URL ENCODED BODY PARSER
// ======================================================

app.use(
    express.urlencoded({
        extended: true
    })
);


// ======================================================
// STATIC UPLOAD FOLDER
// ======================================================

app.use(
    "/uploads",
    express.static(
        path.join(
            __dirname,
            "uploads"
        )
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
// ======================================================

app.use(
    "/api/admin/vehicles",
    verifyToken,
    vehicleImageRoutes
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