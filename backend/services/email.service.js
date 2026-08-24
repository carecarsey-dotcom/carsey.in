const nodemailer = require("nodemailer");

const env = require("../config/env");


// ======================================================
// CREATE MAIL TRANSPORTER
// ======================================================

const transporter =
    nodemailer.createTransport({
        host:
            env.MAIL_HOST,

        port:
            Number(env.MAIL_PORT),

        secure:
            false,

        family:
            4,

        auth: {
            user:
                env.MAIL_USER,

            pass:
                env.MAIL_PASS
        }
    });


// ======================================================
// VERIFY EMAIL CONNECTION
// ======================================================

const verifyEmailConnection = async () => {

    try {

        await transporter.verify();

        console.log(
            "Email Service Connected Successfully"
        );

        return true;

    } catch (error) {

        console.error(
            "Email Service Connection Error:",
            error.message
        );

        throw error;

    }

};


// ======================================================
// VERIFY MAIL CONFIGURATION
// ======================================================
// server.js isi function ko call kar raha hai.
// ======================================================

const verifyMailConfiguration = async () => {

    try {

        if (!transporter) {

            throw new Error(
                "Email transporter is not configured."
            );

        }


        await transporter.verify();


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
    // MAIL OPTIONS
    // ==================================================

    const mailOptions = {

        from:
            `"Carsey.in" <${env.MAIL_USER}>`,

        to,

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
                "
            >

                <h1>
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

                path:
                    pdfPath,

                contentType:
                    "application/pdf"

            }

        ]

    };


    // ==================================================
    // SEND EMAIL
    // ==================================================

    const info =
        await transporter.sendMail(
            mailOptions
        );


    // ==================================================
    // LOG
    // ==================================================

    console.log(
        "Inspection Report Email Sent:",
        info.messageId
    );


    // ==================================================
    // RETURN
    // ==================================================

    return {

        messageId:
            info.messageId,

        accepted:
            info.accepted,

        rejected:
            info.rejected

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