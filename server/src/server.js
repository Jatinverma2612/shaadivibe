import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from server root or monorepo root
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { seedDatabase } from '../scripts/seedData.js';

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');

const startServer = async () => {
  const server = app.listen(PORT, HOST, () => {
    console.log(`[ShaadiVibe Server] Running securely on http://${HOST}:${PORT}`);
  });

  const conn = await connectDB();
  if (conn) {
    await seedDatabase();
  }

  const handleShutdown = async (signal) => {
    console.log(`[ShaadiVibe Server] Received ${signal}. Closing connections gracefully...`);
    server.close(async () => {
      await disconnectDB();
      console.log('[ShaadiVibe Server] HTTP server and database connections closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));

  return server;
};

// Start server if executed directly
if (process.argv[1]?.includes('server.js')) {
  startServer();
}

export { startServer };
