import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { prisma } from './db/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import app from './app';

const execAsync = promisify(exec);
const PORT = process.env.PORT || 3000;

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
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Startup error:', error);
    process.exit(1);
  }
}
startServer();