const { execSync } = require('child_process');
require('dotenv').config();

console.log("🚀 Syncing Schema with Vercel Postgres...");

// Force SSL
if (process.env.DATABASE_URL) {
       if (!process.env.DATABASE_URL.includes('sslmode=')) {
              process.env.DATABASE_URL += (process.env.DATABASE_URL.includes('?') ? '&' : '?') + 'sslmode=require';
       }
}

try {
       // Pass current env (with loaded variables) to the child process
       execSync('npx prisma db push --accept-data-loss', {
              stdio: 'inherit',
              env: { ...process.env }
       });
       console.log("✅ Schema Synced Successfully.");
} catch (error) {
       console.error("❌ Schema Sync Failed.");
       process.exit(1);
}
