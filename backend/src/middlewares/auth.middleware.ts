import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export interface AuthRequest extends Request {
  user?: { userId: number; email: string };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'No token' } });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid token format' } });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid token' } });
  }
}