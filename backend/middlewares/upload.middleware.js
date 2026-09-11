const multer = require("multer");
const path = require("path");
const fs = require("fs");

const railwayUploadRoot = "/app/uploads";
const localUploadRoot = path.join(__dirname, "..", "uploads");

const uploadRootDirectory = fs.existsSync(railwayUploadRoot)
    ? railwayUploadRoot
    : localUploadRoot;

const uploadDirectory = path.join(uploadRootDirectory, "vehicles");

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync(uploadDirectory)) {
            fs.mkdirSync(uploadDirectory, { recursive: true });
        }
        cb(null, uploadDirectory);
    },

    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${extension}`;
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedExtensions = /\.(jpeg|jpg|png|webp|mp4|webm|mov|m4v)$/i;
    const allowedMimeTypes = /^(image\/(jpeg|jpg|png|webp)|video\/(mp4|webm|quicktime|x-m4v))$/i;

    const extensionOk = allowedExtensions.test(file.originalname || "");
    const mimeOk = allowedMimeTypes.test(file.mimetype || "");

    if (extensionOk && mimeOk) {
        return cb(null, true);
    }

    return cb(
        new Error(
            "Only JPG, JPEG, PNG, WEBP images and MP4, WEBM, MOV videos are allowed."
        ),
        false
    );
};

const upload = multer({
    storage,
    limits: {
        // Compressed inspection videos are expected to stay below 25 MB.
        fileSize: 25 * 1024 * 1024,
        files: 100
    },
    fileFilter
});

module.exports = upload;
