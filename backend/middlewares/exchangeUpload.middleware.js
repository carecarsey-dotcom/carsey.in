const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ======================================================
// UPLOAD DIRECTORY
// ======================================================

const uploadDirectory = path.join(
    process.cwd(),
    "uploads",
    "exchange"
);


// ======================================================
// CREATE DIRECTORY
// ======================================================

if (!fs.existsSync(uploadDirectory)) {

    fs.mkdirSync(
        uploadDirectory,
        {
            recursive: true
        }
    );

}


// ======================================================
// STORAGE CONFIGURATION
// ======================================================

const storage = multer.diskStorage({

    // ==================================================
    // DESTINATION
    // ==================================================

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


    // ==================================================
    // FILE NAME
    // ==================================================

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
            `exchange-${Date.now()}-${Math.round(
                Math.random() * 1E9
            )}${extension}`;


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

    const allowedMimeTypes = [

        "image/jpeg",

        "image/jpg",

        "image/png",

        "image/webp"

    ];


    if (
        allowedMimeTypes.includes(
            file.mimetype
        )
    ) {

        cb(
            null,
            true
        );

    } else {

        cb(
            new Error(
                "Only JPG, JPEG, PNG and WEBP images are allowed."
            ),
            false
        );

    }

};


// ======================================================
// MULTER CONFIGURATION
// ======================================================

const exchangeUpload = multer({

    storage,

    fileFilter,

    limits: {

        fileSize:
            5 * 1024 * 1024

    }

});


// ======================================================
// EXPORT
// ======================================================

module.exports = exchangeUpload;