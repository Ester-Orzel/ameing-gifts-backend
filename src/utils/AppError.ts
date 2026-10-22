/**
 * שגיאה עם קוד HTTP ידוע מראש.
 * כל שגיאה כזו מגיעה ל-errorHandler והופכת לתשובת JSON אחידה.
 */
export interface ErrorDetail {
  field: string;
  message: string;
}

export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: ErrorDetail[],
  ) {
    super(message);
    this.name = 'AppError';
  }

  static badRequest(message: string, details?: ErrorDetail[]): AppError {
    return new AppError(400, 'VALIDATION_ERROR', message, details);
  }

  static unauthorized(message = 'נדרשת התחברות'): AppError {
    return new AppError(401, 'UNAUTHORIZED', message);
  }

  static forbidden(message = 'אין לך הרשאה לבצע פעולה זו'): AppError {
    return new AppError(403, 'FORBIDDEN', message);
  }

  static notFound(message = 'המשאב המבוקש לא נמצא'): AppError {
    return new AppError(404, 'NOT_FOUND', message);
  }

  static conflict(message: string): AppError {
    return new AppError(409, 'CONFLICT', message);
  }
}
