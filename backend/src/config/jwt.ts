const rawSecret = process.env.JWT_SECRET || process.env.SESSION_SECRET;
const isTest = process.env.NODE_ENV === 'test';

if (!rawSecret && !isTest) {
  throw new Error('JWT_SECRET or SESSION_SECRET must be set in environment variables');
}

export const JWT_SECRET: string = rawSecret || 'testsecret';
