import type { Request, Response } from 'express';
import { prisma } from '../db/prisma';

/** בדיקת בריאות: השרת פעיל ומסד הנתונים מגיב */
export async function health(_req: Request, res: Response): Promise<void> {
  const base = { uptimeSeconds: Math.round(process.uptime()), timestamp: new Date().toISOString() };
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'ok', ...base });
  } catch {
    res.status(503).json({ status: 'error', database: 'unreachable', ...base });
  }
}
