const express = require("express");

const shareYourExperienceController =
    require(
        "../controllers/shareYourExperience.controller"
    );

const shareYourExperienceUpload =
    require(
        "../middlewares/shareYourExperienceUpload.middleware"
    );

const {
    verifyToken,
    requireAdmin
} = require(
    "../middlewares/auth.middleware"
);

const router = express.Router();


// ======================================================
// SHARE YOUR EXPERIENCE
// CUSTOMER
// PUBLIC
// ======================================================

// ------------------------------------------------------
// POST REVIEW
//
// POST
// /api/share-your-experience
//
// Photo is OPTIONAL
// ------------------------------------------------------

router.post(
    "/share-your-experience",
    shareYourExperienceUpload.single("photo"),
    shareYourExperienceController.createReview
);


// ======================================================
// SHARE YOUR EXPERIENCE
// ADMIN
// ======================================================

// ------------------------------------------------------
// GET ALL REVIEWS
//
// GET
// /api/admin/share-your-experience
//
// Optional:
//
// ?status=Pending
// ?status=Approved
// ?status=Rejected
// ------------------------------------------------------

router.get(
    "/admin/share-your-experience",
    verifyToken,
    requireAdmin,
    shareYourExperienceController.getReviews
);


// ------------------------------------------------------
// GET SINGLE REVIEW
//
// GET
// /api/admin/share-your-experience/:id
// ------------------------------------------------------

router.get(
    "/admin/share-your-experience/:id",
    verifyToken,
    requireAdmin,
    shareYourExperienceController.getReviewById
);


// ------------------------------------------------------
// UPDATE REVIEW STATUS
//
// PATCH
// /api/admin/share-your-experience/:id/status
//
// Body:
//
// {
//     "status": "Approved"
// }
//
// OR
//
// {
//     "status": "Rejected"
// }
// ------------------------------------------------------

router.patch(
    "/admin/share-your-experience/:id/status",
    verifyToken,
    requireAdmin,
    shareYourExperienceController.updateReviewStatus
);


// ======================================================
// EXPORT
// ======================================================

module.exports = router;