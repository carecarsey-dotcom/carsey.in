const carPriceRequestRepository =
    require("../repositories/carPriceRequest.repository");

const submitCarPriceRequest = async (carIdValue, payload = {}) => {
    const carId = Number(carIdValue);

    if (!Number.isSafeInteger(carId) || carId <= 0) {
        const error = new Error("A valid car ID is required.");
        error.statusCode = 400;
        throw error;
    }

    const name = String(payload.name ?? payload.customer_name ?? "").trim();
    const mobile = String(payload.mobile ?? "").replace(/\s+/g, "");
    const email = String(payload.email ?? "").trim().toLowerCase();

    if (!name || name.length > 100) {
        const error = new Error("Please enter your name (maximum 100 characters).");
        error.statusCode = 400;
        throw error;
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
        const error = new Error("Please enter a valid 10-digit mobile number.");
        error.statusCode = 400;
        throw error;
    }

    if (
        email.length > 150 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
        const error = new Error("Please enter a valid email address.");
        error.statusCode = 400;
        throw error;
    }

    const exists = await carPriceRequestRepository.carExists(carId);
    if (!exists) {
        const error = new Error("The selected car could not be found.");
        error.statusCode = 404;
        throw error;
    }

    return carPriceRequestRepository.createPriceRequest({
        carId,
        name,
        mobile,
        email
    });
};

module.exports = {
    submitCarPriceRequest
};
