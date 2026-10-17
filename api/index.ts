import type { Request, Response } from "express";
import { app } from "../server";

/**
 * Vercel Serverless Function entrypoint.
 * Routes all incoming /api/* HTTP requests to the institutional Express backend.
 */
export default function handler(req: Request, res: Response) {
  return app(req, res);
}
