const express = require("express");

const shareYourExperienceController =
    require(
        "../controllers/shareYourExperience.controller"
    );

const shareYourExperienceUpload =
    require(
        "../middlewares/shareYourExperienceUpload.middleware"
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
// EXPORT
// ======================================================

module.exports = router;