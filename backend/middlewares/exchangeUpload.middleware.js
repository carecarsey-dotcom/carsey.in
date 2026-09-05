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
// EXCHANGE UPLOAD DIRECTORY
// ======================================================

const uploadDirectory = path.join(
    uploadRootDirectory,
    "exchange"
);

// ======================================================
// CREATE DIRECTORY
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
    "EXCHANGE UPLOAD ROOT:"
);

console.log(
    uploadRootDirectory
);

console.log(
    "EXCHANGE UPLOAD DIRECTORY:"
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