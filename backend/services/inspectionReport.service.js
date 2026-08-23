const inspectionReportRepository =
    require("../repositories/inspectionReport.repository");

const inspectionReportPdfService =
    require("./inspectionReportPdf.service");

const emailService =
    require("./email.service");

const env =
    require("../config/env");

const path =
    require("path");

const fs =
    require("fs");


// ======================================================
// VEHICLE REPOSITORY
// ======================================================

const vehicleRepository =
    require("../repositories/vehicle.repository");


// ======================================================
// NORMALIZE OVERALL SCORE
// ======================================================
//
// Final application score:
// 0 - 10
//
// Old records:
// 43  -> 4.3
// 92  -> 9.2
// 95  -> 9.5
//
// New records:
// 4.3 -> 4.3
// 9.2 -> 9.2
// 10  -> 10
// ======================================================

const normalizeOverallScore = (value) => {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        throw new Error(
            "Overall score is required."
        );
    }

    const rawScore =
        Number(value);

    if (
        !Number.isFinite(rawScore)
    ) {
        throw new Error(
            "Overall score must be a valid number."
        );
    }

    let score =
        rawScore > 10
            ? rawScore / 10
            : rawScore;

    score =
        Number(
            score.toFixed(1)
        );

    if (
        score < 0 ||
        score > 10
    ) {
        throw new Error(
            "Overall score must be between 0 and 10."
        );
    }

    return score;
};


// ======================================================
// SAFE VALUE
// ======================================================

const safeValue = (
    value,
    fallback = "-"
) => {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return fallback;
    }

    return value;
};


// ======================================================
// PARSE JSON SAFELY
// ======================================================

const parseJsonSafely = (
    value,
    fallback = {}
) => {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return fallback;
    }

    if (
        typeof value === "object"
    ) {
        return value;
    }

    if (
        typeof value === "string"
    ) {

        try {

            return JSON.parse(value);

        } catch (error) {

            return fallback;

        }

    }

    return fallback;
};


// ======================================================
// NORMALIZE VEHICLE DATA
// ======================================================

const normalizeVehicleData = (
    vehicleData
) => {

    if (
        !vehicleData
    ) {
        return {};
    }

    const vehicle =
        vehicleData.vehicle &&
        typeof vehicleData.vehicle === "object"
            ? vehicleData.vehicle
            : {};

    const owner =
        vehicleData.owner &&
        typeof vehicleData.owner === "object"
            ? vehicleData.owner
            : {};

    const inspection =
        vehicleData.inspection &&
        typeof vehicleData.inspection === "object"
            ? vehicleData.inspection
            : {};

    const checklist =
        vehicleData.checklist &&
        typeof vehicleData.checklist === "object"
            ? vehicleData.checklist
            : {};

    return {

        vehicle: {
            ...vehicleData,
            ...vehicle
        },

        owner: {
            ...owner
        },

        inspection: {
            ...inspection
        },

        checklist: {
            ...checklist
        }

    };

};


// ======================================================
// BUILD COMPLETE REPORT
// ======================================================
//
// PDF service ko complete data milega:
// report
// vehicle
// owner
// inspection
// checklist
// ======================================================

const buildCompleteReport = (
    report,
    vehicleData
) => {

    const normalizedVehicle =
        normalizeVehicleData(
            vehicleData
        );

    const vehicle =
        normalizedVehicle.vehicle || {};

    const owner =
        normalizedVehicle.owner || {};

    const inspection =
        normalizedVehicle.inspection || {};

    const checklist =
        normalizedVehicle.checklist || {};


    const reportScore =
        normalizeOverallScore(
            report.overallScore ??
            report.overall_score ??
            0
        );


    return {

        // ==================================================
        // REPORT
        // ==================================================

        reportId:
            report.reportId ??
            report.report_id,

        carId:
            report.carId ??
            report.car_id,

        overallScore:
            reportScore,

        engineRemark:
            report.engineRemark ??
            report.engine_remark ??
            "Not provided.",

        overallRemark:
            report.overallRemark ??
            report.overall_remark ??
            "Vehicle inspection completed.",

        pdfPath:
            report.pdfPath ??
            report.pdf_path ??
            null,

        publishStatus:
            report.publishStatus ??
            report.publish_status ??
            "No",

        createdAt:
            report.createdAt ??
            report.created_at ??
            null,


        // ==================================================
        // COMPLETE VEHICLE
        // ==================================================

        vehicle: {
            ...vehicle
        },


        // ==================================================
        // OWNER
        // ==================================================

        owner: {
            ...owner
        },


        // ==================================================
        // INSPECTION
        // ==================================================

        inspection: {
            ...inspection
        },


        // ==================================================
        // CHECKLIST
        // ==================================================

        checklist: {
            ...checklist
        },


        // ==================================================
        // FLATTENED DATA
        // ==================================================
        // PDF service agar direct properties read kare
        // to bhi data available rahega.
        // ==================================================

        ...vehicle,

        ...owner,

        ...inspection

    };

};


// ======================================================
// CREATE INSPECTION REPORT
// ======================================================

const createInspectionReport = async (
    reportData
) => {

    // ==================================================
    // CAR ID
    // ==================================================

    const carId =
        Number(
            reportData.carId
        );


    if (
        !Number.isInteger(carId) ||
        carId <= 0
    ) {

        throw new Error(
            "Invalid car ID."
        );

    }


    // ==================================================
    // SCORE
    // ==================================================

    const overallScore =
        normalizeOverallScore(
            reportData.overallScore
        );


    // ==================================================
    // ENGINE REMARK
    // ==================================================

    if (
        !reportData.engineRemark ||
        !String(
            reportData.engineRemark
        ).trim()
    ) {

        throw new Error(
            "Engine remark is required."
        );

    }


    // ==================================================
    // OVERALL REMARK
    // ==================================================

    if (
        !reportData.overallRemark ||
        !String(
            reportData.overallRemark
        ).trim()
    ) {

        throw new Error(
            "Overall remark is required."
        );

    }


    // ==================================================
    // PUBLISH STATUS
    // ==================================================

    const publishStatus =
        reportData.publishStatus === "Yes"
            ? "Yes"
            : "No";


    // ==================================================
    // CREATE DATABASE REPORT
    // ==================================================
    //
    // IMPORTANT:
    // overallScore yahan already 0-10 hai.
    //
    // Example:
    // 43 -> 4.3
    // ==================================================

    const result =
        await inspectionReportRepository
            .createInspectionReport({

                carId,

                overallScore,

                engineRemark:
                    String(
                        reportData.engineRemark
                    ).trim(),

                overallRemark:
                    String(
                        reportData.overallRemark
                    ).trim(),

                pdfPath:
                    reportData.pdfPath ||
                    null,

                publishStatus

            });


    return {

        reportId:
            result.reportId,

        message:
            "Inspection report created successfully."

    };

};


// ======================================================
// GET UNLOCKED INSPECTION REPORT
// CUSTOMER
// ======================================================

const getUnlockedInspectionReport =
    async (
        carId,
        requestId
    ) => {

        const numericCarId =
            Number(carId);

        const numericRequestId =
            Number(requestId);


        // ==================================================
        // VALIDATE CAR ID
        // ==================================================

        if (
            !Number.isInteger(
                numericCarId
            ) ||
            numericCarId <= 0
        ) {

            throw new Error(
                "Invalid car ID."
            );

        }


        // ==================================================
        // VALIDATE REQUEST ID
        // ==================================================

        if (
            !Number.isInteger(
                numericRequestId
            ) ||
            numericRequestId <= 0
        ) {

            throw new Error(
                "Invalid unlock request ID."
            );

        }


        // ==================================================
        // CHECK APPROVED REQUEST
        // ==================================================

        const unlockRequest =
            await inspectionReportRepository
                .getApprovedUnlockRequest(
                    numericRequestId,
                    numericCarId
                );


        if (
            !unlockRequest
        ) {

            throw new Error(
                "Report unlock request is not approved."
            );

        }


        // ==================================================
        // GET PUBLISHED REPORT
        // ==================================================

        const report =
            await inspectionReportRepository
                .getInspectionReportByCarId(
                    numericCarId
                );


        if (
            !report
        ) {

            throw new Error(
                "Inspection report is not available."
            );

        }


        // ==================================================
        // NORMALIZE SCORE FOR RESPONSE
        // ==================================================

        const overallScore =
            normalizeOverallScore(
                report.overall_score
            );


        // ==================================================
        // RETURN
        // ==================================================

        return {

            request: {

                requestId:
                    unlockRequest.request_id,

                carId:
                    unlockRequest.car_id,

                status:
                    unlockRequest.status

            },


            report: {

                reportId:
                    report.report_id,

                carId:
                    report.car_id,

                overallScore,

                engineRemark:
                    report.engine_remark,

                overallRemark:
                    report.overall_remark,

                pdfPath:
                    report.pdf_path,

                publishStatus:
                    report.publish_status,

                createdAt:
                    report.created_at

            }

        };

    };


// ======================================================
// GET ALL INSPECTION REPORTS
// ADMIN
// ======================================================

const getAllInspectionReports =
    async () => {

        const reports =
            await inspectionReportRepository
                .getAllInspectionReports();


        const normalizedReports =
            Array.isArray(reports)
                ? reports.map(
                    report => ({

                        ...report,

                        overall_score:
                            normalizeOverallScore(
                                report.overall_score
                            )

                    })
                )
                : [];


        return {

            reports:
                normalizedReports

        };

    };


// ======================================================
// GET REPORT BY ID
// ADMIN
// ======================================================
//
// IMPORTANT FIX:
// Pehle yahan sirf inspection_reports ka data aa raha tha.
//
// Ab:
// report
// +
// vehicle
// +
// owner
// +
// inspection
// +
// checklist
//
// sab PDF ko diya jayega.
// ======================================================

const getInspectionReportById =
    async (
        reportId
    ) => {

        const numericReportId =
            Number(reportId);


        // ==================================================
        // VALIDATE REPORT ID
        // ==================================================

        if (
            !Number.isInteger(
                numericReportId
            ) ||
            numericReportId <= 0
        ) {

            throw new Error(
                "Invalid report ID."
            );

        }


        // ==================================================
        // GET REPORT
        // ==================================================

        const report =
            await inspectionReportRepository
                .getInspectionReportById(
                    numericReportId
                );


        if (
            !report
        ) {

            throw new Error(
                "Inspection report not found."
            );

        }


        // ==================================================
        // GET VEHICLE DATA
        // ==================================================

        const vehicleData =
            await vehicleRepository
                .getVehicleById(
                    report.car_id
                );


        if (
            !vehicleData
        ) {

            throw new Error(
                "Vehicle data not found for inspection report."
            );

        }


        // ==================================================
        // NORMALIZED REPORT
        // ==================================================

        const baseReport = {

            reportId:
                report.report_id,

            carId:
                report.car_id,

            overallScore:
                normalizeOverallScore(
                    report.overall_score
                ),

            engineRemark:
                report.engine_remark,

            overallRemark:
                report.overall_remark,

            pdfPath:
                report.pdf_path,

            publishStatus:
                report.publish_status,

            createdAt:
                report.created_at

        };


        // ==================================================
        // COMPLETE REPORT
        // ==================================================

        return buildCompleteReport(
            baseReport,
            vehicleData
        );

    };


// ======================================================
// UPDATE INSPECTION REPORT
// ADMIN
// ======================================================

const updateInspectionReport =
    async (
        reportId,
        reportData
    ) => {

        const numericReportId =
            Number(reportId);


        // ==================================================
        // VALIDATE REPORT ID
        // ==================================================

        if (
            !Number.isInteger(
                numericReportId
            ) ||
            numericReportId <= 0
        ) {

            throw new Error(
                "Invalid report ID."
            );

        }


        // ==================================================
        // GET EXISTING REPORT
        // ==================================================

        const existingReport =
            await inspectionReportRepository
                .getInspectionReportById(
                    numericReportId
                );


        if (
            !existingReport
        ) {

            throw new Error(
                "Inspection report not found."
            );

        }


        // ==================================================
        // SCORE
        // ==================================================

        const overallScore =
            normalizeOverallScore(
                reportData.overallScore
            );


        // ==================================================
        // ENGINE REMARK
        // ==================================================

        if (
            !reportData.engineRemark ||
            !String(
                reportData.engineRemark
            ).trim()
        ) {

            throw new Error(
                "Engine remark is required."
            );

        }


        // ==================================================
        // OVERALL REMARK
        // ==================================================

        if (
            !reportData.overallRemark ||
            !String(
                reportData.overallRemark
            ).trim()
        ) {

            throw new Error(
                "Overall remark is required."
            );

        }


        // ==================================================
        // PUBLISH STATUS
        // ==================================================

        if (
            reportData.publishStatus !== "Yes" &&
            reportData.publishStatus !== "No"
        ) {

            throw new Error(
                "Publish status must be Yes or No."
            );

        }


        // ==================================================
        // UPDATE DATABASE
        // ==================================================

        await inspectionReportRepository
            .updateInspectionReport(
                numericReportId,
                {

                    overallScore,

                    engineRemark:
                        String(
                            reportData.engineRemark
                        ).trim(),

                    overallRemark:
                        String(
                            reportData.overallRemark
                        ).trim(),

                    publishStatus:
                        reportData.publishStatus

                }
            );


        // ==================================================
        // GET COMPLETE VEHICLE DATA
        // ==================================================

        const vehicleData =
            await vehicleRepository
                .getVehicleById(
                    existingReport.car_id
                );


        if (
            !vehicleData
        ) {

            throw new Error(
                "Vehicle data not found."
            );

        }


        // ==================================================
        // COMPLETE REPORT FOR PDF
        // ==================================================

        const completeReport =
            buildCompleteReport(

                {

                    reportId:
                        numericReportId,

                    carId:
                        existingReport.car_id,

                    overallScore,

                    engineRemark:
                        String(
                            reportData.engineRemark
                        ).trim(),

                    overallRemark:
                        String(
                            reportData.overallRemark
                        ).trim(),

                    publishStatus:
                        reportData.publishStatus,

                    pdfPath:
                        existingReport.pdf_path,

                    createdAt:
                        existingReport.created_at

                },

                vehicleData

            );


        // ==================================================
        // GENERATE PDF
        // ==================================================

        const pdf =
            await inspectionReportPdfService
                .generateInspectionReportPdf(
                    completeReport
                );


        // ==================================================
        // VALIDATE PDF
        // ==================================================

        if (
            !pdf ||
            !pdf.filePath
        ) {

            throw new Error(
                "Inspection report PDF was not generated."
            );

        }


        // ==================================================
        // CHECK PDF EXISTS
        // ==================================================

        if (
            !fs.existsSync(
                pdf.filePath
            )
        ) {

            throw new Error(
                "Generated inspection report PDF file was not found."
            );

        }


        // ==================================================
        // SAVE PDF PATH IN DATABASE
        // ==================================================

        await inspectionReportRepository
            .updateInspectionReportPdfPath(
                numericReportId,
                pdf.pdfPath
            );


        // ==================================================
        // ADMIN EMAIL
        // ==================================================

        let adminEmailResult =
            null;


        if (
            reportData.publishStatus === "Yes"
        ) {

            try {

                if (
                    !env.ADMIN_EMAIL
                ) {

                    throw new Error(
                        "ADMIN_EMAIL is not configured in .env"
                    );

                }


                adminEmailResult =
                    await emailService
                        .sendInspectionReportToAdmin({

                            pdfPath:
                                pdf.filePath,

                            fileName:
                                pdf.fileName,

                            carId:
                                existingReport.car_id,

                            reportId:
                                numericReportId

                        });


            } catch (
                emailError
            ) {

                console.error(
                    "Admin Email Error:",
                    emailError
                );


                adminEmailResult = {

                    success:
                        false,

                    message:
                        emailError.message

                };

            }

        }


        // ==================================================
        // PDF URL
        // ==================================================

        const pdfUrl =
            `/uploads/reports/${pdf.fileName}`;


        // ==================================================
        // FINAL RESPONSE
        // ==================================================

        return {

            reportId:
                numericReportId,

            carId:
                existingReport.car_id,

            overallScore,

            message:
                reportData.publishStatus === "Yes"
                    ? "Inspection report published, PDF generated and admin email processed successfully."
                    : "Inspection report updated successfully.",

            pdfPath:
                pdf.pdfPath,

            pdfUrl,

            pdfFileName:
                pdf.fileName,

            adminEmail:
                adminEmailResult

        };

    };


// ======================================================
// SEND REPORT TO CUSTOMER EMAIL
// ======================================================

const sendReportToCustomerEmail =
    async (
        reportId,
        customerEmail
    ) => {

        // ==================================================
        // VALIDATE EMAIL
        // ==================================================

        if (
            !customerEmail ||
            !String(
                customerEmail
            ).trim()
        ) {

            throw new Error(
                "Customer email is required."
            );

        }


        const email =
            String(
                customerEmail
            )
                .trim()
                .toLowerCase();


        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (
            !emailRegex.test(
                email
            )
        ) {

            throw new Error(
                "Please enter a valid customer email."
            );

        }


        // ==================================================
        // GET REPORT DELIVERY DATA
        // ==================================================

        const report =
            await inspectionReportRepository
                .getReportDeliveryData(
                    reportId
                );


        if (
            !report
        ) {

            throw new Error(
                "Inspection report not found."
            );

        }


        // ==================================================
        // CHECK PUBLISHED
        // ==================================================

        if (
            report.publish_status !== "Yes"
        ) {

            throw new Error(
                "Inspection report is not published."
            );

        }


        // ==================================================
        // CHECK PDF PATH
        // ==================================================

        if (
            !report.pdf_path
        ) {

            throw new Error(
                "Inspection report PDF has not been generated."
            );

        }


        // ==================================================
        // BUILD ABSOLUTE PDF PATH
        // ==================================================

        const pdfAbsolutePath =
            path.join(
                process.cwd(),
                report.pdf_path
            );


        // ==================================================
        // CHECK PDF EXISTS
        // ==================================================

        if (
            !fs.existsSync(
                pdfAbsolutePath
            )
        ) {

            throw new Error(
                "Inspection report PDF file not found on server."
            );

        }


        // ==================================================
        // SEND SAME PDF TO CUSTOMER
        // ==================================================

        const emailResult =
            await emailService
                .sendInspectionReportEmail({

                    to:
                        email,

                    subject:
                        `Carsey.in - Vehicle Inspection Report #${report.report_id}`,

                    customerName:
                        report.owner_name ||
                        "Customer",

                    pdfPath:
                        pdfAbsolutePath,

                    fileName:
                        `car-${report.car_id}-inspection-report-${report.report_id}.pdf`

                });


        // ==================================================
        // RETURN RESULT
        // ==================================================

        return {

            success:
                true,

            message:
                "Inspection report sent to customer email successfully.",

            email:
                emailResult

        };

    };


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    createInspectionReport,

    getUnlockedInspectionReport,

    getAllInspectionReports,

    getInspectionReportById,

    updateInspectionReport,

    sendReportToCustomerEmail

};