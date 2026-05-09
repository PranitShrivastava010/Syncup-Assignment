import type { RequestHandler } from "express";
import { z } from "zod";

export const validate =
  (schema: z.ZodTypeAny): RequestHandler =>
  (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    next();
  };
