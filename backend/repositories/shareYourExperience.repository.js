// ======================================================
// SHARE YOUR EXPERIENCE REPOSITORY
// ======================================================

const db = require("../config/db");

// ======================================================
// CREATE REVIEW
// ======================================================

const createReview = async (reviewData) => {

    const {
        name,
        mobile,
        rating,
        review,
        photo
    } = reviewData;

    const sql = `
        INSERT INTO share_you_exp
        (
            name,
            mobile,
            rating,
            review,
            photo,
            status
        )
        VALUES (?, ?, ?, ?, ?, 'Pending')
    `;

    const values = [
        name,
        mobile,
        rating,
        review,
        photo
    ];

    const [result] = await db
        .promise()
        .execute(
            sql,
            values
        );

    return result.insertId;
};

// ======================================================
// GET REVIEWS
// ======================================================

const getReviews = async (status = null) => {

    let sql = `
        SELECT
            id,
            name,
            mobile,
            rating,
            review,
            photo,
            status,
            created_at,
            updated_at
        FROM share_you_exp
    `;

    const values = [];

    // --------------------------------------------------
    // STATUS FILTER
    // --------------------------------------------------

    if (status) {

        sql += `
            WHERE status = ?
        `;

        values.push(status);
    }

    // --------------------------------------------------
    // LATEST FIRST
    // --------------------------------------------------

    sql += `
        ORDER BY created_at DESC
    `;

    const [rows] = await db
        .promise()
        .execute(
            sql,
            values
        );

    return rows;
};

// ======================================================
// GET SINGLE REVIEW
// ======================================================

const getReviewById = async (id) => {

    const sql = `
        SELECT
            id,
            name,
            mobile,
            rating,
            review,
            photo,
            status,
            created_at,
            updated_at
        FROM share_you_exp
        WHERE id = ?
        LIMIT 1
    `;

    const values = [id];

    const [rows] = await db
        .promise()
        .execute(
            sql,
            values
        );

    return rows.length > 0
        ? rows[0]
        : null;
};

// ======================================================
// UPDATE REVIEW STATUS
// ======================================================

const updateReviewStatus = async (
    id,
    status
) => {

    const sql = `
        UPDATE share_you_exp
        SET
            status = ?
        WHERE id = ?
    `;

    const values = [
        status,
        id
    ];

    const [result] = await db
        .promise()
        .execute(
            sql,
            values
        );

    return result.affectedRows;
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
    createReview,
    getReviews,
    getReviewById,
    updateReviewStatus
};