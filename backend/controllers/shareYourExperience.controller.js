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

const createReview = async (req, res) => {

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
// EXPORT
// ======================================================

module.exports = {

    createReview

};