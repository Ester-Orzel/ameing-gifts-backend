import { Router } from 'express';
import { health } from '../controllers/health.controller';
import { authRouter } from './auth.routes';
import { categoryRouter, colorRouter, fontRouter } from './catalog.routes';
import { orderRouter } from './order.routes';
import { productRouter } from './product.routes';

/** כל כתובות ה-API, תחת /api */
export const apiRouter = Router();

apiRouter.get('/health', health);
apiRouter.use('/auth', authRouter);
apiRouter.use('/categories', categoryRouter);
apiRouter.use('/fonts', fontRouter);
apiRouter.use('/colors', colorRouter);
apiRouter.use('/products', productRouter);
apiRouter.use('/orders', orderRouter);
