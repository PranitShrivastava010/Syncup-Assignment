import { Request, Response } from "express";
import {
  createJobService,
  getJobByIdService,
  listJobsService,
} from "../service/jobs.service";
import { asyncHandler } from "../utils/asyncHandler";

const asString = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

const asBoolean = (value: unknown) => {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
};

export const createJobController = asyncHandler(
  async (req: Request, res: Response) => {
    const job = await createJobService(req.user!.userId, req.body);

    res.status(201).json({
      success: true,
      message: "Job posted successfully",
      result: job,
    });
  }
);

export const listJobsController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await listJobsService({
      query: asString(req.query.query),
      location: asString(req.query.location),
      isRemote: asBoolean(req.query.isRemote),
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  }
);

export const getJobByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const job = await getJobByIdService(req.params.id as string);

    res.status(200).json({
      success: true,
      result: job,
    });
  }
);
