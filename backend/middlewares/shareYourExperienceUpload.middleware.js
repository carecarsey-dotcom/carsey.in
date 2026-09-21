const multer = require("multer");
const path = require("path");
const fs = require("fs");


// ======================================================
// UPLOAD DIRECTORY
// ======================================================

const uploadDirectory = path.join(
    __dirname,
    "../uploads/share-your-experience"
);


// ======================================================
// CREATE DIRECTORY IF NOT EXISTS
// ======================================================

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, {
        recursive: true
    });
}


// ======================================================
// STORAGE
// ======================================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(
            null,
            uploadDirectory
        );

    },


    filename: (req, file, cb) => {

        const extension =
            path.extname(
                file.originalname
            ).toLowerCase();


        const uniqueName =
            `share-your-experience-${Date.now()}-${Math.round(
                Math.random() * 1e9
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

    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ];


    if (
        allowedTypes.includes(
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

const shareYourExperienceUpload =
    multer({

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

module.exports =
    shareYourExperienceUpload;