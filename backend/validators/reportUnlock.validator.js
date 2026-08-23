const {
    body,
    param,
    validationResult
} = require("express-validator");


// ======================================================
// REPORT UNLOCK VALIDATION RULES
// ======================================================

const reportUnlockValidation = [

    // --------------------------------------------------
    // CAR ID
    // --------------------------------------------------

    param("carId")
        .isInt({ min: 1 })
        .withMessage(
            "Valid vehicle ID is required."
        ),


    // --------------------------------------------------
    // NAME
    // --------------------------------------------------

    body("name")
        .trim()
        .notEmpty()
        .withMessage(
            "Name is required."
        )
        .isLength({
            min: 2,
            max: 100
        })
        .withMessage(
            "Name must be between 2 and 100 characters."
        ),


    // --------------------------------------------------
    // MOBILE
    // --------------------------------------------------

    body("mobile")
        .trim()
        .notEmpty()
        .withMessage(
            "Mobile number is required."
        )
        .matches(
            /^[0-9]{10}$/
        )
        .withMessage(
            "Mobile number must contain exactly 10 digits."
        ),


    // --------------------------------------------------
    // EMAIL
    // --------------------------------------------------

    body("email")
        .trim()
        .notEmpty()
        .withMessage(
            "Email is required."
        )
        .isEmail()
        .withMessage(
            "Please enter a valid email address."
        )
        .isLength({
            max: 100
        })
        .withMessage(
            "Email cannot exceed 100 characters."
        )
        .normalizeEmail()

];


// ======================================================
// VALIDATION RESULT HANDLER
// ======================================================

const validateReportUnlock = (
    req,
    res,
    next
) => {

    const errors =
        validationResult(req);


    if (!errors.isEmpty()) {

        return res.status(400).json({

            success: false,

            message:
                "Validation failed.",

            errors:
                errors.array().map(
                    (error) => ({

                        field:
                            error.path,

                        message:
                            error.msg

                    })
                )

        });

    }


    next();

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    reportUnlockValidation,

    validateReportUnlock

};