import { Request, Response } from "express";
import {
  applyToJobService,
  getMyApplicationsService,
  updateApplicationStatusService,
} from "../service/application.service";
import type { ApplicationStatus } from "../service/application.service";
import { asyncHandler } from "../utils/asyncHandler";
import { getPaginationParams } from "../utils/pagination";

export const applyToJobController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await applyToJobService(req.user!.userId, req.body);

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      result,
    });
  }
);

export const getMyApplicationsController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await getMyApplicationsService(
      req.user!.userId,
      getPaginationParams(req.query)
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  }
);

export const updateApplicationStatusController = asyncHandler(
  async (req: Request, res: Response) => {
    const application = await updateApplicationStatusService(
      req.user!.userId,
      req.params.id as string,
      req.body.status as ApplicationStatus
    );

    res.status(200).json({
      success: true,
      message: "Application status updated",
      result: application,
    });
  }
);
