import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export const cloudinaryClient = cloudinary;

export const assertCloudinaryConfig = () => {
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary credentials missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    );
  }
};

export const CLOUDINARY_RESUME_FOLDER =
  process.env.CLOUDINARY_RESUME_FOLDER || "syncup/resumes";
