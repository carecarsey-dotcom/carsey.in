const db = require("../config/db");

// ======================================================
// ADD VEHICLE IMAGE
// ======================================================

const addVehicleImage = (
    carId,
    imageType,
    imagePath,
    isPrimary
) => {
    return new Promise((resolve, reject) => {

        const insertImage = () => {

            const sql = `
                INSERT INTO car_images (
                    car_id,
                    image_type,
                    image_path,
                    is_primary
                )
                VALUES (?, ?, ?, ?)
            `;

            db.query(
                sql,
                [
                    carId,
                    imageType,
                    imagePath,
                    isPrimary ? 1 : 0
                ],
                (error, result) => {

                    if (error) {
                        console.error(
                            "ADD VEHICLE IMAGE DB ERROR:",
                            error
                        );

                        return reject(error);
                    }

                    resolve(result.insertId);
                }
            );
        };

        if (isPrimary) {

            const clearSql = `
                UPDATE car_images
                SET is_primary = 0
                WHERE car_id = ?
            `;

            db.query(
                clearSql,
                [carId],
                (error) => {

                    if (error) {
                        console.error(
                            "CLEAR PRIMARY BEFORE ADD ERROR:",
                            error
                        );

                        return reject(error);
                    }

                    insertImage();
                }
            );

        } else {

            insertImage();
        }
    });
};


// ======================================================
// GET VEHICLE IMAGES
// ======================================================
// IMPORTANT:
// Public vehicle image API ONLY reads car_images.
// No checklist.
// No inspection.
// No created_at.
// No other table.
// ======================================================

const getVehicleImages = (carId) => {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT
                image_id,
                car_id,
                image_type,
                image_path,
                is_primary
            FROM car_images
            WHERE car_id = ?
            ORDER BY
                is_primary DESC,
                image_id ASC
        `;

        db.query(
            sql,
            [carId],
            (error, images) => {

                if (error) {

                    console.error(
                        "GET VEHICLE IMAGES DB ERROR:",
                        error
                    );

                    console.error(
                        "GET VEHICLE IMAGES CAR ID:",
                        carId
                    );

                    return reject(error);
                }

                resolve(
                    Array.isArray(images)
                        ? images
                        : []
                );
            }
        );
    });
};


// ======================================================
// GET SINGLE VEHICLE IMAGE
// ======================================================

const getVehicleImageById = (
    imageId,
    carId
) => {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT
                image_id,
                car_id,
                image_type,
                image_path,
                is_primary
            FROM car_images
            WHERE
                image_id = ?
                AND car_id = ?
            LIMIT 1
        `;

        db.query(
            sql,
            [
                imageId,
                carId
            ],
            (error, rows) => {

                if (error) {

                    console.error(
                        "GET SINGLE VEHICLE IMAGE DB ERROR:",
                        error
                    );

                    return reject(error);
                }

                resolve(
                    rows && rows.length > 0
                        ? rows[0]
                        : null
                );
            }
        );
    });
};


// ======================================================
// UPDATE VEHICLE IMAGE
// ======================================================

const updateVehicleImage = (
    imageId,
    carId,
    imageType,
    imagePath,
    isPrimary
) => {

    return new Promise((resolve, reject) => {

        const updateImage = () => {

            let sql;
            let params;

            // ------------------------------------------
            // New image path supplied
            // ------------------------------------------

            if (
                imagePath !== null &&
                imagePath !== undefined &&
                String(imagePath).trim() !== ""
            ) {

                sql = `
                    UPDATE car_images
                    SET
                        image_type = ?,
                        image_path = ?,
                        is_primary = ?
                    WHERE
                        image_id = ?
                        AND car_id = ?
                `;

                params = [
                    imageType,
                    imagePath,
                    isPrimary ? 1 : 0,
                    imageId,
                    carId
                ];

            } else {

                // --------------------------------------
                // Preserve existing image_path
                // --------------------------------------

                sql = `
                    UPDATE car_images
                    SET
                        image_type = ?,
                        is_primary = ?
                    WHERE
                        image_id = ?
                        AND car_id = ?
                `;

                params = [
                    imageType,
                    isPrimary ? 1 : 0,
                    imageId,
                    carId
                ];
            }

            db.query(
                sql,
                params,
                (error, result) => {

                    if (error) {

                        console.error(
                            "UPDATE VEHICLE IMAGE DB ERROR:",
                            error
                        );

                        return reject(error);
                    }

                    resolve({
                        imageId,
                        carId,
                        affectedRows:
                            result.affectedRows
                    });
                }
            );
        };


        // ------------------------------------------
        // Only one primary image
        // ------------------------------------------

        if (isPrimary) {

            const clearSql = `
                UPDATE car_images
                SET is_primary = 0
                WHERE
                    car_id = ?
                    AND image_id <> ?
            `;

            db.query(
                clearSql,
                [
                    carId,
                    imageId
                ],
                (error) => {

                    if (error) {

                        console.error(
                            "CLEAR PRIMARY BEFORE UPDATE ERROR:",
                            error
                        );

                        return reject(error);
                    }

                    updateImage();
                }
            );

        } else {

            updateImage();
        }
    });
};


// ======================================================
// DELETE VEHICLE IMAGE
// ======================================================

const deleteVehicleImage = (
    imageId,
    carId
) => {

    return new Promise((resolve, reject) => {

        const sql = `
            DELETE FROM car_images
            WHERE
                image_id = ?
                AND car_id = ?
        `;

        db.query(
            sql,
            [
                imageId,
                carId
            ],
            (error, result) => {

                if (error) {

                    console.error(
                        "DELETE VEHICLE IMAGE DB ERROR:",
                        error
                    );

                    return reject(error);
                }

                resolve({
                    imageId,
                    carId,
                    affectedRows:
                        result.affectedRows
                });
            }
        );
    });
};


// ======================================================
// DELETE ALL VEHICLE IMAGES
// ======================================================

const deleteVehicleImages = (carId) => {

    return new Promise((resolve, reject) => {

        const sql = `
            DELETE FROM car_images
            WHERE car_id = ?
        `;

        db.query(
            sql,
            [carId],
            (error, result) => {

                if (error) {

                    console.error(
                        "DELETE ALL VEHICLE IMAGES DB ERROR:",
                        error
                    );

                    return reject(error);
                }

                resolve({
                    carId,
                    affectedRows:
                        result.affectedRows
                });
            }
        );
    });
};


// ======================================================
// CLEAR PRIMARY IMAGE
// ======================================================

const clearPrimaryImage = (carId) => {

    return new Promise((resolve, reject) => {

        const sql = `
            UPDATE car_images
            SET is_primary = 0
            WHERE car_id = ?
        `;

        db.query(
            sql,
            [carId],
            (error, result) => {

                if (error) {

                    console.error(
                        "CLEAR PRIMARY IMAGE DB ERROR:",
                        error
                    );

                    return reject(error);
                }

                resolve(
                    result.affectedRows
                );
            }
        );
    });
};


// ======================================================
// SET PRIMARY IMAGE
// ======================================================

const setPrimaryImage = (
    imageId,
    carId
) => {

    return new Promise((resolve, reject) => {

        const verifySql = `
            SELECT
                image_id
            FROM car_images
            WHERE
                image_id = ?
                AND car_id = ?
            LIMIT 1
        `;

        db.query(
            verifySql,
            [
                imageId,
                carId
            ],
            (
                verifyError,
                rows
            ) => {

                if (verifyError) {

                    console.error(
                        "VERIFY PRIMARY IMAGE DB ERROR:",
                        verifyError
                    );

                    return reject(
                        verifyError
                    );
                }

                if (
                    !rows ||
                    rows.length === 0
                ) {

                    return reject(
                        new Error(
                            "Vehicle image not found for this vehicle."
                        )
                    );
                }

                const clearSql = `
                    UPDATE car_images
                    SET is_primary = 0
                    WHERE car_id = ?
                `;

                db.query(
                    clearSql,
                    [carId],
                    (clearError) => {

                        if (clearError) {

                            console.error(
                                "CLEAR PRIMARY BEFORE SET ERROR:",
                                clearError
                            );

                            return reject(
                                clearError
                            );
                        }

                        const setSql = `
                            UPDATE car_images
                            SET is_primary = 1
                            WHERE
                                image_id = ?
                                AND car_id = ?
                        `;

                        db.query(
                            setSql,
                            [
                                imageId,
                                carId
                            ],
                            (
                                error,
                                result
                            ) => {

                                if (error) {

                                    console.error(
                                        "SET PRIMARY IMAGE DB ERROR:",
                                        error
                                    );

                                    return reject(
                                        error
                                    );
                                }

                                resolve({
                                    imageId,
                                    carId,
                                    affectedRows:
                                        result.affectedRows
                                });
                            }
                        );
                    }
                );
            }
        );
    });
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    addVehicleImage,

    getVehicleImages,

    getVehicleImageById,

    updateVehicleImage,

    deleteVehicleImage,

    deleteVehicleImages,

    clearPrimaryImage,

    setPrimaryImage
};