import { uploadResumeFile } from "../config/multer";
import { prisma } from "../lib/prisma";
import { extractPdfText } from "../utils/extractPdfText";
import { createHttpError } from "../utils/httpError";

export const uploadResumeService = async (
  userId: string,
  file: Express.Multer.File
) => {
  if (!file) {
    throw createHttpError(400, "Resume file is required");
  }

  const [storedFile, extractedText] = await Promise.all([
    uploadResumeFile(file),
    extractPdfText(file.buffer),
  ]);

  return prisma.resume.create({
    data: {
      userId,
      originalName: file.originalname,
      storagePath: storedFile.storagePath,
      fileUrl: storedFile.fileUrl,
      extractedText,
    },
  });
};

export const getMyResumesService = async (userId: string) => {
  return prisma.resume.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

export const getResumeForUserService = async (
  userId: string,
  resumeId: string
) => {
  const resume = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      userId,
    },
  });

  if (!resume) {
    throw createHttpError(404, "Resume not found");
  }

  return resume;
};
