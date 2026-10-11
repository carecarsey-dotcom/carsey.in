const carPriceRequestService =
    require("../services/carPriceRequest.service");

const submitCarPriceRequest = async (req, res) => {
    try {
        const result = await carPriceRequestService.submitCarPriceRequest(
            req.params.carId,
            req.body
        );

        return res.status(201).json({
            success: true,
            requestId: result.requestId,
            carId: result.carId,
            message:
                "Thank You! Your request has been submitted successfully. Our team will contact you soon to share the car price."
        });
    } catch (error) {
        console.error("Submit Car Price Request Error:", error.message);

        return res.status(error.statusCode || 500).json({
            success: false,
            message:
                error.statusCode && error.statusCode < 500
                    ? error.message
                    : "Unable to submit your request right now. Please try again later."
        });
    }
};

module.exports = {
    submitCarPriceRequest
};
