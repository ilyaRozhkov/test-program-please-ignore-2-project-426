import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { rollbar } from './lib/rollbar';
import { prisma } from './db/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import app from './app';

const execAsync = promisify(exec);

const PORT = process.env.PORT;
if (!PORT) {
  console.error('❌ PORT environment variable is required');
  process.exit(1);
}

process.on('uncaughtException', (err: unknown) => {
  const error = err instanceof Error ? err : new Error(String(err));
  rollbar.error(error);
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  const error = reason instanceof Error ? reason : new Error(String(reason));
  rollbar.error(error);
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

async function applyMigrationsAndSeed() {
  console.log('Applying migrations...');
  await execAsync('npx prisma migrate deploy --schema prisma/schema.prisma');
  console.log('Migrations applied.');
  console.log('Seeding database...');
  await execAsync('npx prisma db seed --schema prisma/schema.prisma');
  console.log('Seed completed.');
}

async function startServer() {
  try {
    await prisma.$connect();
    console.log('Database connected.');
    await applyMigrationsAndSeed();
    app.listen(Number(PORT), () => console.log(`Server running on port ${PORT}`));
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('Startup error:', error);
    rollbar.error(error);
    process.exit(1);
  }
}

startServer();
