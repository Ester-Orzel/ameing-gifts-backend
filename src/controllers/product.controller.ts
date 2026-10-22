import type { Request, Response } from 'express';
import * as productService from '../services/product.service';
import { parseIdParam } from '../utils/request';
import {
  productCreateSchema,
  productListQuerySchema,
  productUpdateSchema,
} from '../validation/product.schemas';

export async function list(req: Request, res: Response): Promise<void> {
  const query = productListQuerySchema.parse(req.query);
  res.json(await productService.listProducts(query));
}

export async function getById(req: Request, res: Response): Promise<void> {
  res.json(await productService.getProduct(parseIdParam(req)));
}

export async function create(req: Request, res: Response): Promise<void> {
  const input = productCreateSchema.parse(req.body);
  res.status(201).json(await productService.createProduct(input));
}

export async function update(req: Request, res: Response): Promise<void> {
  const id = parseIdParam(req);
  const input = productUpdateSchema.parse(req.body);
  res.json(await productService.updateProduct(id, input));
}
