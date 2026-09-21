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


    const [result] = await db.execute(
        sql,
        values
    );


    return result.insertId;
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
    createReview
};