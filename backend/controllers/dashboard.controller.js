const dashboardService = require(
    "../services/dashboard.service"
);


// ======================================================
// GET ADMIN DASHBOARD
// ======================================================

const getAdminDashboard = async (
    req,
    res
) => {

    try {

        // ==============================================
        // GET DASHBOARD DATA
        // ==============================================

        const dashboard =
            await dashboardService
                .getAdminDashboard();


        // ==============================================
        // SUCCESS RESPONSE
        // ==============================================

        return res.status(200).json({

            success: true,

            message:
                "Dashboard Data Retrieved Successfully",

            data: {

                dashboard

            }

        });

    } catch (error) {

        // ==============================================
        // LOG ERROR
        // ==============================================

        console.error(
            "Get Admin Dashboard Error:",
            error
        );


        // ==============================================
        // ERROR RESPONSE
        // ==============================================

        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to retrieve dashboard data."

        });

    }

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    getAdminDashboard

};