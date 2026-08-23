const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ======================================================
// UPLOAD DIRECTORY
// ======================================================

const uploadDirectory = path.join(
    __dirname,
    "..",
    "uploads",
    "vehicles"
);

// Folder automatically create ho jayega
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(
        uploadDirectory,
        {
            recursive: true
        }
    );
}

// ======================================================
// STORAGE
// ======================================================

const storage = multer.diskStorage({

    destination: (
        req,
        file,
        cb
    ) => {

        cb(
            null,
            uploadDirectory
        );
    },

    filename: (
        req,
        file,
        cb
    ) => {

        const extension =
            path.extname(
                file.originalname
            ).toLowerCase();

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(
                Math.random() * 1E9
            ) +
            extension;

        cb(
            null,
            uniqueName
        );
    }

});

// ======================================================
// FILE FILTER
// ======================================================

const fileFilter = (
    req,
    file,
    cb
) => {

    const allowedExtensions =
        /jpeg|jpg|png|webp/;

    const extension =
        allowedExtensions.test(
            path.extname(
                file.originalname
            ).toLowerCase()
        );

    const mimeType =
        allowedExtensions.test(
            file.mimetype
        );

    if (
        extension &&
        mimeType
    ) {

        return cb(
            null,
            true
        );
    }

    return cb(
        new Error(
            "Only JPG, JPEG, PNG and WEBP images are allowed."
        )
    );
};

// ======================================================
// MULTER
// ======================================================

const upload =
    multer({

        storage,

        limits: {

            fileSize:
                5 * 1024 * 1024,

            files: 10

        },

        fileFilter

    });

// ======================================================
// EXPORT
// ======================================================

module.exports =
    upload;