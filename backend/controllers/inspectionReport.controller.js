const inspectionReportService =
    require(
        "../services/inspectionReport.service"
    );


const inspectionReportPdfService =
    require(
        "../services/inspectionReportPdf.service"
    );


const inspectionReportRepository =
    require(
        "../repositories/inspectionReport.repository"
    );


const vehicleRepository =
    require(
        "../repositories/vehicle.repository"
    );


// ======================================================
// VEHICLE IMAGE REPOSITORY
// ======================================================

const vehicleImageRepository =
    require(
        "../repositories/vehicleImage.repository"
    );


// ======================================================
// CREATE INSPECTION REPORT
// ======================================================

const createInspectionReport =
    async (
        req,
        res
    ) => {

        try {

            const {
                carId,
                overallScore,
                engineRemark,
                overallRemark,
                pdfPath,
                publishStatus
            } = req.body;


            const data =
                await inspectionReportService
                    .createInspectionReport({

                        carId,

                        overallScore,

                        engineRemark,

                        overallRemark,

                        pdfPath,

                        publishStatus

                    });


            return res.status(201).json({

                success:
                    true,

                message:
                    "Inspection Report Created Successfully",

                data

            });

        } catch (error) {

            console.error(
                "Create Inspection Report Error:",
                error
            );


            return res.status(400).json({

                success:
                    false,

                message:
                    error.message ||
                    "Unable to create inspection report"

            });

        }

    };


// ======================================================
// GET ALL INSPECTION REPORTS
// ======================================================

const getAllInspectionReports =
    async (
        req,
        res
    ) => {

        try {

            const data =
                await inspectionReportService
                    .getAllInspectionReports();


            return res.status(200).json({

                success:
                    true,

                message:
                    "Inspection Reports Fetched Successfully",

                data

            });

        } catch (error) {

            console.error(
                "Get Inspection Reports Error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    error.message ||
                    "Unable to fetch inspection reports"

            });

        }

    };


// ======================================================
// GET REPORT BY ID
// ======================================================

const getInspectionReportById =
    async (
        req,
        res
    ) => {

        try {

            const {
                reportId
            } = req.params;


            const data =
                await inspectionReportService
                    .getInspectionReportById(
                        reportId
                    );


            return res.status(200).json({

                success:
                    true,

                message:
                    "Inspection Report Fetched Successfully",

                data

            });

        } catch (error) {

            console.error(
                "Get Inspection Report Error:",
                error
            );


            return res.status(404).json({

                success:
                    false,

                message:
                    error.message ||
                    "Inspection report not found"

            });

        }

    };


// ======================================================
// UPDATE / PUBLISH REPORT
// ======================================================

const updateInspectionReport =
    async (
        req,
        res
    ) => {

        try {

            const {
                reportId
            } = req.params;


            const {
                overallScore,
                engineRemark,
                overallRemark,
                publishStatus
            } = req.body;


            const data =
                await inspectionReportService
                    .updateInspectionReport(

                        reportId,

                        {

                            overallScore,

                            engineRemark,

                            overallRemark,

                            publishStatus

                        }

                    );


            return res.status(200).json({

                success:
                    true,

                message:
                    "Inspection Report Updated Successfully",

                data

            });

        } catch (error) {

            console.error(
                "Update Inspection Report Error:",
                error
            );


            return res.status(400).json({

                success:
                    false,

                message:
                    error.message ||
                    "Unable to update inspection report"

            });

        }

    };


// ======================================================
// CUSTOMER - GET UNLOCKED REPORT
// ======================================================

const getUnlockedInspectionReport =
    async (
        req,
        res
    ) => {

        try {

            const {
                carId
            } = req.params;


            const {
                requestId
            } = req.query;


            if (!requestId) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "requestId is required."

                });

            }


            const data =
                await inspectionReportService
                    .getUnlockedInspectionReport(
                        carId,
                        requestId
                    );


            return res.status(200).json({

                success:
                    true,

                message:
                    "Inspection Report Fetched Successfully",

                data

            });

        } catch (error) {

            console.error(
                "Get Unlocked Report Error:",
                error
            );


            return res.status(403).json({

                success:
                    false,

                message:
                    error.message ||
                    "Unable to access inspection report"

            });

        }

    };


// ======================================================
// CUSTOMER - GENERATE PDF
// ======================================================

const generateInspectionReportPdf =
    async (
        req,
        res
    ) => {

        try {

            const {
                carId
            } = req.params;


            const {
                requestId
            } = req.query;


            if (!requestId) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "requestId is required."

                });

            }


            const numericCarId =
                Number(carId);


            if (
                !Number.isInteger(
                    numericCarId
                ) ||
                numericCarId <= 0
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Invalid vehicle ID."

                });

            }


            // ==================================================
            // GET UNLOCKED REPORT
            // ==================================================

            const data =
                await inspectionReportService
                    .getUnlockedInspectionReport(
                        numericCarId,
                        requestId
                    );


            // ==================================================
            // GET VEHICLE DATA
            // ==================================================

            const vehicleData =
                await vehicleRepository
                    .getVehicleById(
                        numericCarId
                    );


            if (!vehicleData) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "Vehicle data not found."

                });

            }


            // ==================================================
            // GET VEHICLE IMAGES
            // ==================================================

            let vehicleImages = [];

            try {

                vehicleImages =
                    await vehicleImageRepository
                        .getVehicleImages(
                            numericCarId
                        );

            } catch (imageError) {

                console.error(
                    "Vehicle Images Fetch Error:",
                    imageError
                );

                vehicleImages = [];

            }


            if (
                !Array.isArray(
                    vehicleImages
                )
            ) {

                vehicleImages = [];

            }


            console.log(
                "========================================"
            );

            console.log(
                "CUSTOMER PDF VEHICLE IMAGES"
            );

            console.log(
                "Vehicle ID:",
                numericCarId
            );

            console.log(
                "Image Count:",
                vehicleImages.length
            );


            vehicleImages.forEach(
                (
                    image,
                    index
                ) => {

                    console.log(
                        `Image ${index + 1}:`,
                        image
                    );

                }
            );


            console.log(
                "========================================"
            );


            // ==================================================
            // COMPLETE REPORT
            // ==================================================

            const completeReport = {

                ...data.report,

                vehicle:
                    vehicleData.vehicle,

                owner:
                    vehicleData.owner,

                inspection:
                    vehicleData.inspection,

                checklist:
                    vehicleData.checklist,

                images:
                    vehicleImages,

                vehicleImages:
                    vehicleImages

            };


            console.log(
                "Customer PDF Image Count:",
                completeReport.images.length
            );


            // ==================================================
            // GENERATE PDF
            // ==================================================

            const pdf =
                await inspectionReportPdfService
                    .generateInspectionReportPdf(
                        completeReport
                    );


            if (
                !pdf ||
                !pdf.pdfPath
            ) {

                throw new Error(
                    "Inspection PDF could not be generated."
                );

            }


            // ==================================================
            // SAVE PDF PATH
            // ==================================================

            await inspectionReportRepository
                .updateInspectionReportPdfPath(

                    completeReport.reportId,

                    pdf.pdfPath

                );


            // ==================================================
            // RESPONSE
            // ==================================================

            return res.status(200).json({

                success:
                    true,

                message:
                    "Inspection Report PDF Generated Successfully",

                data: {

                    reportId:
                        completeReport.reportId,

                    pdfPath:
                        pdf.pdfPath,

                    pdfUrl:
                        pdf.pdfUrl,

                    imageCount:
                        completeReport.images.length

                }

            });

        } catch (error) {

            console.error(
                "Generate Inspection Report PDF Error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    error.message ||
                    "Unable to generate inspection report PDF"

            });

        }

    };


// ======================================================
// ADMIN - GENERATE PDF
// ======================================================

const generateAdminInspectionReportPdf =
    async (
        req,
        res
    ) => {

        try {

            const {
                reportId
            } = req.params;


            const numericReportId =
                Number(reportId);


            if (
                !Number.isInteger(
                    numericReportId
                ) ||
                numericReportId <= 0
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Invalid report ID."

                });

            }


            // ==================================================
            // GET REPORT
            // ==================================================

            const report =
                await inspectionReportService
                    .getInspectionReportById(
                        numericReportId
                    );


            if (!report) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "Inspection report not found."

                });

            }


            // ==================================================
            // VEHICLE ID
            // ==================================================

            const numericCarId =
                Number(
                    report.carId ||
                    report.car_id
                );


            if (
                !Number.isInteger(
                    numericCarId
                ) ||
                numericCarId <= 0
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Invalid vehicle ID in inspection report."

                });

            }


            // ==================================================
            // GET VEHICLE DATA
            // ==================================================

            const vehicleData =
                await vehicleRepository
                    .getVehicleById(
                        numericCarId
                    );


            if (!vehicleData) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "Vehicle data not found."

                });

            }


            // ==================================================
            // GET VEHICLE IMAGES
            // ==================================================

            let vehicleImages = [];

            try {

                vehicleImages =
                    await vehicleImageRepository
                        .getVehicleImages(
                            numericCarId
                        );

            } catch (imageError) {

                console.error(
                    "Admin Vehicle Images Fetch Error:",
                    imageError
                );

                vehicleImages = [];

            }


            if (
                !Array.isArray(
                    vehicleImages
                )
            ) {

                vehicleImages = [];

            }


            console.log(
                "========================================"
            );

            console.log(
                "ADMIN PDF VEHICLE IMAGES"
            );

            console.log(
                "Vehicle ID:",
                numericCarId
            );

            console.log(
                "Report ID:",
                numericReportId
            );

            console.log(
                "Image Count:",
                vehicleImages.length
            );


            vehicleImages.forEach(
                (
                    image,
                    index
                ) => {

                    console.log(
                        `Image ${index + 1}:`,
                        image
                    );

                }
            );


            console.log(
                "========================================"
            );


            // ==================================================
            // COMPLETE REPORT
            // ==================================================

            const completeReport = {

                ...report,

                vehicle:
                    vehicleData.vehicle,

                owner:
                    vehicleData.owner,

                inspection:
                    vehicleData.inspection,

                checklist:
                    vehicleData.checklist,

                images:
                    vehicleImages,

                vehicleImages:
                    vehicleImages

            };


            console.log(
                "Admin PDF Image Count:",
                completeReport.images.length
            );


            // ==================================================
            // GENERATE PDF
            // ==================================================

            const pdf =
                await inspectionReportPdfService
                    .generateInspectionReportPdf(
                        completeReport
                    );


            if (
                !pdf ||
                !pdf.pdfPath
            ) {

                throw new Error(
                    "Inspection PDF could not be generated."
                );

            }


            // ==================================================
            // SAVE PDF PATH
            // ==================================================

            await inspectionReportRepository
                .updateInspectionReportPdfPath(

                    numericReportId,

                    pdf.pdfPath

                );


            // ==================================================
            // RESPONSE
            // ==================================================

            return res.status(200).json({

                success:
                    true,

                message:
                    "Inspection Report PDF Generated Successfully",

                data: {

                    reportId:
                        numericReportId,

                    pdfPath:
                        pdf.pdfPath,

                    pdfUrl:
                        pdf.pdfUrl,

                    imageCount:
                        completeReport.images.length

                }

            });

        } catch (error) {

            console.error(
                "Admin Generate PDF Error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    error.message ||
                    "Unable to generate inspection report PDF"

            });

        }

    };


// ======================================================
// SEND REPORT TO CUSTOMER EMAIL
// ======================================================

const sendInspectionReportEmail =
    async (
        req,
        res
    ) => {

        try {

            const {
                reportId
            } = req.params;


            const {
                customerEmail
            } = req.body;


            if (
                !customerEmail ||
                !String(
                    customerEmail
                ).trim()
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Customer email is required."

                });

            }


            const data =
                await inspectionReportService
                    .sendReportToCustomerEmail(

                        reportId,

                        customerEmail

                    );


            return res.status(200).json({

                success:
                    true,

                message:
                    "Inspection report sent to customer email successfully.",

                data

            });

        } catch (error) {

            console.error(
                "Send Inspection Report Email Error:",
                error
            );


            return res.status(400).json({

                success:
                    false,

                message:
                    error.message ||
                    "Unable to send inspection report email."

            });

        }

    };


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    createInspectionReport,

    getAllInspectionReports,

    getInspectionReportById,

    updateInspectionReport,

    getUnlockedInspectionReport,

    generateInspectionReportPdf,

    generateAdminInspectionReportPdf,

    sendInspectionReportEmail

};