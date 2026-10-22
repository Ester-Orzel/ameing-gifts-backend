import type { Request, Response } from 'express';

/** כתובת שלא קיימת בשרת */
export function notFound(req: Request, res: Response): void {
  res.status(404).json({
    error: { code: 'ROUTE_NOT_FOUND', message: `הכתובת ${req.method} ${req.path} לא קיימת` },
  });
}
