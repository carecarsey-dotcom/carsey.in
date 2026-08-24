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
// NORMALIZE INSPECTION SCORE
// ======================================================
//
// Old records may contain total scores such as 43, 92 or 95.
// The application uses a final score on a 0-10 scale:
//
// 43 -> 4.3
// 92 -> 9.2
// 95 -> 9.5
//
// Existing 0-10 scores are kept unchanged.
//
// ======================================================

const normalizeOverallScore = (
    value
) => {

    const number =
        Number(value);


    if (
        !Number.isFinite(number)
    ) {

        return NaN;

    }


    const normalized =
        number > 10 &&
        number <= 100
            ? number / 10
            : number;


    return Number(
        normalized.toFixed(1)
    );

};


// ======================================================
// CREATE INSPECTION REPORT
// ======================================================

const createInspectionReport = async (
    reportData
) => {

    const carId =
        Number(
            reportData.carId
        );


    // --------------------------------------------------
    // VALIDATE CAR ID
    // --------------------------------------------------

    if (
        !Number.isInteger(carId) ||
        carId <= 0
    ) {

        throw new Error(
            "Invalid car ID."
        );

    }


    // --------------------------------------------------
    // OVERALL SCORE
    // --------------------------------------------------

    const overallScore =
        normalizeOverallScore(
            reportData.overallScore
        );


    if (
        !Number.isFinite(
            overallScore
        ) ||
        overallScore < 0 ||
        overallScore > 10
    ) {

        throw new Error(
            "Overall score must be between 0 and 10."
        );

    }


    // --------------------------------------------------
    // ENGINE REMARK
    // --------------------------------------------------

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


    // --------------------------------------------------
    // OVERALL REMARK
    // --------------------------------------------------

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


    // --------------------------------------------------
    // PUBLISH STATUS
    // --------------------------------------------------

    const publishStatus =
        reportData.publishStatus === "Yes"
            ? "Yes"
            : "No";


    // --------------------------------------------------
    // CREATE REPORT IN DATABASE
    // --------------------------------------------------

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
// GET UNLOCKED REPORT
// CUSTOMER
// ======================================================

const getUnlockedInspectionReport = async (
    carId,
    requestId
) => {

    const numericCarId =
        Number(carId);

    const numericRequestId =
        Number(requestId);


    // --------------------------------------------------
    // VALIDATE CAR ID
    // --------------------------------------------------

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


    // --------------------------------------------------
    // VALIDATE REQUEST ID
    // --------------------------------------------------

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


    // --------------------------------------------------
    // CHECK APPROVED REQUEST
    // --------------------------------------------------

    const unlockRequest =
        await inspectionReportRepository
            .getApprovedUnlockRequest(
                numericRequestId,
                numericCarId
            );


    if (!unlockRequest) {

        throw new Error(
            "Report unlock request is not approved."
        );

    }


    // --------------------------------------------------
    // GET PUBLISHED REPORT
    // --------------------------------------------------

    const report =
        await inspectionReportRepository
            .getInspectionReportByCarId(
                numericCarId
            );


    if (!report) {

        throw new Error(
            "Inspection report is not available."
        );

    }


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

            overallScore:
                report.overall_score,

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
// GET ALL REPORTS
// ADMIN
// ======================================================

const getAllInspectionReports =
    async () => {

        const reports =
            await inspectionReportRepository
                .getAllInspectionReports();


        return {

            reports

        };

    };


// ======================================================
// GET REPORT BY ID
// ADMIN
// ======================================================

const getInspectionReportById =
    async (
        reportId
    ) => {

        const numericReportId =
            Number(reportId);


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


        const report =
            await inspectionReportRepository
                .getInspectionReportById(
                    numericReportId
                );


        if (!report) {

            throw new Error(
                "Inspection report not found."
            );

        }


        return {

            reportId:
                report.report_id,

            carId:
                report.car_id,

            overallScore:
                report.overall_score,

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

    };


// ======================================================
// UPDATE INSPECTION REPORT
// ADMIN
// ======================================================
//
// IMPORTANT FLOW:
//
// publishStatus = Yes
//       ↓
// PDF generate
//       ↓
// PDF save
//       ↓
// DB path save
//       ↓
// inspection report publish
//       ↓
// ADMIN EMAIL
//
// ======================================================

const updateInspectionReport =
    async (
        reportId,
        reportData
    ) => {

        const numericReportId =
            Number(reportId);


        // --------------------------------------------------
        // VALIDATE REPORT ID
        // --------------------------------------------------

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


        // --------------------------------------------------
        // GET EXISTING REPORT
        // --------------------------------------------------

        const existingReport =
            await inspectionReportRepository
                .getInspectionReportById(
                    numericReportId
                );


        if (!existingReport) {

            throw new Error(
                "Inspection report not found."
            );

        }


        // --------------------------------------------------
        // SCORE
        // --------------------------------------------------

        const overallScore =
            normalizeOverallScore(
                reportData.overallScore
            );


        if (
            !Number.isFinite(
                overallScore
            ) ||
            overallScore < 0 ||
            overallScore > 10
        ) {

            throw new Error(
                "Overall score must be between 0 and 10."
            );

        }


        // --------------------------------------------------
        // ENGINE REMARK
        // --------------------------------------------------

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


        // --------------------------------------------------
        // OVERALL REMARK
        // --------------------------------------------------

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


        // --------------------------------------------------
        // PUBLISH STATUS
        // --------------------------------------------------

        if (
            reportData.publishStatus !== "Yes" &&
            reportData.publishStatus !== "No"
        ) {

            throw new Error(
                "Publish status must be Yes or No."
            );

        }


        // ==================================================
        // UPDATE INSPECTION REPORT DATABASE
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

        const vehicleRepository =
            require(
                "../repositories/vehicle.repository"
            );


        const vehicleData =
            await vehicleRepository
                .getVehicleById(
                    existingReport.car_id
                );


        if (!vehicleData) {

            throw new Error(
                "Vehicle data not found."
            );

        }


        // ==================================================
        // COMPLETE DATA FOR PDF
        // ==================================================
        //
        // Ye wahi data hai jo Add Vehicle /
        // Inspection se aaya hai.
        //
        // ==================================================

        const completeReport = {

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


            // ------------------------------------------------
            // VEHICLE DATA
            // ------------------------------------------------

            vehicle:
                vehicleData.vehicle ||
                {},


            // ------------------------------------------------
            // OWNER DATA
            // ------------------------------------------------

            owner:
                vehicleData.owner ||
                {},


            // ------------------------------------------------
            // INSPECTION DATA
            // ------------------------------------------------

            inspection:
                vehicleData.inspection ||
                {},


            // ------------------------------------------------
            // CHECKLIST
            // ------------------------------------------------

            checklist:
                vehicleData.checklist ||
                {}

        };


        // ==================================================
        // GENERATE PDF
        // ==================================================

        const pdf =
            await inspectionReportPdfService
                .generateInspectionReportPdf(
                    completeReport
                );


        // ==================================================
        // VALIDATE GENERATED PDF
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
        // CHECK PDF FILE EXISTS
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
        // IMPORTANT
        // PDF SUCCESS + PUBLISH = REPORT PUBLISHED
        // ==================================================
        //
        // Ye synchronization important hai.
        //
        // Kuch old vehicle records me:
        //
        // cars.status = Published
        //
        // lekin:
        //
        // inspection_reports.publish_status = No
        //
        // reh gaya tha.
        //
        // Is wajah se customer email par:
        //
        // "Inspection report is not published."
        //
        // aa raha tha.
        //
        // ==================================================

        if (
            reportData.publishStatus === "Yes"
        ) {

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
                            "Yes"

                    }

                );

        }


        // ==================================================
        // ADMIN EMAIL RESULT
        // ==================================================

        let adminEmailResult =
            null;


        // ==================================================
        // SEND ADMIN EMAIL ONLY AFTER PUBLISH
        // ==================================================

        if (
            reportData.publishStatus === "Yes"
        ) {

            try {

                // ------------------------------------------------
                // ADMIN EMAIL CHECK
                // ------------------------------------------------

                if (
                    !env.ADMIN_EMAIL
                ) {

                    throw new Error(
                        "ADMIN_EMAIL is not configured in .env"
                    );

                }


                console.log(
                    "Sending inspection PDF to admin:",
                    env.ADMIN_EMAIL
                );


                // ------------------------------------------------
                // SEND SAME GENERATED PDF
                // ------------------------------------------------

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


                console.log(
                    "Admin inspection report email sent successfully."
                );


            }
            catch (emailError) {

                // ------------------------------------------------
                // EMAIL FAILURE SHOULD NOT DELETE PDF
                // ------------------------------------------------

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
            pdf.pdfUrl ||
            `/uploads/reports/${pdf.fileName}`;


        // ==================================================
        // FINAL RESPONSE
        // ==================================================

        return {

            reportId:
                numericReportId,

            carId:
                existingReport.car_id,

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

        // --------------------------------------------------
        // VALIDATE REPORT ID
        // --------------------------------------------------

        const numericReportId =
            Number(reportId);


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


        // --------------------------------------------------
        // VALIDATE EMAIL
        // --------------------------------------------------

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


        // --------------------------------------------------
        // GET REPORT DELIVERY DATA
        // --------------------------------------------------

        let report =
            await inspectionReportRepository
                .getReportDeliveryData(
                    numericReportId
                );


        if (!report) {

            throw new Error(
                "Inspection report not found."
            );

        }


        // ==================================================
        // CHECK PDF PATH FIRST
        // ==================================================
        //
        // Agar PDF already generated hai to usi PDF ko use
        // karna hai.
        //
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

        let pdfAbsolutePath;


        if (
            path.isAbsolute(
                report.pdf_path
            )
        ) {

            pdfAbsolutePath =
                report.pdf_path;

        }
        else {

            pdfAbsolutePath =
                path.join(
                    process.cwd(),
                    report.pdf_path
                );

        }


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
        // IMPORTANT PUBLISH FIX
        // ==================================================
        //
        // Problem:
        //
        // Vehicle Published = Yes
        // PDF generated = Yes
        // inspection_reports.publish_status = No
        //
        // Result:
        //
        // "Inspection report is not published."
        //
        // Ab agar valid final PDF already exists, report ko
        // automatically Yes par synchronize karenge.
        //
        // Existing score/remarks ko change nahi karenge.
        //
        // ==================================================

        if (
            report.publish_status !== "Yes"
        ) {

            console.warn(
                "Inspection report publish_status was not Yes."
            );

            console.warn(
                "Synchronizing report status because final PDF exists."
            );


            const currentScore =
                normalizeOverallScore(
                    report.overall_score
                );


            const safeScore =
                Number.isFinite(
                    currentScore
                )
                    ? currentScore
                    : 0;


            const safeEngineRemark =
                report.engine_remark ||
                "Inspection completed.";


            const safeOverallRemark =
                report.overall_remark ||
                "Vehicle inspection completed.";


            try {

                await inspectionReportRepository
                    .updateInspectionReport(

                        numericReportId,

                        {

                            overallScore:
                                safeScore,

                            engineRemark:
                                safeEngineRemark,

                            overallRemark:
                                safeOverallRemark,

                            publishStatus:
                                "Yes"

                        }

                    );


                // ------------------------------------------------
                // RELOAD REPORT AFTER UPDATE
                // ------------------------------------------------

                const refreshedReport =
                    await inspectionReportRepository
                        .getReportDeliveryData(
                            numericReportId
                        );


                if (
                    refreshedReport
                ) {

                    report =
                        refreshedReport;

                }


                console.log(
                    "Inspection report publish_status synchronized to Yes."
                );


            }
            catch (publishError) {

                console.error(
                    "Inspection report publish synchronization failed:",
                    publishError
                );


                throw new Error(
                    `Unable to publish inspection report: ${publishError.message}`
                );

            }

        }


        // ==================================================
        // FINAL PUBLISH CHECK
        // ==================================================

        if (
            report.publish_status !== "Yes"
        ) {

            throw new Error(
                "Inspection report is not published."
            );

        }


        // ==================================================
        // RECHECK PDF PATH
        // ==================================================

        if (
            !report.pdf_path
        ) {

            throw new Error(
                "Inspection report PDF has not been generated."
            );

        }


        // ==================================================
        // REBUILD PDF ABSOLUTE PATH
        // ==================================================

        if (
            path.isAbsolute(
                report.pdf_path
            )
        ) {

            pdfAbsolutePath =
                report.pdf_path;

        }
        else {

            pdfAbsolutePath =
                path.join(
                    process.cwd(),
                    report.pdf_path
                );

        }


        // ==================================================
        // FINAL PDF EXISTENCE CHECK
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

            reportId:
                report.report_id,

            carId:
                report.car_id,

            publishStatus:
                report.publish_status,

            pdfPath:
                report.pdf_path,

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