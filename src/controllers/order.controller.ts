import type { Request, Response } from 'express';
import * as orderService from '../services/order.service';
import { parseIdParam, requireUser } from '../utils/request';
import {
  adminOrderListQuerySchema,
  myOrderListQuerySchema,
  orderCreateSchema,
  orderStatusUpdateSchema,
} from '../validation/order.schemas';

export async function create(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const input = orderCreateSchema.parse(req.body);
  res.status(201).json(await orderService.createOrder(user.id, input));
}

export async function listMine(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const query = myOrderListQuerySchema.parse(req.query);
  res.json(await orderService.listMyOrders(user.id, query));
}

export async function listAll(req: Request, res: Response): Promise<void> {
  const query = adminOrderListQuerySchema.parse(req.query);
  res.json(await orderService.listAllOrders(query));
}

export async function getById(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  res.json(await orderService.getOrder(parseIdParam(req), user));
}

export async function updateStatus(req: Request, res: Response): Promise<void> {
  const id = parseIdParam(req);
  const { status } = orderStatusUpdateSchema.parse(req.body);
  res.json(await orderService.updateOrderStatus(id, status));
}
