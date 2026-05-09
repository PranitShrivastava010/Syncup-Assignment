import multer from "multer";
import type { UploadApiResponse } from "cloudinary";
import {
  assertCloudinaryConfig,
  cloudinaryClient,
  CLOUDINARY_RESUME_FOLDER,
} from "./cloudinary";

const storage = multer.memoryStorage();

export const resumeUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      cb(new Error("Only PDF files are allowed"));
      return;
    }

    cb(null, true);
  },
});

const sanitizeFileName = (fileName: string) =>
  fileName.replace(/[^a-zA-Z0-9._-]/g, "_");

export type StoredFile = {
  storagePath: string;
  fileUrl: string;
};

export const uploadResumeFile = async (
  file: Express.Multer.File
): Promise<StoredFile> => {
  if (!file) {
    throw new Error("No file provided");
  }

  const fileName = `${Date.now()}-${sanitizeFileName(file.originalname)}`;
  assertCloudinaryConfig();

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinaryClient.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: CLOUDINARY_RESUME_FOLDER,
        public_id: fileName,
        overwrite: false,
      },
      (error, uploadResult) => {
        if (error) {
          reject(error);
          return;
        }

        if (!uploadResult) {
          reject(new Error("Cloudinary upload failed"));
          return;
        }

        resolve(uploadResult);
      }
    );

    stream.end(file.buffer);
  });

  return {
    storagePath: result.public_id,
    fileUrl: result.secure_url,
  };
};
