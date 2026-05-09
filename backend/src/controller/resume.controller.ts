import { Request, Response } from "express";
import { calculateResumeMatchService } from "../service/ai.service";
import {
  getMyResumesService,
  uploadResumeService,
} from "../service/resume.service";
import { asyncHandler } from "../utils/asyncHandler";

export const uploadResumeController = asyncHandler(
  async (req: Request, res: Response) => {
    const resume = await uploadResumeService(req.user!.userId, req.file!);

    res.status(201).json({
      success: true,
      message: "Resume uploaded successfully",
      result: resume,
    });
  }
);

export const getMyResumesController = asyncHandler(
  async (req: Request, res: Response) => {
    const resumes = await getMyResumesService(req.user!.userId);

    res.status(200).json({
      success: true,
      result: resumes,
    });
  }
);

export const matchResumeController = asyncHandler(
  async (req: Request, res: Response) => {
    const match = await calculateResumeMatchService({
      userId: req.user!.userId,
      resumeId: req.params.resumeId as string,
      jobId: req.params.jobId as string,
    });

    res.status(200).json({
      success: true,
      result: match,
    });
  }
);
