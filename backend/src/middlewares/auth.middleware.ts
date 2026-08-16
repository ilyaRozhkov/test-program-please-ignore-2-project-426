import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt';
import { prisma } from '../db/client';

export interface AuthRequest extends Request {
  user?: { userId: number; email: string };
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
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
    const revoked = await prisma.revokedToken.findUnique({ where: { token } });
    if (revoked) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Token revoked' } });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid or revoked token' } });
  }
}
