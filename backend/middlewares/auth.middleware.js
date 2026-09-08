const jwt = require("jsonwebtoken");


// ======================================================
// VERIFY TOKEN
// ======================================================

const verifyToken = (req, res, next) => {

    try {

        // Authorization Header
        const authHeader = req.headers.authorization;


        // Check token exists
        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Access Denied. Token Missing."

            });

        }


        // Extract Token
        const token =
            authHeader.split(" ")[1];


        // Verify Token
        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        // Save admin / employee data
        req.admin = decoded;


        // Next Middleware
        next();

    } catch (error) {

        return res.status(401).json({

            success: false,

            message:
                "Invalid or Expired Token"

        });

    }

};


// ======================================================
// ADMIN ONLY
// ======================================================

const requireAdmin = (
    req,
    res,
    next
) => {

    if (
        !req.admin ||
        req.admin.role !== "Admin"
    ) {

        return res.status(403).json({

            success: false,

            message:
                "Access Denied. Admin access required."

        });

    }


    next();

};


// ======================================================
// EMPLOYEE ONLY
// ======================================================

const requireEmployee = (
    req,
    res,
    next
) => {

    if (
        !req.admin ||
        req.admin.role !== "Employee"
    ) {

        return res.status(403).json({

            success: false,

            message:
                "Access Denied. Employee access required."

        });

    }


    next();

};


// ======================================================
// ADMIN OR EMPLOYEE
// ======================================================

const requireAdminOrEmployee = (
    req,
    res,
    next
) => {

    if (
        !req.admin ||
        (
            req.admin.role !== "Admin" &&
            req.admin.role !== "Employee"
        )
    ) {

        return res.status(403).json({

            success: false,

            message:
                "Access Denied."

        });

    }


    next();

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    verifyToken,

    requireAdmin,

    requireEmployee,

    requireAdminOrEmployee

};