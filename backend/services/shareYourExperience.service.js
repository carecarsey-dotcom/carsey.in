// ======================================================
// SHARE YOUR EXPERIENCE SERVICE
// ======================================================

const shareYourExperienceRepository =
    require(
        "../repositories/shareYourExperience.repository"
    );


// ======================================================
// CREATE REVIEW
// ======================================================

const createReview = async (reviewData) => {

    // ==================================================
    // VALIDATION
    // ==================================================

    if (
        !reviewData.name ||
        !reviewData.name.trim()
    ) {
        throw new Error(
            "Name is required."
        );
    }


    if (
        reviewData.name.trim().length < 2
    ) {
        throw new Error(
            "Please enter a valid name."
        );
    }


    if (!reviewData.rating) {
        throw new Error(
            "Rating is required."
        );
    }


    const rating =
        Number(
            reviewData.rating
        );


    if (
        !Number.isInteger(rating) ||
        rating < 1 ||
        rating > 5
    ) {
        throw new Error(
            "Rating must be between 1 and 5."
        );
    }


    if (
        !reviewData.review ||
        !reviewData.review.trim()
    ) {
        throw new Error(
            "Review is required."
        );
    }


    // ==================================================
    // MOBILE VALIDATION
    // OPTIONAL
    // ==================================================

    if (
        reviewData.mobile &&
        !/^[0-9]{10}$/.test(
            String(
                reviewData.mobile
            ).trim()
        )
    ) {
        throw new Error(
            "Please enter a valid 10 digit mobile number."
        );
    }


    // ==================================================
    // PREPARE DATA
    // ==================================================

    const data = {

        name:
            reviewData.name.trim(),

        mobile:
            reviewData.mobile
                ? String(
                    reviewData.mobile
                ).trim()
                : null,

        rating,

        review:
            reviewData.review.trim(),

        photo:
            reviewData.photo || null

    };


    // ==================================================
    // SAVE REVIEW
    // ==================================================

    const reviewId =
        await shareYourExperienceRepository.createReview(
            data
        );


    return reviewId;

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    createReview

};