import { app } from './app.js';
import { env } from './config/env.js';
import { pool } from './config/db.js';

async function start() {
  await pool.query('SELECT 1');
  app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`Connectly API running on http://localhost:${env.PORT}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
