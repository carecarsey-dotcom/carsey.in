const multer = require("multer");
const path = require("path");
const fs = require("fs");


// ======================================================
// UPLOAD DIRECTORY
// ======================================================

const uploadDirectory = path.join(
    process.cwd(),
    "uploads",
    "sell-cars"
);


// ======================================================
// CREATE DIRECTORY IF NOT EXISTS
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

    // --------------------------------------------------
    // DESTINATION
    // --------------------------------------------------

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


    // --------------------------------------------------
    // FILE NAME
    // --------------------------------------------------

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
            `${Date.now()}-${Math.round(
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

    // --------------------------------------------------
    // ALLOWED MIME TYPES
    // --------------------------------------------------

    const allowedMimeTypes = [

        "image/jpeg",

        "image/jpg",

        "image/png",

        "image/webp"

    ];


    // --------------------------------------------------
    // CHECK FILE TYPE
    // --------------------------------------------------

    if (
        allowedMimeTypes.includes(
            file.mimetype
        )
    ) {

        return cb(
            null,
            true
        );

    }


    // --------------------------------------------------
    // INVALID FILE
    // --------------------------------------------------

    return cb(
        new Error(
            "Only JPG, JPEG, PNG and WEBP images are allowed."
        ),
        false
    );

};


// ======================================================
// MULTER CONFIGURATION
// ======================================================

const uploadSellCarImages = multer({

    storage,

    fileFilter,

    limits: {

        // Maximum 5 MB per image

        fileSize:
            5 * 1024 * 1024

    }

});


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    uploadSellCarImages

};