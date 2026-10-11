const sellCarPublishService = require("../services/sellCarPublish.service");

const publishFromSellCar = async (req, res) => {
  try {
    const result = await sellCarPublishService.publishFromSellCar(
      req.params.sellId,
      req.body || {},
      req.files || {}
    );
    return res.status(201).json({ success: true, message: result.message, data: result });
  } catch (error) {
    console.error("Publish Sell Car Vehicle Error:", error);
    const message = error && error.message ? error.message : "Unable to publish Sell Car vehicle.";
    const lower = message.toLowerCase();
    const status = lower.includes("not found") ? 404 : (lower.includes("required") || lower.includes("valid") || lower.includes("migration missing") || lower.includes("already created") ? 400 : 500);
    return res.status(status).json({ success: false, message });
  }
};

module.exports = { publishFromSellCar };
