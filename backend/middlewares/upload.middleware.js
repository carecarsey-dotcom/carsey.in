const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ======================================================
// RAILWAY VOLUME
// ======================================================
//
// Railway Volume mount path:
// /app/uploads
//
// Local development:
// backend/uploads
//
// ======================================================

const railwayUploadRoot = "/app/uploads";

const localUploadRoot = path.join(
    __dirname,
    "..",
    "uploads"
);

// ======================================================
// SELECT UPLOAD ROOT
// ======================================================

const uploadRootDirectory = fs.existsSync(
    railwayUploadRoot
)
    ? railwayUploadRoot
    : localUploadRoot;

// ======================================================
// VEHICLE UPLOAD DIRECTORY
// ======================================================

const uploadDirectory = path.join(
    uploadRootDirectory,
    "vehicles"
);

// ======================================================
// CREATE UPLOAD DIRECTORY
// ======================================================

if (!fs.existsSync(uploadRootDirectory)) {
    fs.mkdirSync(
        uploadRootDirectory,
        {
            recursive: true
        }
    );
}

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(
        uploadDirectory,
        {
            recursive: true
        }
    );
}

// ======================================================
// DEBUG
// ======================================================

console.log(
    "=========================================="
);

console.log(
    "UPLOAD ROOT DIRECTORY:"
);

console.log(
    uploadRootDirectory
);

console.log(
    "VEHICLE UPLOAD DIRECTORY:"
);

console.log(
    uploadDirectory
);

console.log(
    "RAILWAY VOLUME EXISTS:"
);

console.log(
    fs.existsSync(railwayUploadRoot)
);

console.log(
    "=========================================="
);

// ======================================================
// MULTER STORAGE
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

        // Make absolutely sure folder exists
        if (!fs.existsSync(uploadDirectory)) {

            fs.mkdirSync(
                uploadDirectory,
                {
                    recursive: true
                }
            );
        }

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
        /\.(jpeg|jpg|png|webp)$/i;

    const allowedMimeTypes =
        /^(image\/jpeg|image\/jpg|image\/png|image\/webp)$/i;

    const extensionValid =
        allowedExtensions.test(
            file.originalname
        );

    const mimeTypeValid =
        allowedMimeTypes.test(
            file.mimetype
        );

    if (
        extensionValid &&
        mimeTypeValid
    ) {

        return cb(
            null,
            true
        );
    }

    return cb(
        new Error(
            "Only JPG, JPEG, PNG and WEBP images are allowed."
        ),
        false
    );
};

// ======================================================
// MULTER
// ======================================================

const upload = multer({

    storage,

    limits: {

        // Maximum 5 MB per image
        fileSize:
            5 * 1024 * 1024,

        // Maximum 10 images
        files: 10
    },

    fileFilter

});

// ======================================================
// EXPORT
// ======================================================

module.exports = upload;