const vehicleService =
    require("../services/vehicle.service");


// ======================================================
// ADD VEHICLE
// ======================================================

const addVehicle = async (
    req,
    res
) => {

    try {

        // ==================================================
        // GET FORM DATA
        // ==================================================

        const vehicle =
            req.body;


        // ==================================================
        // SAVE VEHICLE
        // ==================================================

        const result =
            await vehicleService.addVehicle(
                vehicle
            );


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.status(201).json({

            success:
                true,

            message:
                result.message ||
                "Vehicle Added Successfully",

            data: {

                vehicleId:
                    result.vehicleId,

                reportId:
                    result.reportId,

                pdfGenerated:
                    result.pdfGenerated ||
                    false,

                pdfPath:
                    result.pdfPath ||
                    null,

                pdfUrl:
                    result.pdfUrl ||
                    null,

                fileName:
                    result.fileName ||
                    null,

                adminEmail:
                    result.adminEmail ||
                    null,

                message:
                    "Vehicle, inspection report, checklist and PDF processing completed successfully."
            }

        });

    }

    catch (error) {

        console.error(
            "Add Vehicle Error:",
            error
        );


        return res.status(500).json({

            success:
                false,

            message:
                error.message ||
                "Unable to add vehicle.",

            error:
                process.env.NODE_ENV === "development"
                    ? error.stack
                    : undefined

        });

    }

};



// ======================================================
// GET ALL VEHICLES
// ADMIN
// ======================================================

const getAllAdminVehicles = async (
    req,
    res
) => {

    try {

        const result =
            await vehicleService
                .getAllAdminVehicles();


        return res.status(200).json({

            success:
                true,

            message:
                "Vehicles fetched successfully.",

            data:
                result

        });

    }

    catch (error) {

        console.error(
            "Get Admin Vehicles Error:",
            error
        );


        return res.status(500).json({

            success:
                false,

            message:
                error.message ||
                "Unable to load vehicles."

        });

    }

};



// ======================================================
// GET PUBLISHED VEHICLES
// CUSTOMER
// ======================================================

const getPublishedVehicles = async (
    req,
    res
) => {

    try {

        const filters =
            req.query;


        const result =
            await vehicleService
                .getPublishedVehicles(
                    filters
                );


        return res.status(200).json({

            success:
                true,

            message:
                "Vehicles fetched successfully.",

            data:
                result

        });

    }

    catch (error) {

        console.error(
            "Get Published Vehicles Error:",
            error
        );


        return res.status(500).json({

            success:
                false,

            message:
                error.message ||
                "Unable to load vehicles."

        });

    }

};



// ======================================================
// GET COMPLETE VEHICLE DATA
// CUSTOMER - SINGLE VEHICLE
// ======================================================
//
// GET
// /api/vehicles/:carId
//
// Example:
// /api/vehicles/30
//
// ======================================================

const getCompleteVehicleData = async (
    req,
    res
) => {

    try {

        // ==================================================
        // GET VEHICLE ID
        // ==================================================

        const rawCarId =
            req.params.carId;


        const carId =
            Number(rawCarId);


        // ==================================================
        // VALIDATE VEHICLE ID
        // ==================================================

        if (
            !Number.isInteger(carId) ||
            carId <= 0
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Valid vehicle ID is required."

            });

        }


        // ==================================================
        // GET COMPLETE VEHICLE DATA
        // ==================================================

        const result =
            await vehicleService
                .getCompleteVehicleData(
                    carId
                );


        // ==================================================
        // VEHICLE NOT FOUND
        // ==================================================

        if (!result) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "Vehicle not found."

            });

        }


        // ==================================================
        // SUCCESS RESPONSE
        // ==================================================

        return res.status(200).json({

            success:
                true,

            message:
                "Vehicle fetched successfully.",

            data:
                result

        });

    }

    catch (error) {

        console.error(
            "Get Complete Vehicle Data Error:",
            error
        );


        return res.status(500).json({

            success:
                false,

            message:
                error.message ||
                "Unable to load vehicle."

        });

    }

};



// ======================================================
// EXPORT
// ======================================================

module.exports = {

    addVehicle,

    getAllAdminVehicles,

    getPublishedVehicles,

    getCompleteVehicleData

};