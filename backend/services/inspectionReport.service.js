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

// Old records may contain total scores such as 43, 92 or 95.
// The application uses a final score on a 0-10 scale:
// 43 -> 4.3, 92 -> 9.2, 95 -> 9.5.
// Existing 0-10 scores are kept unchanged.

const normalizeOverallScore = (
    value
) => {

    const number =
        Number(value);

    if (
        !Number.isFinite(
            number
        )
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
        !Number.isInteger(
            carId
        ) ||
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
        String(
            reportData.publishStatus || ""
        ).toLowerCase() === "yes" ||
        String(
            reportData.publishStatus || ""
        ).toLowerCase() === "published"
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
                    reportData.pdfPath || null,

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

    if (
        !unlockRequest
    ) {

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

    if (
        !report
    ) {

        throw new Error(
            "Inspection report is not available."
        );

    }

    // --------------------------------------------------
    // ALSO VERIFY PUBLISH STATUS
    // --------------------------------------------------

    const reportPublishStatus =
        String(
            report.publish_status ||
            report.publishStatus ||
            ""
        ).toLowerCase();

    if (
        reportPublishStatus !== "yes" &&
        reportPublishStatus !== "published"
    ) {

        throw new Error(
            "Inspection report is not published."
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

        if (
            !report
        ) {

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
//
// IMPORTANT:
//
// publishStatus = No
//       ↓
// only DB update
//
// publishStatus = Yes
//       ↓
// mark published
//       ↓
// verify published
//       ↓
// get complete vehicle data
//       ↓
// get images
//       ↓
// generate PDF
//       ↓
// save PDF path
//       ↓
// same PDF to ADMIN
//       ↓
// same PDF to CUSTOMER
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

        if (
            !existingReport
        ) {

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

        const requestedPublishStatus =
            String(
                reportData.publishStatus || ""
            ).toLowerCase();

        const publishStatus =
            requestedPublishStatus === "yes" ||
            requestedPublishStatus === "published"
                ? "Yes"
                : "No";

        // --------------------------------------------------
        // UPDATE REPORT IN DATABASE
        // --------------------------------------------------

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

                    publishStatus

                }
            );

        // --------------------------------------------------
        // IF NOT PUBLISHED
        // --------------------------------------------------

        if (
            publishStatus !== "Yes"
        ) {

            return {

                reportId:
                    numericReportId,

                carId:
                    existingReport.car_id,

                message:
                    "Inspection report updated successfully.",

                publishStatus:
                    "No",

                pdfPath:
                    existingReport.pdf_path ||
                    null,

                pdfUrl:
                    existingReport.pdf_path ||
                    null,

                adminEmail:
                    null,

                customerEmail:
                    null

            };

        }

        // ==================================================
        // PUBLISH STARTS HERE
        // ==================================================

        // --------------------------------------------------
        // MARK REPORT PUBLISHED
        // --------------------------------------------------

        if (
            typeof inspectionReportRepository
                .markInspectionReportPublished ===
            "function"
        ) {

            await inspectionReportRepository
                .markInspectionReportPublished(
                    numericReportId
                );

        }

        // --------------------------------------------------
        // RE-FETCH REPORT AFTER PUBLISH
        // --------------------------------------------------

        let publishedReport =
            null;

        try {

            publishedReport =
                await inspectionReportRepository
                    .getInspectionReportById(
                        numericReportId
                    );

        } catch (
            publishFetchError
        ) {

            console.error(
                "Published Report Fetch Error:",
                publishFetchError
            );

        }

        // --------------------------------------------------
        // VERIFY PUBLISHED STATUS
        // --------------------------------------------------

        const verifiedPublishStatus =
            String(
                publishedReport &&
                (
                    publishedReport.publish_status ||
                    publishedReport.publishStatus
                ) ||
                ""
            ).toLowerCase();

        if (
            verifiedPublishStatus !== "yes" &&
            verifiedPublishStatus !== "published"
        ) {

            throw new Error(
                "Inspection report could not be verified as published. PDF and emails were not sent."
            );

        }

        // --------------------------------------------------
        // GET COMPLETE VEHICLE DATA
        // --------------------------------------------------

        let vehicleData =
            null;

        try {

            const vehicleRepository =
                require(
                    "../repositories/vehicle.repository"
                );

            if (
                typeof vehicleRepository
                    .getCompleteVehicleData ===
                "function"
            ) {

                vehicleData =
                    await vehicleRepository
                        .getCompleteVehicleData(
                            existingReport.car_id
                        );

            } else if (
                typeof vehicleRepository
                    .getVehicleById ===
                "function"
            ) {

                vehicleData =
                    await vehicleRepository
                        .getVehicleById(
                            existingReport.car_id
                        );

            } else {

                throw new Error(
                    "Vehicle repository does not contain getCompleteVehicleData or getVehicleById."
                );

            }

        } catch (
            vehicleError
        ) {

            console.error(
                "Complete Vehicle Data Fetch Error:",
                vehicleError
            );

            throw new Error(
                `Vehicle data could not be loaded: ${vehicleError.message}`
            );

        }

        if (
            !vehicleData
        ) {

            throw new Error(
                "Vehicle data could not be loaded."
            );

        }

        // --------------------------------------------------
        // GET VEHICLE IMAGES
        // --------------------------------------------------

        let vehicleImages =
            [];

        try {

            const vehicleImageRepository =
                require(
                    "../repositories/vehicleImage.repository"
                );

            if (
                typeof vehicleImageRepository
                    .getVehicleImages ===
                "function"
            ) {

                vehicleImages =
                    await vehicleImageRepository
                        .getVehicleImages(
                            existingReport.car_id
                        );

            }

        } catch (
            imageError
        ) {

            console.error(
                "Vehicle Images Fetch Error:",
                imageError
            );

            vehicleImages =
                [];

        }

        if (
            !Array.isArray(
                vehicleImages
            )
        ) {

            vehicleImages =
                [];

        }

        // --------------------------------------------------
        // IMAGE VALIDATION
        // --------------------------------------------------

        if (
            vehicleImages.length === 0
        ) {

            throw new Error(
                "Vehicle images are not uploaded yet. Final inspection PDF cannot be generated."
            );

        }

        // --------------------------------------------------
        // NORMALIZE VEHICLE
        // --------------------------------------------------

        const rawVehicle =
            vehicleData.vehicle ||
            vehicleData.data?.vehicle ||
            vehicleData.data ||
            vehicleData ||
            {};

        // --------------------------------------------------
        // NORMALIZE OWNER
        // --------------------------------------------------

        const rawOwner =
            vehicleData.owner ||
            vehicleData.customer ||
            vehicleData.customerDetails ||
            vehicleData.customer_details ||
            vehicleData.data?.owner ||
            vehicleData.data?.customer ||
            {};

        // --------------------------------------------------
        // OWNER NAME
        // --------------------------------------------------

        const ownerName =
            rawOwner.ownerName ||
            rawOwner.owner_name ||
            rawOwner.name ||
            rawOwner.fullName ||
            rawOwner.full_name ||
            rawOwner.customerName ||
            rawOwner.customer_name ||
            vehicleData.customer_name ||
            vehicleData.customerName ||
            vehicleData.owner_name ||
            vehicleData.ownerName ||
            vehicleData.data?.customer_name ||
            vehicleData.data?.customerName ||
            vehicleData.data?.owner_name ||
            vehicleData.data?.ownerName ||
            rawVehicle.customer_name ||
            rawVehicle.customerName ||
            rawVehicle.owner_name ||
            rawVehicle.ownerName ||
            "-";

        // --------------------------------------------------
        // OWNER MOBILE
        // --------------------------------------------------

        const ownerMobile =
            rawOwner.mobile ||
            rawOwner.phone ||
            rawOwner.phoneNumber ||
            rawOwner.phone_number ||
            rawOwner.mobileNumber ||
            rawOwner.mobile_number ||
            rawOwner.owner_mobile ||
            rawOwner.ownerMobile ||
            rawOwner.customer_mobile ||
            rawOwner.customerMobile ||
            vehicleData.owner_mobile ||
            vehicleData.ownerMobile ||
            vehicleData.customer_mobile ||
            vehicleData.customerMobile ||
            vehicleData.mobile ||
            vehicleData.phone ||
            vehicleData.phoneNumber ||
            vehicleData.data?.owner_mobile ||
            vehicleData.data?.ownerMobile ||
            vehicleData.data?.customer_mobile ||
            vehicleData.data?.customerMobile ||
            vehicleData.data?.mobile ||
            vehicleData.data?.phone ||
            rawVehicle.owner_mobile ||
            rawVehicle.ownerMobile ||
            rawVehicle.customer_mobile ||
            rawVehicle.customerMobile ||
            rawVehicle.mobile ||
            rawVehicle.phone ||
            "-";

        // --------------------------------------------------
        // OWNER EMAIL
        // --------------------------------------------------

        const ownerEmail =
            rawOwner.email ||
            rawOwner.owner_email ||
            rawOwner.ownerEmail ||
            rawOwner.customer_email ||
            rawOwner.customerEmail ||
            vehicleData.owner_email ||
            vehicleData.ownerEmail ||
            vehicleData.customer_email ||
            vehicleData.customerEmail ||
            vehicleData.email ||
            vehicleData.data?.owner_email ||
            vehicleData.data?.ownerEmail ||
            vehicleData.data?.customer_email ||
            vehicleData.data?.customerEmail ||
            vehicleData.data?.email ||
            rawVehicle.owner_email ||
            rawVehicle.ownerEmail ||
            rawVehicle.customer_email ||
            rawVehicle.customerEmail ||
            rawVehicle.email ||
            "-";

        // --------------------------------------------------
        // OWNER ADDRESS
        // --------------------------------------------------

        const ownerAddress =
            rawOwner.address ||
            rawOwner.owner_address ||
            rawOwner.ownerAddress ||
            rawOwner.customer_address ||
            rawOwner.customerAddress ||
            rawOwner.fullAddress ||
            rawOwner.full_address ||
            vehicleData.owner_address ||
            vehicleData.ownerAddress ||
            vehicleData.customer_address ||
            vehicleData.customerAddress ||
            vehicleData.address ||
            vehicleData.fullAddress ||
            vehicleData.full_address ||
            vehicleData.city ||
            vehicleData.data?.owner_address ||
            vehicleData.data?.ownerAddress ||
            vehicleData.data?.customer_address ||
            vehicleData.data?.customerAddress ||
            vehicleData.data?.address ||
            vehicleData.data?.city ||
            rawVehicle.owner_address ||
            rawVehicle.ownerAddress ||
            rawVehicle.customer_address ||
            rawVehicle.customerAddress ||
            rawVehicle.address ||
            rawVehicle.city ||
            "-";

        const ownerObject = {

            ...rawOwner,

            ownerName,

            owner_name:
                ownerName,

            name:
                ownerName,

            customerName:
                ownerName,

            customer_name:
                ownerName,

            mobile:
                ownerMobile,

            phone:
                ownerMobile,

            owner_mobile:
                ownerMobile,

            ownerMobile:
                ownerMobile,

            customer_mobile:
                ownerMobile,

            customerMobile:
                ownerMobile,

            email:
                ownerEmail,

            owner_email:
                ownerEmail,

            ownerEmail:
                ownerEmail,

            customer_email:
                ownerEmail,

            customerEmail:
                ownerEmail,

            address:
                ownerAddress,

            owner_address:
                ownerAddress,

            ownerAddress:
                ownerAddress,

            customer_address:
                ownerAddress,

            customerAddress:
                ownerAddress

        };

        // --------------------------------------------------
        // NORMALIZE INSPECTION
        // --------------------------------------------------

        const rawInspection =
            vehicleData.inspection ||
            vehicleData.inspectionData ||
            vehicleData.data?.inspection ||
            {};

        const completeInspection = {

            ...rawInspection,

            overall_score:
                rawInspection.overall_score ??
                rawInspection.overallScore ??
                reportData.overallScore ??
                publishedReport?.overall_score ??
                existingReport.overall_score ??
                overallScore,

            overallScore:
                rawInspection.overallScore ??
                rawInspection.overall_score ??
                reportData.overallScore ??
                publishedReport?.overall_score ??
                existingReport.overall_score ??
                overallScore,

            engine_remark:
                rawInspection.engine_remark ??
                rawInspection.engineRemark ??
                reportData.engineRemark ??
                publishedReport?.engine_remark ??
                existingReport.engine_remark ??
                "",

            engineRemark:
                rawInspection.engineRemark ??
                rawInspection.engine_remark ??
                reportData.engineRemark ??
                publishedReport?.engine_remark ??
                existingReport.engine_remark ??
                "",

            overall_remark:
                rawInspection.overall_remark ??
                rawInspection.overallRemark ??
                reportData.overallRemark ??
                publishedReport?.overall_remark ??
                existingReport.overall_remark ??
                "",

            overallRemark:
                rawInspection.overallRemark ??
                rawInspection.overall_remark ??
                reportData.overallRemark ??
                publishedReport?.overall_remark ??
                existingReport.overall_remark ??
                ""

        };

        // --------------------------------------------------
        // NORMALIZE CHECKLIST
        // --------------------------------------------------

        const checklistData =
            vehicleData.checklist ||
            vehicleData.inspection_checklist ||
            vehicleData.inspectionChecklist ||
            vehicleData.detailedInspection ||
            vehicleData.inspection?.checklist ||
            vehicleData.inspection?.inspection_checklist ||
            vehicleData.inspection?.inspectionChecklist ||
            vehicleData.inspection?.detailedInspection ||
            vehicleData.data?.checklist ||
            vehicleData.data?.inspection_checklist ||
            vehicleData.data?.inspectionChecklist ||
            vehicleData.data?.detailedInspection ||
            vehicleData.data?.inspection?.checklist ||
            reportData.checklist ||
            reportData.inspection_checklist ||
            reportData.inspectionChecklist ||
            reportData.detailedInspection ||
            reportData.inspection?.checklist ||
            [];

        // --------------------------------------------------
        // COMPLETE REPORT
        // --------------------------------------------------

        const completeReport = {

            ...existingReport,

            ...(publishedReport || {}),

            ...reportData,

            // Keep every field supplied by the Add Vehicle form
            // available to the PDF layer, even when the database
            // schema uses nested owner/customer objects.
            customer_name:
                reportData.customer_name ||
                reportData.customerName ||
                reportData.owner_name ||
                reportData.ownerName ||
                existingReport.customer_name ||
                existingReport.customerName ||
                existingReport.owner_name ||
                existingReport.ownerName ||
                "",

            owner_name:
                reportData.owner_name ||
                reportData.ownerName ||
                reportData.customer_name ||
                reportData.customerName ||
                existingReport.owner_name ||
                existingReport.ownerName ||
                existingReport.customer_name ||
                existingReport.customerName ||
                "",

            owner_mobile:
                reportData.owner_mobile ||
                reportData.ownerMobile ||
                reportData.customer_mobile ||
                reportData.customerMobile ||
                existingReport.owner_mobile ||
                existingReport.ownerMobile ||
                existingReport.customer_mobile ||
                existingReport.customerMobile ||
                "",

            owner_email:
                reportData.owner_email ||
                reportData.ownerEmail ||
                reportData.customer_email ||
                reportData.customerEmail ||
                existingReport.owner_email ||
                existingReport.ownerEmail ||
                existingReport.customer_email ||
                existingReport.customerEmail ||
                "",

            owner_address:
                reportData.owner_address ||
                reportData.ownerAddress ||
                reportData.customer_address ||
                reportData.customerAddress ||
                existingReport.owner_address ||
                existingReport.ownerAddress ||
                existingReport.customer_address ||
                existingReport.customerAddress ||
                "",

            variant_short_note:
                reportData.variant_short_note ||
                reportData.variantShortNote ||
                existingReport.variant_short_note ||
                existingReport.variantShortNote ||
                "",

            registration_rto_short_note:
                reportData.registration_rto_short_note ||
                reportData.registrationRtoShortNote ||
                existingReport.registration_rto_short_note ||
                existingReport.registrationRtoShortNote ||
                "",

            price_short_note:
                reportData.price_short_note ||
                reportData.priceShortNote ||
                existingReport.price_short_note ||
                existingReport.priceShortNote ||
                "",

            vehicle_note:
                reportData.vehicle_note ||
                reportData.vehicleNote ||
                existingReport.vehicle_note ||
                existingReport.vehicleNote ||
                "",

            reportId:
                numericReportId,

            report_id:
                numericReportId,

            carId:
                existingReport.car_id,

            car_id:
                existingReport.car_id,

            overallScore,

            overall_score:
                overallScore,

            engineRemark:
                String(
                    reportData.engineRemark
                ).trim(),

            engine_remark:
                String(
                    reportData.engineRemark
                ).trim(),

            overallRemark:
                String(
                    reportData.overallRemark
                ).trim(),

            overall_remark:
                String(
                    reportData.overallRemark
                ).trim(),

            publishStatus:
                "Yes",

            publish_status:
                "Yes",

            vehicle:
                rawVehicle,

            vehicleData:
                rawVehicle,

            owner:
                ownerObject,

            customer:
                ownerObject,

            customerDetails:
                ownerObject,

            customer_details:
                ownerObject,

            inspection:
                completeInspection,

            checklist:
                checklistData,

            inspection_checklist:
                checklistData,

            inspectionChecklist:
                checklistData,

            detailedInspection:
                checklistData,

            images:
                vehicleImages,

            vehicleImages:
                vehicleImages

        };

        // --------------------------------------------------
        // DEBUG OWNER DATA
        // --------------------------------------------------

        console.log(
            "========================================"
        );

        console.log(
            "PDF OWNER DATA"
        );

        console.log(
            "Owner Name:",
            ownerObject.ownerName
        );

        console.log(
            "Owner Mobile:",
            ownerObject.mobile
        );

        console.log(
            "Owner Email:",
            ownerObject.email
        );

        console.log(
            "Owner Address:",
            ownerObject.address
        );

        console.log(
            "========================================"
        );

        // --------------------------------------------------
        // DEBUG VEHICLE DATA
        // --------------------------------------------------

        console.log(
            "PDF VEHICLE DATA:"
        );

        console.log(
            JSON.stringify(
                rawVehicle,
                null,
                2
            )
        );

        // --------------------------------------------------
        // DEBUG INSPECTION DATA
        // --------------------------------------------------

        console.log(
            "PDF INSPECTION DATA:"
        );

        console.log(
            JSON.stringify(
                completeInspection,
                null,
                2
            )
        );

        // --------------------------------------------------
        // DEBUG CHECKLIST DATA
        // --------------------------------------------------

        console.log(
            "PDF CHECKLIST DATA:"
        );

        console.log(
            JSON.stringify(
                checklistData,
                null,
                2
            )
        );

        // --------------------------------------------------
        // DEBUG PUBLISH STATUS
        // --------------------------------------------------

        console.log(
            "PDF PUBLISH STATUS:",
            completeReport.publish_status
        );

        // --------------------------------------------------
        // GENERATE PDF
        // --------------------------------------------------

        const pdf =
            await inspectionReportPdfService
                .generateInspectionReportPdf(
                    completeReport
                );

        if (
            !pdf ||
            !pdf.filePath ||
            !pdf.pdfPath
        ) {

            throw new Error(
                "Inspection PDF could not be generated."
            );

        }

        // --------------------------------------------------
        // CHECK PDF FILE EXISTS
        // --------------------------------------------------

        if (
            !fs.existsSync(
                pdf.filePath
            )
        ) {

            throw new Error(
                "Generated inspection report PDF file was not found."
            );

        }

        // --------------------------------------------------
        // SAVE PDF PATH IN DATABASE
        // --------------------------------------------------

        await inspectionReportRepository
            .updateInspectionReportPdfPath(

                numericReportId,

                pdf.pdfPath

            );

        // --------------------------------------------------
        // ADMIN EMAIL RESULT
        // --------------------------------------------------

        let adminEmailResult =
            null;

        let customerEmailResult =
            null;

        // --------------------------------------------------
        // SEND ADMIN EMAIL ONLY AFTER PUBLISH
        // --------------------------------------------------

        if (
            completeReport.publish_status === "Yes"
        ) {

            try {

                // ------------------------------------------
                // ADMIN EMAIL CHECK
                // ------------------------------------------

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

                // ------------------------------------------
                // SEND SAME GENERATED PDF
                // ------------------------------------------

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

            } catch (
                emailError
            ) {

                // ------------------------------------------
                // EMAIL FAILURE SHOULD NOT DELETE PDF
                // ------------------------------------------

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

        // --------------------------------------------------
        // SEND CUSTOMER EMAIL ONLY AFTER PUBLISH
        // --------------------------------------------------
        //
        // IMPORTANT:
        // The exact SAME generated PDF is sent to customer.
        // No second PDF is generated.
        // --------------------------------------------------

        if (
            completeReport.publish_status === "Yes"
        ) {

            try {

                const deliveryReport =
                    await inspectionReportRepository
                        .getReportDeliveryData(
                            numericReportId
                        );

                const customerEmail =
                    (
                        deliveryReport &&
                        (
                            deliveryReport.owner_email ||
                            deliveryReport.customer_email ||
                            deliveryReport.ownerEmail ||
                            deliveryReport.customerEmail ||
                            deliveryReport.email
                        )
                    ) ||
                    ownerObject.email ||
                    "";

                if (
                    customerEmail &&
                    String(
                        customerEmail
                    ).trim()
                ) {

                    customerEmailResult =
                        await emailService
                            .sendInspectionReportEmail({

                                to:
                                    String(
                                        customerEmail
                                    )
                                        .trim()
                                        .toLowerCase(),

                                subject:
                                    `Carsey.in - Vehicle Inspection Report #${numericReportId}`,

                                customerName:
                                    (
                                        deliveryReport &&
                                        (
                                            deliveryReport.owner_name ||
                                            deliveryReport.customer_name ||
                                            deliveryReport.ownerName ||
                                            deliveryReport.customerName
                                        )
                                    ) ||
                                    ownerObject.ownerName ||
                                    "Customer",

                                pdfPath:
                                    pdf.filePath,

                                fileName:
                                    pdf.fileName

                            });

                    console.log(
                        "Customer inspection report email sent successfully."
                    );

                } else {

                    customerEmailResult = {

                        success:
                            false,

                        skipped:
                            true,

                        message:
                            "Customer email is not available. PDF was published and saved successfully."

                    };

                    console.warn(
                        customerEmailResult.message
                    );

                }

            } catch (
                customerEmailError
            ) {

                console.error(
                    "Customer Email Error:",
                    customerEmailError
                );

                customerEmailResult = {

                    success:
                        false,

                    message:
                        customerEmailError.message

                };

            }

        }

        // --------------------------------------------------
        // PDF URL
        // --------------------------------------------------

        const pdfUrl =
            pdf.pdfPath ||
            `/uploads/reports/${pdf.fileName}`;

        // --------------------------------------------------
        // FINAL RESPONSE
        // --------------------------------------------------

        return {

            reportId:
                numericReportId,

            carId:
                existingReport.car_id,

            message:
                "Inspection report published, PDF generated and email delivery processed successfully.",

            pdfPath:
                pdf.pdfPath,

            pdfUrl,

            pdfFileName:
                pdf.fileName,

            adminEmail:
                adminEmailResult,

            customerEmail:
                customerEmailResult,

            publishStatus:
                "Yes"

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

        // --------------------------------------------------
        // CHECK PUBLISHED
        // --------------------------------------------------

        const reportPublishStatus =
            String(
                report.publish_status ||
                report.publishStatus ||
                ""
            ).toLowerCase();

        if (
            reportPublishStatus !== "yes" &&
            reportPublishStatus !== "published" &&
            reportPublishStatus !== "publish" &&
            reportPublishStatus !== "active" &&
            reportPublishStatus !== "available"
        ) {

            throw new Error(
                "Inspection report is not published."
            );

        }

        // --------------------------------------------------
        // CHECK PDF PATH
        // --------------------------------------------------

        if (
            !report.pdf_path &&
            !report.pdfPath
        ) {

            throw new Error(
                "Inspection report PDF has not been generated."
            );

        }

        // --------------------------------------------------
        // BUILD / RESOLVE ABSOLUTE PDF PATH
        // --------------------------------------------------
        //
        // The PDF generator currently saves the final report in:
        //
        //   backend/uploads/inspection-reports/inspection-report-{id}.pdf
        //
        // Older records may contain paths such as:
        //   /uploads/inspection-reports/...
        //   uploads/inspection-reports/...
        //   /uploads/reports/...
        //   reports/...
        //   inspection-reports/...
        //   an absolute Windows/Linux path
        //
        // Therefore do not rely on only one DB path. Try the stored
        // path first, then the known backend upload locations, and
        // finally locate the PDF by its filename/report id.
        // This makes the customer email use the SAME PDF that was
        // generated for the admin email.
        // --------------------------------------------------

        const storedPdfPath =
            String(
                report.pdf_path ||
                report.pdfPath ||
                ""
            ).trim();

        const storedPdfFileName =
            String(
                report.pdf_file_name ||
                report.pdfFileName ||
                ""
            ).trim();

        const reportNumericId =
            Number(
                report.report_id ||
                report.reportId ||
                reportId
            );

        const vehicleNumericId =
            Number(
                report.car_id ||
                report.carId
            );

        const backendRoot =
            process.cwd();

        const uploadRoot =
            path.join(
                backendRoot,
                "uploads"
            );

        const candidatePdfPaths =
            [];

        const addCandidatePdfPath =
            (candidatePath) => {

                if (
                    !candidatePath
                ) {

                    return;

                }

                const value =
                    String(
                        candidatePath
                    ).trim();

                if (
                    !value
                ) {

                    return;

                }

                const absoluteCandidate =
                    path.isAbsolute(
                        value
                    )
                        ? path.normalize(
                            value
                        )
                        : path.resolve(
                            backendRoot,
                            value.replace(
                                /^[/\\]+/,
                                ""
                            )
                        );

                if (
                    !candidatePdfPaths.includes(
                        absoluteCandidate
                    )
                ) {

                    candidatePdfPaths.push(
                        absoluteCandidate
                    );

                }

            };

        // --------------------------------------------------
        // 1. EXACT STORED PATH FROM DATABASE
        // --------------------------------------------------

        addCandidatePdfPath(
            storedPdfPath
        );

        // --------------------------------------------------
        // 2. BUILD POSSIBLE FILE NAMES
        // --------------------------------------------------

        const knownFileNames =
            [];

        if (
            storedPdfFileName
        ) {

            knownFileNames.push(
                path.basename(
                    storedPdfFileName
                )
            );

        }

        if (
            storedPdfPath
        ) {

            knownFileNames.push(
                path.basename(
                    storedPdfPath
                )
            );

        }

        if (
            Number.isInteger(
                reportNumericId
            ) &&
            reportNumericId > 0
        ) {

            knownFileNames.push(
                `inspection-report-${reportNumericId}.pdf`
            );

        }

        if (
            Number.isInteger(
                vehicleNumericId
            ) &&
            vehicleNumericId > 0 &&
            Number.isInteger(
                reportNumericId
            ) &&
            reportNumericId > 0
        ) {

            knownFileNames.push(
                `car-${vehicleNumericId}-inspection-report-${reportNumericId}.pdf`
            );

        }

        const uniqueFileNames =
            [
                ...new Set(
                    knownFileNames
                        .filter(
                            Boolean
                        )
                        .map(
                            (fileName) =>
                                path.basename(
                                    fileName
                                )
                        )
                )
            ];

        // --------------------------------------------------
        // 3. CHECK ALL KNOWN PDF LOCATIONS
        // --------------------------------------------------

        for (
            const fileName of
                uniqueFileNames
        ) {

            addCandidatePdfPath(
                path.join(
                    uploadRoot,
                    "inspection-reports",
                    fileName
                )
            );

            addCandidatePdfPath(
                path.join(
                    uploadRoot,
                    "reports",
                    fileName
                )
            );

            addCandidatePdfPath(
                path.join(
                    backendRoot,
                    "inspection-reports",
                    fileName
                )
            );

            addCandidatePdfPath(
                path.join(
                    backendRoot,
                    "reports",
                    fileName
                )
            );

        }

        // --------------------------------------------------
        // DEBUG PDF PATH RESOLUTION
        // --------------------------------------------------

        console.log(
            "========================================"
        );

        console.log(
            "CUSTOMER PDF PATH RESOLUTION"
        );

        console.log(
            "Report ID:",
            reportNumericId
        );

        console.log(
            "Stored PDF Path:",
            storedPdfPath || "-"
        );

        console.log(
            "Stored PDF File Name:",
            storedPdfFileName || "-"
        );

        console.log(
            "Candidate PDF Paths:",
            candidatePdfPaths
        );

        // --------------------------------------------------
        // FIND ACTUAL EXISTING PDF
        // --------------------------------------------------

        const pdfAbsolutePath =
            candidatePdfPaths.find(
                (candidatePath) =>
                    fs.existsSync(
                        candidatePath
                    ) &&
                    fs.statSync(
                        candidatePath
                    ).isFile()
            );

        // --------------------------------------------------
        // CHECK PDF EXISTS
        // --------------------------------------------------

        if (
            !pdfAbsolutePath
        ) {

            console.error(
                "Customer PDF was not found. Checked paths:",
                candidatePdfPaths
            );

            throw new Error(
                "Inspection report PDF file not found on server."
            );

        }

        console.log(
            "Resolved Customer PDF Path:",
            pdfAbsolutePath
        );

        console.log(
            "PDF Exists:",
            fs.existsSync(
                pdfAbsolutePath
            )
        );

        // --------------------------------------------------
        // DEBUG CUSTOMER EMAIL
        // --------------------------------------------------

        console.log(
            "========================================"
        );

        console.log(
            "CUSTOMER EMAIL SEND"
        );

        console.log(
            "Report ID:",
            report.report_id
        );

        console.log(
            "Car ID:",
            report.car_id
        );

        console.log(
            "Customer Email:",
            email
        );

        console.log(
            "PDF Path:",
            pdfAbsolutePath
        );

        console.log(
            "========================================"
        );

        // --------------------------------------------------
        // SEND SAME PDF TO CUSTOMER
        // --------------------------------------------------

        const emailResult =
            await emailService
                .sendInspectionReportEmail({

                    to:
                        email,

                    subject:
                        `Carsey.in - Vehicle Inspection Report #${report.report_id}`,

                    customerName:
                        report.owner_name ||
                        report.customer_name ||
                        report.ownerName ||
                        report.customerName ||
                        "Customer",

                    pdfPath:
                        pdfAbsolutePath,

                    fileName:
                        report.pdf_file_name ||
                        `car-${report.car_id}-inspection-report-${report.report_id}.pdf`

                });

        // --------------------------------------------------
        // RETURN RESULT
        // --------------------------------------------------

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