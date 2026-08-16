const rawSecret = process.env.JWT_SECRET;
const isTest = process.env.NODE_ENV === 'test';

if (!rawSecret && !isTest) {
  throw new Error('JWT_SECRET must be set in environment variables');
}

export const JWT_SECRET: string = rawSecret || 'testsecret';
