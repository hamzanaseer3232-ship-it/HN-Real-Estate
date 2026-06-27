import { v2 as cloudinary, ConfigOptions } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

let isConfigured = false;

export function configureCloudinary(): void {
  if (isConfigured) return;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn(
      "⚠️ Cloudinary keys are missing in your environment configuration! Falling back to standard local/in-memory file processing for the UI preview."
    );
    return;
  }

  const config: ConfigOptions = {
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  };

  cloudinary.config(config);
  isConfigured = true;
  console.log("✅ Cloudinary connected successfully!");
}

export function getCloudinary() {
  configureCloudinary();
  return cloudinary;
}

export function getMulterStorage() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (
    !cloudName ||
    !apiKey ||
    !apiSecret ||
    cloudName === "your_cloud_name_here" ||
    apiKey === "your_api_key_here" ||
    apiSecret === "your_api_secret_here"
  ) {
    // If not configured or set to default templates, return fallback memoryStorage so the app doesn't crash on startup
    return multer.memoryStorage();
  }

  configureCloudinary();

  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (_req, _file) => {
      return {
        folder: "hamza_real_estate",
        resource_type: "auto",
        allowed_formats: ["jpg", "jpeg", "png", "mp4", "mov", "avi", "webm"],
        chunk_size: 6000000,
      } as any;
    },
  });
}

// Configured Multer Instance
export const upload = multer({
  storage: getMulterStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max payload limit
  },
});
