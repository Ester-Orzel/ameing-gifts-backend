import { Router } from 'express';
import * as catalogController from '../controllers/catalog.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const adminOnly = authorize('ADMIN');

// קריאה: ציבורית. הוספה ועריכה: מנהל בלבד

export const categoryRouter = Router();
categoryRouter.get('/', catalogController.listCategories);
categoryRouter.post('/', authenticate, adminOnly, catalogController.createCategory);
categoryRouter.patch('/:id', authenticate, adminOnly, catalogController.updateCategory);

export const fontRouter = Router();
fontRouter.get('/', catalogController.listFonts);
fontRouter.post('/', authenticate, adminOnly, catalogController.createFont);
fontRouter.patch('/:id', authenticate, adminOnly, catalogController.updateFont);

export const colorRouter = Router();
colorRouter.get('/', catalogController.listColors);
colorRouter.post('/', authenticate, adminOnly, catalogController.createColor);
colorRouter.patch('/:id', authenticate, adminOnly, catalogController.updateColor);
