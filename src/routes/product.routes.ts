import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

export const productRouter = Router();

// ציבורי: גם בלי התחברות
productRouter.get('/', productController.list);
productRouter.get('/:id', productController.getById);

// מנהל בלבד
productRouter.post('/', authenticate, authorize('ADMIN'), productController.create);
productRouter.patch('/:id', authenticate, authorize('ADMIN'), productController.update);
