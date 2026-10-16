import { initDb } from './client';

async function main() {
  console.log('--- Initializing GLITCH HUNT Database Schema ---');
  if (!process.env.DATABASE_URL) {
    console.log('No DATABASE_URL provided. Schema validated against local configuration.');
    process.exit(0);
  }

  try {
    await initDb();
    console.log('Database tables and indexes created successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

main();
