const db =
    require("../config/db");



// ======================================================
// ADD VEHICLE IMAGE
// ======================================================

const addVehicleImage = (
    carId,
    imageType,
    imagePath,
    isPrimary
) => {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            // --------------------------------------------------
            // If this image is primary, remove primary from
            // existing images of the same vehicle first.
            // --------------------------------------------------

            const insertImage = () => {

                const sql = `
                    INSERT INTO car_images (
                        car_id,
                        image_type,
                        image_path,
                        is_primary
                    )
                    VALUES (
                        ?,
                        ?,
                        ?,
                        ?
                    )
                `;

                db.query(
                    sql,
                    [
                        carId,
                        imageType,
                        imagePath,
                        isPrimary ? 1 : 0
                    ],
                    (
                        error,
                        result
                    ) => {

                        if (error) {

                            return reject(
                                error
                            );

                        }

                        resolve(
                            result.insertId
                        );

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
                    [
                        carId
                    ],
                    (
                        error
                    ) => {

                        if (error) {

                            return reject(
                                error
                            );

                        }

                        insertImage();

                    }
                );

            } else {

                insertImage();

            }

        }
    );

};



// ======================================================
// GET VEHICLE IMAGES
// ======================================================

const getVehicleImages = (
    carId
) => {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const sql = `
                SELECT
                    image_id,
                    car_id,
                    image_type,
                    image_path,
                    is_primary,
                    created_at
                FROM car_images
                WHERE car_id = ?
                ORDER BY
                    is_primary DESC,
                    image_id ASC
            `;

            db.query(
                sql,
                [
                    carId
                ],
                (
                    error,
                    images
                ) => {

                    if (error) {

                        return reject(
                            error
                        );

                    }

                    resolve(
                        images
                    );

                }
            );

        }
    );

};



// ======================================================
// GET SINGLE VEHICLE IMAGE
// ======================================================

const getVehicleImageById = (
    imageId,
    carId
) => {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const sql = `
                SELECT
                    image_id,
                    car_id,
                    image_type,
                    image_path,
                    is_primary,
                    created_at
                FROM car_images
                WHERE image_id = ?
                  AND car_id = ?
                LIMIT 1
            `;

            db.query(
                sql,
                [
                    imageId,
                    carId
                ],
                (
                    error,
                    rows
                ) => {

                    if (error) {

                        return reject(
                            error
                        );

                    }

                    resolve(
                        rows.length
                            ? rows[0]
                            : null
                    );

                }
            );

        }
    );

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

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const updateImage = () => {

                const sql = `
                    UPDATE car_images
                    SET
                        image_type = ?,
                        image_path = ?,
                        is_primary = ?
                    WHERE
                        image_id = ?
                        AND car_id = ?
                `;

                db.query(
                    sql,
                    [
                        imageType,
                        imagePath,
                        isPrimary ? 1 : 0,
                        imageId,
                        carId
                    ],
                    (
                        error,
                        result
                    ) => {

                        if (error) {

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

            };


            // --------------------------------------------------
            // Only one primary image should exist for a car.
            // --------------------------------------------------

            if (isPrimary) {

                const clearSql = `
                    UPDATE car_images
                    SET is_primary = 0
                    WHERE car_id = ?
                      AND image_id <> ?
                `;

                db.query(
                    clearSql,
                    [
                        carId,
                        imageId
                    ],
                    (
                        error
                    ) => {

                        if (error) {

                            return reject(
                                error
                            );

                        }

                        updateImage();

                    }
                );

            } else {

                updateImage();

            }

        }
    );

};



// ======================================================
// DELETE VEHICLE IMAGE
// ======================================================

const deleteVehicleImage = (
    imageId,
    carId
) => {

    return new Promise(
        (
            resolve,
            reject
        ) => {

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
                (
                    error,
                    result
                ) => {

                    if (error) {

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

};



// ======================================================
// DELETE ALL VEHICLE IMAGES
// ======================================================

const deleteVehicleImages = (
    carId
) => {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const sql = `
                DELETE FROM car_images
                WHERE car_id = ?
            `;

            db.query(
                sql,
                [
                    carId
                ],
                (
                    error,
                    result
                ) => {

                    if (error) {

                        return reject(
                            error
                        );

                    }

                    resolve({
                        carId,
                        affectedRows:
                            result.affectedRows
                    });

                }
            );

        }
    );

};



// ======================================================
// REMOVE PRIMARY STATUS FROM ALL IMAGES
// ======================================================

const clearPrimaryImage = (
    carId
) => {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const sql = `
                UPDATE car_images
                SET is_primary = 0
                WHERE car_id = ?
            `;

            db.query(
                sql,
                [
                    carId
                ],
                (
                    error,
                    result
                ) => {

                    if (error) {

                        return reject(
                            error
                        );

                    }

                    resolve(
                        result.affectedRows
                    );

                }
            );

        }
    );

};



// ======================================================
// SET PRIMARY IMAGE
// ======================================================

const setPrimaryImage = (
    imageId,
    carId
) => {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const setPrimary = () => {

                const sql = `
                    UPDATE car_images
                    SET is_primary = 1
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
                    (
                        error,
                        result
                    ) => {

                        if (error) {

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

            };


            const clearSql = `
                UPDATE car_images
                SET is_primary = 0
                WHERE car_id = ?
            `;

            db.query(
                clearSql,
                [
                    carId
                ],
                (
                    error
                ) => {

                    if (error) {

                        return reject(
                            error
                        );

                    }

                    setPrimary();

                }
            );

        }
    );

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