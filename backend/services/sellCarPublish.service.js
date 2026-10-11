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
  ["dashboardImage", "dashboard_image", "Dashboard"],
];

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    const runner = db && typeof db.promise === "function" ? db.promise() : null;

    if (runner) {
      runner
        .execute(sql, params)
        .then(([rows]) => resolve(rows))
        .catch(reject);
      return;
    }

    db.query(sql, params, (err, result) => (err ? reject(err) : resolve(result)));
  });
}

function clean(value) {
  if (value === undefined || value === null || String(value).trim() === "") {
    return null;
  }
  return value;
}

function uploadedPath(file) {
  if (!file) return null;

  const raw = String(file.path || file.filename || "");
  const relative = path.isAbsolute(raw) ? path.relative(process.cwd(), raw) : raw;

  return relative.replace(/\\/g, "/").replace(/^\.\//, "");
}

function getFirstValue(object, keys) {
  for (const key of keys) {
    const value = clean(object?.[key]);
    if (value !== null) return value;
  }
  return null;
}

async function getTableColumns(tableName) {
  const rows = await query(`SHOW COLUMNS FROM \`${tableName}\``);
  return new Set((rows || []).map((row) => row.Field || row.field).filter(Boolean));
}

/**
 * Find or create an owner for a Sell Car request.
 * Uses the actual owners table columns and does not assume a separate owner repository exists.
 */
async function findOrCreateOwner(request, body = {}) {
  const ownerColumns = await getTableColumns("owners");

  if (!ownerColumns.has("owner_id")) {
    throw new Error("Database schema error: owners.owner_id column is missing.");
  }

  const ownerName = getFirstValue(body, [
    "ownerName", "owner_name", "sellerName", "seller_name",
  ]) || getFirstValue(request, [
    "owner_name", "ownerName", "seller_name", "sellerName", "name",
  ]);

  const mobile = getFirstValue(body, [
    "mobile", "ownerMobile", "owner_mobile", "sellerMobile", "seller_mobile",
  ]) || getFirstValue(request, [
    "mobile", "owner_mobile", "ownerMobile", "seller_mobile", "sellerMobile",
  ]);

  const email = getFirstValue(body, [
    "email", "ownerEmail", "owner_email", "sellerEmail", "seller_email",
  ]) || getFirstValue(request, [
    "email", "owner_email", "ownerEmail", "seller_email", "sellerEmail",
  ]);

  const address = getFirstValue(body, [
    "address", "ownerAddress", "owner_address", "sellerAddress", "seller_address",
  ]) || getFirstValue(request, [
    "address", "owner_address", "ownerAddress", "seller_address", "sellerAddress",
  ]);

  const city = getFirstValue(body, ["city", "ownerCity", "owner_city"])
    || getFirstValue(request, ["city", "owner_city", "ownerCity"]);

  const state = getFirstValue(body, ["state", "ownerState", "owner_state"])
    || getFirstValue(request, ["state", "owner_state", "ownerState"]);

  const pincode = getFirstValue(body, ["pincode", "pinCode", "owner_pincode"])
    || getFirstValue(request, ["pincode", "pin_code", "owner_pincode"]);

  if (!ownerName && !mobile && !email) {
    throw new Error(
      "Seller details are missing from the Sell Car request; owner record cannot be created."
    );
  }

  // Prefer exact mobile match, then exact email match to avoid duplicate owner records.
  let existingOwner = null;

  if (mobile && ownerColumns.has("mobile")) {
    const rows = await query(
      "SELECT owner_id FROM owners WHERE mobile = ? LIMIT 1",
      [mobile]
    );
    existingOwner = rows?.[0] || null;
  }

  if (!existingOwner && email && ownerColumns.has("email")) {
    const rows = await query(
      "SELECT owner_id FROM owners WHERE email = ? LIMIT 1",
      [email]
    );
    existingOwner = rows?.[0] || null;
  }

  if (existingOwner) {
    const ownerId = Number(existingOwner.owner_id);

    // Fill in missing fields on the existing owner without overwriting populated data.
    const updates = [];
    const values = [];
    const candidateValues = {
      owner_name: ownerName,
      mobile,
      email,
      address,
      city,
      state,
      pincode,
    };

    for (const [column, value] of Object.entries(candidateValues)) {
      if (ownerColumns.has(column) && value !== null) {
        updates.push(`\`${column}\` = COALESCE(NULLIF(\`${column}\`, ''), ?)`);
        values.push(value);
      }
    }

    if (updates.length) {
      values.push(ownerId);
      await query(
        `UPDATE owners SET ${updates.join(", ")} WHERE owner_id = ?`,
        values
      );
    }

    return ownerId;
  }

  const ownerData = {
    owner_name: ownerName,
    mobile,
    email,
    address,
    city,
    state,
    pincode,
  };

  const insert = Object.entries(ownerData).filter(
    ([column, value]) => ownerColumns.has(column) && value !== null
  );

  if (!insert.length) {
    throw new Error("No compatible seller fields were found for the owners table.");
  }

  const columnNames = insert.map(([column]) => `\`${column}\``).join(", ");
  const placeholders = insert.map(() => "?").join(", ");
  const values = insert.map(([, value]) => value);

  const result = await query(
    `INSERT INTO owners (${columnNames}) VALUES (${placeholders})`,
    values
  );

  const ownerId = Number(result.insertId);
  if (!Number.isInteger(ownerId) || ownerId <= 0) {
    throw new Error("Owner record was not created; owner_id was not generated.");
  }

  return ownerId;
}

async function publishFromSellCar(sellId, body = {}, files = {}) {
  const id = Number(sellId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Valid Sell Car request ID is required.");
  }

  const request = await sellCarRepository.getSellCarRequestById(id);
  if (!request) throw new Error("Sell Car request not found.");

  // Prevent creating multiple vehicles for the same request.
  const existing = await query(
    "SELECT car_id FROM cars WHERE source_sell_id = ? LIMIT 1",
    [id]
  );
  if (Array.isArray(existing) && existing.length) {
    throw new Error(
      `This Sell Car request has already created vehicle ID ${existing[0].car_id}. Open that vehicle instead of publishing again.`
    );
  }

  const brand = clean(body.brand ?? request.brand);
  const model = clean(body.model ?? request.model);
  const vehicleNumber = clean(
    body.vehicleNumber ?? body.registration_number ?? request.vehicle_number
  );

  if (!brand || !model || !vehicleNumber) {
    throw new Error("Brand, Model aur Vehicle Number bharna zaroori hai.");
  }

  const columnRows = await query("SHOW COLUMNS FROM cars");
  const columns = new Set(
    (columnRows || []).map((row) => row.Field || row.field).filter(Boolean)
  );

  for (const required of ["source_type", "source_sell_id", "owner_id"]) {
    if (!columns.has(required)) {
      throw new Error(`Database migration missing: cars.${required} column is required.`);
    }
  }

  // Create/find owner first so cars.owner_id can reference a real owners.owner_id.
  const ownerId = await findOrCreateOwner(request, body);

  const source = {
    owner_id: ownerId,
    brand,
    model,
    variant: clean(body.variant ?? request.variant),
    manufacturing_year: clean(
      body.manufacturingYear ?? body.manufacturing_year ?? request.manufacturing_year
    ),
    price: clean(body.expectedPrice ?? body.price ?? request.expected_price),
    odometer: clean(body.kmDriven ?? body.km_driven ?? request.km_driven),
    city: clean(body.city ?? request.city),
    transmission: clean(body.transmission ?? request.transmission),
    fuel_type: clean(body.fuelType ?? body.fuel_type ?? request.fuel_type),
    registration_number: vehicleNumber,
    status: "Published",
    published_at: new Date(),
    source_type: "sell-car",
    source_sell_id: id,
  };

  const insert = Object.entries(source).filter(([key]) => columns.has(key));
  const names = insert.map(([key]) => `\`${key}\``).join(", ");
  const placeholders = insert.map(() => "?").join(", ");
  const values = insert.map(([, value]) => value);

  const result = await query(
    `INSERT INTO cars (${names}) VALUES (${placeholders})`,
    values
  );

  const carId = Number(result.insertId);
  if (!Number.isInteger(carId) || carId <= 0) {
    throw new Error("Vehicle ID was not generated.");
  }

  // Preserve request images by default. Uploaded files replace corresponding request images.
  // remove_<field>=true deliberately excludes that image from the published vehicle.
  let imageCount = 0;

  try {
    for (const [field, requestColumn, label] of imageFields) {
      if (String(body[`remove_${field}`] || "").toLowerCase() === "true") continue;

      const file = Array.isArray(files[field]) ? files[field][0] : null;
      const imagePath = file ? uploadedPath(file) : clean(request[requestColumn]);

      if (!imagePath) continue;

      await vehicleImageRepository.addVehicleImage(
        carId,
        label,
        imagePath,
        imageCount === 0
      );
      imageCount++;
    }

    await sellCarRepository.updateSellCarRequestStatus(id, "Approved");
  } catch (error) {
    // Do not leave a partially processed car published.
    try {
      await query("UPDATE cars SET status = 'Draft' WHERE car_id = ?", [carId]);
    } catch (_) {}
    throw error;
  }

  return {
    vehicleId: carId,
    carId,
    ownerId,
    sellId: id,
    displayId: `SCR-${String(100000 + id).padStart(6, "0")}`,
    status: "Published",
    published: true,
    imageCount,
    pdfGenerated: false,
    pdfPending: false,
    adminEmailSent: false,
    customerEmailSent: false,
    message: "Sell Car vehicle published successfully without PDI or inspection PDF.",
  };
}

module.exports = { publishFromSellCar };
