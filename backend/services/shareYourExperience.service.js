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

    const reviewId =
        await shareYourExperienceRepository.createReview(
            data
        );

    return reviewId;
};

// ======================================================
// GET REVIEWS
// ADMIN
// ======================================================

const getReviews = async (status = null) => {

    const allowedStatuses = [
        "Pending",
        "Approved",
        "Rejected"
    ];

    if (
        status &&
        !allowedStatuses.includes(status)
    ) {
        throw new Error(
            "Invalid review status."
        );
    }

    return await shareYourExperienceRepository.getReviews(
        status
    );
};

// ======================================================
// GET SINGLE REVIEW
// ADMIN
// ======================================================

const getReviewById = async (id) => {

    const reviewId =
        Number(id);

    if (
        !Number.isInteger(reviewId) ||
        reviewId <= 0
    ) {
        throw new Error(
            "Invalid review ID."
        );
    }

    const review =
        await shareYourExperienceRepository.getReviewById(
            reviewId
        );

    if (!review) {
        throw new Error(
            "Review not found."
        );
    }

    return review;
};

// ======================================================
// UPDATE REVIEW STATUS
// ADMIN
// ======================================================

const updateReviewStatus = async (
    id,
    status
) => {

    const reviewId =
        Number(id);

    if (
        !Number.isInteger(reviewId) ||
        reviewId <= 0
    ) {
        throw new Error(
            "Invalid review ID."
        );
    }

    const allowedStatuses = [
        "Approved",
        "Rejected"
    ];

    if (
        !allowedStatuses.includes(status)
    ) {
        throw new Error(
            "Status must be Approved or Rejected."
        );
    }

    // --------------------------------------------------
    // CHECK REVIEW EXISTS
    // --------------------------------------------------

    const existingReview =
        await shareYourExperienceRepository.getReviewById(
            reviewId
        );

    if (!existingReview) {
        throw new Error(
            "Review not found."
        );
    }

    // --------------------------------------------------
    // UPDATE STATUS
    // --------------------------------------------------

    await shareYourExperienceRepository.updateReviewStatus(
        reviewId,
        status
    );

    return await shareYourExperienceRepository.getReviewById(
        reviewId
    );
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