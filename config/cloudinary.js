import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// Configure Cloudinary once for the whole application
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to create a storage configuration for different resource types
const createStorage = (folder, filenameGenerator) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder,
      allowed_formats: ["jpg", "png", "jpeg", "gif"],
      public_id: filenameGenerator,
    },
  });
};

// Helper function to create an uploader for a specific resource type
const createUploader = (folder, filenameGenerator) => {
  const storage = createStorage(folder, filenameGenerator);
  return multer({ storage });
};

// Helper function to create an upload middleware with error handling
const createUploadMiddleware = (
  folder,
  filenameGenerator,
  fieldName = "image"
) => {
  const uploader = createUploader(folder, filenameGenerator);

  return (req, res, next) => {
    uploader.single(fieldName)(req, res, (err) => {
      if (err) {
        console.error("File upload error:", err);
        return res.status(400).json({
          success: false,
          message: "File upload failed",
          error: err.message,
        });
      }
 
      // Check if file was uploaded successfully and extract the URL and public_id
      if (req.file && req.file.path) {
        // Add the Cloudinary URL to the request body
        req.body.imageUrl = req.file.path;

        // If the public_id is not already set, try to extract it
        if (!req.file.public_id && req.file.filename) {
          req.file.public_id = req.file.filename;
        }
      }

      next();
    });
  };
};

export { cloudinary, createStorage, createUploader, createUploadMiddleware };
