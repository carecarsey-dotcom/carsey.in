const db = require("../config/db");

/**
 * Get Admin By Email
 */
const findAdminByEmail = (email) => {
  return new Promise((resolve, reject) => {
    const sql = `
            SELECT *
            FROM admins
            WHERE email = ?
            LIMIT 1
        `;

    db.query(sql, [email], (err, result) => {
      if (err) {
        return reject(err);
      }

      resolve(result[0]);
    });
  });
};

/**
 * Get Admin By ID
 */
const findAdminById = (adminId) => {
  return new Promise((resolve, reject) => {
    const sql = `
            SELECT *
            FROM admins
            WHERE admin_id = ?
            LIMIT 1
        `;

    db.query(sql, [adminId], (err, result) => {
      if (err) {
        return reject(err);
      }

      resolve(result[0]);
    });
  });
};

/**
 * Update Admin Password
 */
const updatePassword = (adminId, password) => {
  return new Promise((resolve, reject) => {
    const sql = `
            UPDATE admins
SET password = ?
WHERE admin_id = ?
        `;

    db.query(sql, [password, adminId], (err, result) => {
      if (err) {
        return reject(err);
      }

      resolve(result);
    });
  });
};

module.exports = {
  findAdminByEmail,
  findAdminById,
  updatePassword,
};
