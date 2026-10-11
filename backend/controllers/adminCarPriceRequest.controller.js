const db = require("../config/db");

// ======================================================
// GET ALL CAR PRICE REQUESTS (ADMIN)
// ======================================================
const getCarPriceRequests = (req, res) => {
  const query = `
    SELECT
      request_id,
      car_id,
      customer_name,
      mobile,
      email,
      status,
      created_at
    FROM car_price_requests
    ORDER BY created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching car price requests:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch car price requests",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        requests: results,
      },
    });
  });
};

// ======================================================
// UPDATE CAR PRICE REQUEST STATUS (ADMIN)
// ======================================================
const updateCarPriceRequestStatus = (req, res) => {
  const requestId = Number(req.params.id);
  const { status } = req.body;

  const allowedStatuses = ["Pending", "Contacted", "Closed"];

  if (!Number.isInteger(requestId) || requestId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid request ID",
    });
  }

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status",
    });
  }

  const query = `
    UPDATE car_price_requests
    SET status = ?
    WHERE request_id = ?
  `;

  db.query(query, [status, requestId], (err, result) => {
    if (err) {
      console.error("Error updating car price request status:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to update request status",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Car price request not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Car price request status updated successfully",
    });
  });
};

module.exports = {
  getCarPriceRequests,
  updateCarPriceRequestStatus,
};