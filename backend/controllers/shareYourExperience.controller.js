// ======================================================
// SHARE YOUR EXPERIENCE CONTROLLER
// ======================================================

const shareYourExperienceService =
    require(
        "../services/shareYourExperience.service"
    );

// ======================================================
// CREATE REVIEW
// PUBLIC
// ======================================================

const createReview = async (
    req,
    res
) => {

    try {

        const reviewData = {

            name:
                req.body.name,

            mobile:
                req.body.mobile,

            rating:
                req.body.rating,

            review:
                req.body.review,

            photo:
                req.file
                    ? req.file.filename
                    : null
        };

        const reviewId =
            await shareYourExperienceService.createReview(
                reviewData
            );

        return res.status(201).json({

            success: true,

            message:
                "Thank you for your review. It has been submitted for approval.",

            data: {
                reviewId
            }

        });

    } catch (error) {

        console.error(
            "Create Share Your Experience Error:",
            error
        );

        return res.status(400).json({

            success: false,

            message:
                error.message

        });
    }
};

// ======================================================
// GET REVIEWS
// ADMIN
// ======================================================

const getReviews = async (
    req,
    res
) => {

    try {

        const status =
            req.query.status || null;

        const reviews =
            await shareYourExperienceService.getReviews(
                status
            );

        return res.status(200).json({

            success: true,

            data: reviews

        });

    } catch (error) {

        console.error(
            "Get Share Your Experience Reviews Error:",
            error
        );

        return res.status(400).json({

            success: false,

            message:
                error.message

        });
    }
};

// ======================================================
// GET SINGLE REVIEW
// ADMIN
// ======================================================

const getReviewById = async (
    req,
    res
) => {

    try {

        const review =
            await shareYourExperienceService.getReviewById(
                req.params.id
            );

        return res.status(200).json({

            success: true,

            data: review

        });

    } catch (error) {

        console.error(
            "Get Share Your Experience Review Error:",
            error
        );

        return res.status(404).json({

            success: false,

            message:
                error.message

        });
    }
};

// ======================================================
// UPDATE REVIEW STATUS
// ADMIN
// ======================================================

const updateReviewStatus = async (
    req,
    res
) => {

    try {

        const {
            status
        } = req.body;

        const review =
            await shareYourExperienceService.updateReviewStatus(
                req.params.id,
                status
            );

        return res.status(200).json({

            success: true,

            message:
                `Review ${status.toLowerCase()} successfully.`,

            data: review

        });

    } catch (error) {

        console.error(
            "Update Share Your Experience Status Error:",
            error
        );

        return res.status(400).json({

            success: false,

            message:
                error.message

        });
    }
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