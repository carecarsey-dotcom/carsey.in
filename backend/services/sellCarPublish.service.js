const db = require("../config/db");
const path = require("path");
const sellCarRepository = require("../repositories/sellCar.repository");
const vehicleImageRepository = require("../repositories/vehicleImage.repository");

const imageFields = [
  ["frontImage", "front_image", "Front View"],
  ["backImage", "back_image", "Rear View"],
  ["leftImage", "left_image", "Left View"],
  ["rightImage", "right_image", "Right View"],
  ["interiorFrontImage", "interior_front_image", "Interior Front"],
  ["interiorRearImage", "interior_rear_image", "Interior Rear"],
  ["openDickyImage", "open_dicky_image", "Open Dicky"],
  ["openBonnetImage", "open_bonnet_image", "Open Bonnet"],
  ["odometerImage", "odometer_image", "Odometer"],
  ["dashboardImage", "dashboard_image", "Dashboard"]
];

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    const runner = db && typeof db.promise === "function" ? db.promise() : null;
    if (runner) {
      runner.execute(sql, params).then(([rows]) => resolve(rows)).catch(reject);
      return;
    }
    db.query(sql, params, (err, result) => err ? reject(err) : resolve(result));
  });
}

function clean(value) {
  if (value === undefined || value === null || String(value).trim() === "") return null;
  return value;
}

function uploadedPath(file) {
  if (!file) return null;
  const raw = String(file.path || file.filename || "");
  const relative = path.isAbsolute(raw) ? path.relative(process.cwd(), raw) : raw;
  return relative.replace(/\\/g, "/").replace(/^\.\//, "");
}

async function publishFromSellCar(sellId, body, files = {}) {
  const id = Number(sellId);
  if (!Number.isInteger(id) || id <= 0) throw new Error("Valid Sell Car request ID is required.");

  const request = await sellCarRepository.getSellCarRequestById(id);
  if (!request) throw new Error("Sell Car request not found.");

  // Prevent creating multiple vehicles for the same request.
  const existing = await query("SELECT car_id FROM cars WHERE source_sell_id = ? LIMIT 1", [id]);
  if (Array.isArray(existing) && existing.length) {
    throw new Error(`This Sell Car request has already created vehicle ID ${existing[0].car_id}. Open that vehicle instead of publishing again.`);
  }

  const brand = clean(body.brand ?? request.brand);
  const model = clean(body.model ?? request.model);
  const vehicleNumber = clean(body.vehicleNumber ?? body.registration_number ?? request.vehicle_number);
  if (!brand || !model || !vehicleNumber) throw new Error("Brand, Model aur Vehicle Number bharna zaroori hai.");

  const columnRows = await query("SHOW COLUMNS FROM cars");
  const columns = new Set((columnRows || []).map(row => row.Field || row.field));
  for (const required of ["source_type", "source_sell_id"]) {
    if (!columns.has(required)) throw new Error(`Database migration missing: cars.${required}. Please run sell-car-source-migration.sql first.`);
  }

  const source = {
    brand,
    model,
    variant: clean(body.variant ?? request.variant),
    manufacturing_year: clean(body.manufacturingYear ?? body.manufacturing_year ?? request.manufacturing_year),
    price: clean(body.expectedPrice ?? body.price ?? request.expected_price),
    odometer: clean(body.kmDriven ?? body.km_driven ?? request.km_driven),
    city: clean(body.city ?? request.city),
    transmission: clean(body.transmission ?? request.transmission),
    fuel_type: clean(body.fuelType ?? body.fuel_type ?? request.fuel_type),
    registration_number: vehicleNumber,
    status: "Published",
    published_at: new Date(),
    source_type: "sell-car",
    source_sell_id: id
  };

  const insert = Object.entries(source).filter(([key, value]) => columns.has(key) && (value !== undefined));
  const names = insert.map(([key]) => `\`${key}\``).join(", ");
  const placeholders = insert.map(() => "?").join(", ");
  const values = insert.map(([, value]) => value);
  const result = await query(`INSERT INTO cars (${names}) VALUES (${placeholders})`, values);
  const carId = Number(result.insertId);
  if (!Number.isInteger(carId) || carId <= 0) throw new Error("Vehicle ID was not generated.");

  // Preserve request images by default. Uploaded files replace their corresponding request image.
  // remove_<field>=true deliberately excludes that image from the published vehicle.
  let imageCount = 0;
  try {
    for (const [field, requestColumn, label] of imageFields) {
      if (String(body[`remove_${field}`] || "").toLowerCase() === "true") continue;
      const file = Array.isArray(files[field]) ? files[field][0] : null;
      const path = file ? uploadedPath(file) : clean(request[requestColumn]);
      if (!path) continue;
      await vehicleImageRepository.addVehicleImage(carId, label, path, imageCount === 0);
      imageCount++;
    }

    await sellCarRepository.updateSellCarRequestStatus(id, "Approved");
  } catch (error) {
    // Do not silently leave a published car with an incomplete image/status operation.
    // Mark the vehicle Draft so it cannot leak into the public listing on a partial failure.
    try { await query("UPDATE cars SET status = 'Draft' WHERE car_id = ?", [carId]); } catch (_) {}
    throw error;
  }

  return {
    vehicleId: carId,
    carId,
    sellId: id,
    displayId: `SCR-${String(100000 + id).padStart(6, "0")}`,
    status: "Published",
    published: true,
    imageCount,
    pdfGenerated: false,
    pdfPending: false,
    adminEmailSent: false,
    customerEmailSent: false,
    message: "Sell Car vehicle published successfully without PDI or inspection PDF."
  };
}

module.exports = { publishFromSellCar };
