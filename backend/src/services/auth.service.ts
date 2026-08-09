import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export async function registerUser(email: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('Email already in use');
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, password: hashed } });
  return { id: user.id, email: user.email, createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString() };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid email or password');
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Invalid email or password');
  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  return {
    token,
    user: { id: user.id, email: user.email, createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString() },
  };
}

export async function getUserById(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  return { id: user.id, email: user.email, createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString() };
}