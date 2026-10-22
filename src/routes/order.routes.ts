import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

export const orderRouter = Router();

// כל כתובות ההזמנות דורשות התחברות
orderRouter.use(authenticate);

// לקוח בלבד
orderRouter.post('/', authorize('CUSTOMER'), orderController.create);
orderRouter.get('/my', authorize('CUSTOMER'), orderController.listMine);

// מנהל בלבד
orderRouter.get('/', authorize('ADMIN'), orderController.listAll);
orderRouter.patch('/:id/status', authorize('ADMIN'), orderController.updateStatus);

// לקוח (רק הזמנה שלו) או מנהל (כל הזמנה)
orderRouter.get('/:id', authorize('CUSTOMER', 'ADMIN'), orderController.getById);
