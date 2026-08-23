const editVehicleService =
    require("../services/editVehicle.service");



// ======================================================
// GET SINGLE VEHICLE
// ======================================================
//
// GET
// /api/admin/vehicles/:carId
//
// ======================================================

const getVehicleById = async (
    req,
    res
) => {

    try {

        const carId =
            Number(
                req.params.carId
            );


        // ==================================================
        // VALIDATE VEHICLE ID
        // ==================================================

        if (!carId) {

            return res.status(400).json({

                success: false,

                message:
                    "Valid vehicle ID is required."

            });

        }


        // ==================================================
        // GET VEHICLE
        // ==================================================

        const result =
            await editVehicleService
                .getVehicleById(
                    carId
                );


        // ==================================================
        // VEHICLE NOT FOUND
        // ==================================================

        if (!result) {

            return res.status(404).json({

                success: false,

                message:
                    "Vehicle not found."

            });

        }


        // ==================================================
        // SUCCESS RESPONSE
        // ==================================================

        return res.status(200).json({

            success: true,

            message:
                "Vehicle fetched successfully.",

            data: result

        });


    } catch (error) {

        console.error(
            "Get Vehicle By ID Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to load vehicle."

        });

    }

};



// ======================================================
// UPDATE VEHICLE
// ======================================================
//
// PUT
// /api/admin/vehicles/:carId
//
// ======================================================

const updateVehicle = async (
    req,
    res
) => {

    try {

        const carId =
            Number(
                req.params.carId
            );


        // ==================================================
        // VALIDATE VEHICLE ID
        // ==================================================

        if (!carId) {

            return res.status(400).json({

                success: false,

                message:
                    "Valid vehicle ID is required."

            });

        }


        // ==================================================
        // GET FORM DATA
        // ==================================================

        const vehicle =
            req.body;


        // ==================================================
        // UPDATE VEHICLE
        // ==================================================

        const result =
            await editVehicleService
                .updateVehicle(
                    carId,
                    vehicle
                );


        // ==================================================
        // SUCCESS RESPONSE
        // ==================================================

        return res.status(200).json({

            success: true,

            message:
                "Vehicle updated successfully.",

            data: result

        });


    } catch (error) {

        console.error(
            "Update Vehicle Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to update vehicle."

        });

    }

};



// ======================================================
// EXPORT
// ======================================================

module.exports = {

    getVehicleById,

    updateVehicle

};