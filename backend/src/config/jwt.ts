const rawSecret = process.env.JWT_SECRET;
if (!rawSecret) {
  throw new Error('JWT_SECRET must be set in environment variables');
}
export const JWT_SECRET: string = rawSecret;
