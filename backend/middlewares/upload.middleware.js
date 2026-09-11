const multer = require("multer");
const path = require("path");
const fs = require("fs");

const railwayUploadRoot = "/app/uploads";

const localUploadRoot = path.join(
    __dirname,
    "..",
    "uploads"
);

const uploadRootDirectory = fs.existsSync(railwayUploadRoot)
    ? railwayUploadRoot
    : localUploadRoot;

const uploadDirectory = path.join(
    uploadRootDirectory,
    "vehicles"
);

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(
        uploadDirectory,
        { recursive: true }
    );
}

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        if (!fs.existsSync(uploadDirectory)) {
            fs.mkdirSync(
                uploadDirectory,
                { recursive: true }
            );
        }

        cb(
            null,
            uploadDirectory
        );
    },

    filename: (req, file, cb) => {

        let extension = path
            .extname(file.originalname || "")
            .toLowerCase();

        /*
         * Agar video mein extension nahi hai,
         * MIME type se suitable extension denge.
         */
        if (!extension && String(file.mimetype || "").startsWith("video/")) {

            const mimeToExtension = {
                "video/mp4": ".mp4",
                "video/webm": ".webm",
                "video/quicktime": ".mov",
                "video/x-matroska": ".mkv",
                "video/x-msvideo": ".avi",
                "video/3gpp": ".3gp",
                "video/3gpp2": ".3g2",
                "video/x-m4v": ".m4v",
                "video/mpeg": ".mpeg",
                "video/mp2t": ".ts",
                "video/ogg": ".ogv"
            };

            extension =
                mimeToExtension[
                    String(file.mimetype || "").toLowerCase()
                ] || ".video";
        }

        const uniqueName =
            `${Date.now()}-${Math.round(Math.random() * 1E9)}${extension}`;

        cb(
            null,
            uniqueName
        );
    }
});


const fileFilter = (req, file, cb) => {

    const originalName =
        String(file.originalname || "");

    const mimeType =
        String(file.mimetype || "").toLowerCase();

    const extension =
        path.extname(originalName).toLowerCase();


    // ==================================================
    // IMAGES
    // ==================================================

    const allowedImageExtensions = [
        ".jpeg",
        ".jpg",
        ".png",
        ".webp"
    ];

    const allowedImageMimeTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ];

    const isValidImage =
        allowedImageExtensions.includes(extension) &&
        allowedImageMimeTypes.includes(mimeType);


    // ==================================================
    // VIDEOS
    // ==================================================
    //
    // IMPORTANT:
    // Kisi specific video format ko hard-code nahi kar rahe.
    //
    // video/mp4
    // video/webm
    // video/quicktime
    // video/x-matroska
    // video/x-msvideo
    // video/3gpp
    // video/mpeg
    // etc.
    //
    // Sab video/* MIME types accept honge.
    //

    const isVideoByMime =
        mimeType.startsWith("video/");


    // ==================================================
    // VIDEO EXTENSION FALLBACK
    // ==================================================
    //
    // Kuch systems/browser video ka MIME type
    // application/octet-stream bhej sakte hain.
    //
    // Isliye common video extensions ko bhi accept karenge.
    //

    const allowedVideoExtensions = [
        ".mp4",
        ".webm",
        ".mov",
        ".m4v",
        ".avi",
        ".mkv",
        ".3gp",
        ".3g2",
        ".mpeg",
        ".mpg",
        ".mts",
        ".m2ts",
        ".ts",
        ".ogv",
        ".wmv",
        ".flv",
        ".vob",
        ".asf",
        ".f4v",
        ".mxf",
        ".rm",
        ".rmvb"
    ];

    const isVideoByExtension =
        allowedVideoExtensions.includes(extension);


    // ==================================================
    // ACCEPT
    // ==================================================

    if (
        isValidImage ||
        isVideoByMime ||
        isVideoByExtension
    ) {

        return cb(
            null,
            true
        );
    }


    // ==================================================
    // REJECT
    // ==================================================

    return cb(
        new Error(
            "Only JPG, JPEG, PNG, WEBP images and video files are allowed."
        ),
        false
    );
};


const upload = multer({

    storage,

    limits: {

        /*
         * Images + videos.
         *
         * Frontend videos already compressed hain,
         * but backend 25 MB tak allow karega.
         */
        fileSize:
            25 * 1024 * 1024,

        /*
         * Inspection submit mein:
         * vehicle photos
         * documents
         * detailed images
         * inspection videos
         * test drive photos/video
         *
         * sab aa sakte hain.
         */
        files: 120
    },

    fileFilter
});


module.exports = upload;