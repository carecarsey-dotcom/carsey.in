const fs = require("fs");

const env = require("../config/env");

const { Resend } = require("resend");

// ======================================================
// CREATE RESEND CLIENT
// ======================================================

const resend = new Resend(
    env.RESEND_API_KEY
);

// ======================================================
// VERIFY EMAIL CONFIGURATION
// ======================================================
//
// server.js isi function ko call kar raha hai.
//
// Resend SMTP connection ki zarurat nahi hai.
// Resend HTTPS API ke through email bhejta hai.
// ======================================================

const verifyEmailConnection = async () => {
    try {
        if (!env.RESEND_API_KEY) {
            throw new Error(
                "RESEND_API_KEY is not configured."
            );
        }

        if (!env.MAIL_FROM) {
            throw new Error(
                "MAIL_FROM is not configured."
            );
        }

        console.log(
            "Email Service Configured Successfully"
        );

        return true;

    } catch (error) {

        console.error(
            "Email Service Configuration Error:",
            error.message
        );

        throw error;
    }
};

// ======================================================
// VERIFY MAIL CONFIGURATION
// ======================================================
//
// server.js isi function ko call kar raha hai.
// ======================================================

const verifyMailConfiguration = async () => {
    try {

        if (!env.RESEND_API_KEY) {
            throw new Error(
                "RESEND_API_KEY is not configured."
            );
        }

        if (!env.MAIL_FROM) {
            throw new Error(
                "MAIL_FROM is not configured."
            );
        }

        console.log(
            "Email Service Connected Successfully"
        );

        return true;

    } catch (error) {

        console.error(
            "Email Service Connection Error:",
            error.message
        );

        return false;
    }
};

// ======================================================
// SEND INSPECTION REPORT EMAIL
// ======================================================

const sendInspectionReportEmail = async ({
    to,
    subject,
    customerName,
    pdfPath,
    fileName
}) => {

    // ==================================================
    // VALIDATE RECIPIENT
    // ==================================================

    if (!to) {
        throw new Error(
            "Recipient email is required."
        );
    }

    // ==================================================
    // VALIDATE PDF
    // ==================================================

    if (!pdfPath) {
        throw new Error(
            "PDF path is required."
        );
    }

    // ==================================================
    // CHECK PDF EXISTS
    // ==================================================

    if (!fs.existsSync(pdfPath)) {
        throw new Error(
            `PDF file not found: ${pdfPath}`
        );
    }

    // ==================================================
    // VALIDATE RESEND CONFIGURATION
    // ==================================================

    if (!env.RESEND_API_KEY) {
        throw new Error(
            "RESEND_API_KEY is not configured."
        );
    }

    if (!env.MAIL_FROM) {
        throw new Error(
            "MAIL_FROM is not configured."
        );
    }

    // ==================================================
    // READ PDF
    // ==================================================

    const pdfBuffer =
        fs.readFileSync(pdfPath);

    // ==================================================
    // EMAIL DATA
    // ==================================================

    const emailData = {

        from:
            env.MAIL_FROM,

        to: [
            to
        ],

        subject:
            subject ||
            "Carsey.in - Vehicle Inspection Report",

        html: `
            <div
                style="
                    font-family: Arial, sans-serif;
                    max-width: 700px;
                    margin: auto;
                    padding: 30px;
                    color: #172033;
                    background: #ffffff;
                "
            >

                <h1
                    style="
                        margin-bottom: 10px;
                    "
                >
                    Carsey.in
                </h1>

                <h2>
                    Vehicle Inspection Report
                </h2>

                <p>
                    Hello ${customerName || "Customer"},
                </p>

                <p>
                    Your vehicle inspection report
                    is attached with this email.
                </p>

                <p>
                    Please find the inspection report
                    PDF attached below.
                </p>

                <br>

                <p>
                    Regards,
                </p>

                <strong>
                    Carsey.in Team
                </strong>

            </div>
        `,

        attachments: [
            {
                filename:
                    fileName ||
                    "inspection-report.pdf",

                content:
                    pdfBuffer
            }
        ]
    };

    // ==================================================
    // SEND EMAIL USING RESEND
    // ==================================================

    const result =
        await resend.emails.send(
            emailData
        );

    // ==================================================
    // CHECK RESEND ERROR
    // ==================================================

    if (result.error) {

        console.error(
            "Resend Email Error:",
            result.error
        );

        throw new Error(
            result.error.message ||
            "Failed to send email."
        );
    }

    // ==================================================
    // LOG
    // ==================================================

    console.log(
        "Inspection Report Email Sent:",
        result.data?.id
    );

    // ==================================================
    // RETURN
    // ==================================================

    return {

        messageId:
            result.data?.id || null,

        accepted: [
            to
        ],

        rejected: []
    };
};

// ======================================================
// SEND ADMIN INSPECTION REPORT
// ======================================================

const sendInspectionReportToAdmin = async ({
    pdfPath,
    fileName,
    carId,
    reportId
}) => {

    // ==================================================
    // ADMIN EMAIL VALIDATION
    // ==================================================

    if (!env.ADMIN_EMAIL) {

        throw new Error(
            "ADMIN_EMAIL is not configured."
        );
    }

    // ==================================================
    // SEND TO ADMIN
    // ==================================================

    return await sendInspectionReportEmail({

        to:
            env.ADMIN_EMAIL,

        subject:
            `Carsey.in - Vehicle Inspection Report #${reportId}`,

        customerName:
            "Admin",

        pdfPath,

        fileName
    });
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {

    verifyEmailConnection,

    verifyMailConfiguration,

    sendInspectionReportEmail,

    sendInspectionReportToAdmin
};