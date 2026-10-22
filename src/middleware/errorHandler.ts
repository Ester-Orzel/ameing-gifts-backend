import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError, type ErrorDetail } from '../utils/AppError';

/**
 * מקום אחד שמטפל בכל השגיאות ומחזיר תשובת JSON אחידה:
 * { "error": { "code": "...", "message": "...", "details": [...] } }
 */

function zodDetails(error: ZodError): ErrorDetail[] {
  return error.issues.map((issue) => ({
    field: issue.path.length > 0 ? issue.path.join('.') : '(body)',
    message: issue.message,
  }));
}

function send(res: Response, status: number, code: string, message: string, details?: ErrorDetail[]): void {
  res.status(status).json({ error: { code, message, ...(details && details.length > 0 ? { details } : {}) } });
}

interface BodyParserError {
  type?: string;
  status?: number;
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    send(res, err.status, err.code, err.message, err.details);
    return;
  }

  if (err instanceof ZodError) {
    send(res, 400, 'VALIDATION_ERROR', 'נתונים לא תקינים', zodDetails(err));
    return;
  }

  // גוף בקשה שאינו JSON תקין, או גדול מדי
  const bodyError = err as BodyParserError;
  if (bodyError && typeof bodyError === 'object' && bodyError.type === 'entity.parse.failed') {
    send(res, 400, 'INVALID_JSON', 'גוף הבקשה אינו JSON תקין');
    return;
  }
  if (bodyError && typeof bodyError === 'object' && bodyError.type === 'entity.too.large') {
    send(res, 413, 'PAYLOAD_TOO_LARGE', 'גוף הבקשה גדול מדי');
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      send(res, 409, 'CONFLICT', 'ערך זה כבר קיים במערכת');
      return;
    }
    if (err.code === 'P2025') {
      send(res, 404, 'NOT_FOUND', 'המשאב המבוקש לא נמצא');
      return;
    }
    if (err.code === 'P2003') {
      send(res, 400, 'VALIDATION_ERROR', 'הפניה לרשומה שלא קיימת');
      return;
    }
  }

  // שגיאה לא צפויה: לא חושפים פרטים פנימיים ללקוח
  // eslint-disable-next-line no-console
  console.error('Unexpected error:', err);
  send(res, 500, 'INTERNAL_ERROR', 'אירעה שגיאה בשרת. נסי שוב מאוחר יותר');
}
