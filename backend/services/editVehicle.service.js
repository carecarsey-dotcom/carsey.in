const editVehicleRepository =
    require("../repositories/editVehicle.repository");



// ======================================================
// GET SINGLE VEHICLE
// ======================================================
//
// Controller:
// getVehicleById(req, res)
//
// Repository:
// getVehicleById(carId)
//
// ======================================================

const getVehicleById = async (
    carId
) => {

    // ==================================================
    // VALIDATE VEHICLE ID
    // ==================================================

    if (!carId) {

        throw new Error(
            "Valid vehicle ID is required."
        );

    }


    // ==================================================
    // GET COMPLETE VEHICLE DATA
    // ==================================================

    return await editVehicleRepository
        .getVehicleById(
            carId
        );

};



// ======================================================
// UPDATE VEHICLE
// ======================================================
//
// Controller:
// updateVehicle(req, res)
//
// Repository:
// updateVehicle(carId, vehicle)
//
// ======================================================

const updateVehicle = async (
    carId,
    vehicle
) => {

    // ==================================================
    // VALIDATE VEHICLE ID
    // ==================================================

    if (!carId) {

        throw new Error(
            "Valid vehicle ID is required."
        );

    }


    // ==================================================
    // VALIDATE VEHICLE DATA
    // ==================================================

    if (
        !vehicle ||
        typeof vehicle !== "object"
    ) {

        throw new Error(
            "Vehicle data is required."
        );

    }


    // ==================================================
    // UPDATE COMPLETE VEHICLE DATA
    // ==================================================

    return await editVehicleRepository
        .updateVehicle(
            carId,
            vehicle
        );

};



// ======================================================
// EXPORT
// ======================================================

module.exports = {

    getVehicleById,

    updateVehicle

};