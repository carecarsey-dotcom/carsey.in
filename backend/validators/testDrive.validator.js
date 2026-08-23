// ======================================================
// TEST DRIVE VALIDATION
// ======================================================

const validateTestDriveRequest = (
    req,
    res,
    next
) => {

    const {

        name,

        mobile,

        email,

        city,

        preferredDate,

        preferredTime

    } = req.body;


    // ==================================================
    // NAME
    // ONLY LETTERS + SPACE
    // ==================================================

    if (
        !name ||
        typeof name !== "string" ||
        !name.trim()
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Name is required."

        });

    }


    if (
        !/^[A-Za-z ]+$/.test(
            name.trim()
        )
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Name must contain only letters."

        });

    }


    if (
        name.trim().length < 2
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Name must contain at least 2 characters."

        });

    }


    // ==================================================
    // MOBILE
    // EXACTLY 10 DIGITS
    // ==================================================

    if (
        !mobile ||
        !/^[0-9]{10}$/.test(
            String(mobile).trim()
        )
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Mobile number must contain exactly 10 digits."

        });

    }


    // ==================================================
    // EMAIL
    // ==================================================

    if (
        !email ||
        typeof email !== "string" ||
        !email.trim()
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Email is required."

        });

    }


    if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            email.trim()
        )
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Please provide a valid email address."

        });

    }


    // ==================================================
    // CITY
    // ==================================================

    if (
        !city ||
        typeof city !== "string" ||
        !city.trim()
    ) {

        return res.status(400).json({

            success: false,

            message:
                "City is required."

        });

    }


    if (
        !/^[A-Za-z ]+$/.test(
            city.trim()
        )
    ) {

        return res.status(400).json({

            success: false,

            message:
                "City must contain only letters."

        });

    }


    // ==================================================
    // PREFERRED DATE
    // ==================================================

    if (!preferredDate) {

        return res.status(400).json({

            success: false,

            message:
                "Preferred date is required."

        });

    }


    // ==================================================
    // DATE FORMAT
    // ==================================================

    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(
            preferredDate
        )
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Preferred date must be in YYYY-MM-DD format."

        });

    }


    // ==================================================
    // CHECK DATE
    // ==================================================

    const selectedDate =
        new Date(
            `${preferredDate}T00:00:00`
        );


    if (
        Number.isNaN(
            selectedDate.getTime()
        )
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Invalid preferred date."

        });

    }


    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    if (
        selectedDate < today
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Preferred date cannot be in the past."

        });

    }


    // ==================================================
    // PREFERRED TIME
    // ==================================================

    if (
        !preferredTime ||
        typeof preferredTime !== "string" ||
        !preferredTime.trim()
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Preferred time is required."

        });

    }


    // ==================================================
    // SUCCESS
    // ==================================================

    next();

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    validateTestDriveRequest

};