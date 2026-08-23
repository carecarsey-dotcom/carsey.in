const dashboardRepository = require(
    "../repositories/dashboard.repository"
);


// ======================================================
// GET ADMIN DASHBOARD
// ======================================================

const getAdminDashboard = async () => {

    // ==================================================
    // GET DASHBOARD COUNTS
    // ==================================================

    const [
        activeListings,
        soldCars,
        unlockRequests,
        testDriveRequests,
        financeRequests,
        sellCarRequests,
        exchangeRequests,
        loanRequests,
        inspectionBookings
    ] = await Promise.all([

        dashboardRepository
            .getActiveListings(),

        dashboardRepository
            .getSoldCars(),

        dashboardRepository
            .getUnlockRequests(),

        dashboardRepository
            .getTestDriveRequests(),

        dashboardRepository
            .getFinanceRequests(),

        dashboardRepository
            .getSellCarRequests(),

        dashboardRepository
            .getExchangeRequests(),

        dashboardRepository
            .getLoanRequests(),

        dashboardRepository
            .getInspectionBookings()

    ]);


    // ==================================================
    // RETURN DASHBOARD DATA
    // ==================================================

    return {

        activeListings,

        soldCars,

        unlockRequests,

        testDriveRequests,

        financeRequests,

        sellCarRequests,

        exchangeRequests,

        loanRequests,

        inspectionBookings

    };

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    getAdminDashboard

};