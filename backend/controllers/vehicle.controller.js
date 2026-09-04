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

                pdfPending:
                    result.pdfPending ||
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

                adminEmailSent:
                    result.adminEmailSent ||
                    false,

                customerEmailSent:
                    result.customerEmailSent ||
                    false,

                message:
                    result.message ||
                    "Vehicle saved successfully. Publish the vehicle to generate and send the final inspection PDF."

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
// PUBLISH VEHICLE
// ADMIN
// ======================================================
//
// Supports:
//
// PATCH /api/admin/vehicles/:carId/publish
//
// POST
// /api/admin/vehicles/:carId/publish
//
// PDF is generated only after the vehicle is successfully
// published.
//
// If images are not uploaded yet, the vehicle remains
// published and PDF generation stays pending.
//
// ======================================================

const getVehicleIdFromRequest = (req) => {

    const rawCarId =
        req.params?.carId ??
        req.params?.vehicleId ??
        req.params?.id ??
        req.body?.carId ??
        req.body?.vehicleId ??
        req.body?.id;

    return Number(rawCarId);

};


const publishVehicle = async (
    req,
    res
) => {

    try {

        // ==================================================
        // GET VEHICLE ID
        // ==================================================

        const carId =
            getVehicleIdFromRequest(
                req
            );


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
        // PUBLISH VEHICLE
        // ==================================================

        const result =
            await vehicleService
                .publishVehicle(
                    carId
                );


        // ==================================================
        // VEHICLE NOT FOUND
        // ==================================================

        if (
            !result
        ) {

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
                result.message ||
                (
                    result.pdfGenerated
                        ? "Vehicle published and inspection PDF generated successfully."
                        : "Vehicle published successfully. PDF generation is pending."
                ),

            data: {

                vehicleId:
                    result.vehicleId ??
                    carId,

                carId:
                    result.carId ??
                    carId,

                published:
                    result.published ??
                    true,

                status:
                    result.status ??
                    null,

                imageCount:
                    result.imageCount ??
                    0,

                pdfGenerated:
                    result.pdfGenerated ??
                    false,

                pdfPending:
                    result.pdfPending ??
                    false,

                pdfPath:
                    result.pdfPath ??
                    null,

                pdfUrl:
                    result.pdfUrl ??
                    null,

                fileName:
                    result.fileName ??
                    null,

                adminEmail:
                    result.adminEmail ??
                    null,

                adminEmailSent:
                    result.adminEmailSent ??
                    false,

                customerEmailSent:
                    result.customerEmailSent ??
                    false

            }

        });

    }

    catch (error) {

        console.error(
            "Publish Vehicle Error:",
            error
        );


        // ==================================================
        // ERROR STATUS
        // ==================================================

        const errorMessage =
            error?.message ||
            "Unable to publish vehicle.";

        const normalizedMessage =
            String(errorMessage)
                .toLowerCase();


        let statusCode =
            500;


        if (
            normalizedMessage.includes(
                "not found"
            )
        ) {

            statusCode =
                404;

        }

        else if (
            normalizedMessage.includes(
                "valid vehicle id"
            ) ||
            normalizedMessage.includes(
                "invalid vehicle id"
            )
        ) {

            statusCode =
                400;

        }


        return res.status(statusCode).json({

            success:
                false,

            message:
                errorMessage,

            error:
                process.env.NODE_ENV === "development"
                    ? error.stack
                    : undefined

        });

    }

};





// ======================================================
// DELETE VEHICLE
// ADMIN
// ======================================================
//
// DELETE
// /api/admin/vehicles/:carId
//
// Example:
// /api/admin/vehicles/30
//
// ======================================================

const deleteVehicle = async (
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
        // DELETE VEHICLE
        // ==================================================

        const result =
            await vehicleService
                .deleteVehicle(
                    carId
                );


        // ==================================================
        // VEHICLE NOT FOUND
        // ==================================================

        if (
            !result ||
            result.deleted === false
        ) {

            return res.status(404).json({

                success:
                    false,

                message:
                    result?.message ||
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
                result.message ||
                "Vehicle deleted successfully.",

            data: {

                vehicleId:
                    carId

            }

        });

    }

    catch (error) {

        console.error(
            "Delete Vehicle Error:",
            error
        );


        return res.status(500).json({

            success:
                false,

            message:
                error.message ||
                "Unable to delete vehicle.",

            error:
                process.env.NODE_ENV === "development"
                    ? error.stack
                    : undefined

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

    getCompleteVehicleData,

    publishVehicle,

    deleteVehicle

};