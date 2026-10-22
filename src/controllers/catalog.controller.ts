import type { Request, Response } from 'express';
import * as catalogService from '../services/catalog.service';
import { parseIdParam } from '../utils/request';
import {
  categoryCreateSchema,
  categoryUpdateSchema,
  colorCreateSchema,
  colorUpdateSchema,
  fontCreateSchema,
  fontUpdateSchema,
} from '../validation/catalog.schemas';

// ---------- קטגוריות ----------
export async function listCategories(_req: Request, res: Response): Promise<void> {
  res.json(await catalogService.listCategories());
}
export async function createCategory(req: Request, res: Response): Promise<void> {
  res.status(201).json(await catalogService.createCategory(categoryCreateSchema.parse(req.body)));
}
export async function updateCategory(req: Request, res: Response): Promise<void> {
  const id = parseIdParam(req);
  res.json(await catalogService.updateCategory(id, categoryUpdateSchema.parse(req.body)));
}

// ---------- גופנים ----------
export async function listFonts(_req: Request, res: Response): Promise<void> {
  res.json(await catalogService.listFonts());
}
export async function createFont(req: Request, res: Response): Promise<void> {
  res.status(201).json(await catalogService.createFont(fontCreateSchema.parse(req.body)));
}
export async function updateFont(req: Request, res: Response): Promise<void> {
  const id = parseIdParam(req);
  res.json(await catalogService.updateFont(id, fontUpdateSchema.parse(req.body)));
}

// ---------- צבעים ----------
export async function listColors(_req: Request, res: Response): Promise<void> {
  res.json(await catalogService.listColors());
}
export async function createColor(req: Request, res: Response): Promise<void> {
  res.status(201).json(await catalogService.createColor(colorCreateSchema.parse(req.body)));
}
export async function updateColor(req: Request, res: Response): Promise<void> {
  const id = parseIdParam(req);
  res.json(await catalogService.updateColor(id, colorUpdateSchema.parse(req.body)));
}
