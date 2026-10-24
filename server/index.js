import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { seedDatabase } from './seed/seedData.js';

import authRoutes from './routes/authRoutes.js';
import themeRoutes from './routes/themeRoutes.js';
import invitationRoutes from './routes/invitationRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads serving
const uploadsDir = path.resolve(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Rate Limiter for API
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'ShaadiVibe Indian Wedding Invitation Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/upload', uploadRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Start server
const startServer = async () => {
  app.listen(PORT, '127.0.0.1', () => {
    console.log(`[ShaadiVibe Server] Running securely at http://127.0.0.1:${PORT}`);
  });

  const conn = await connectDB();
  if (conn) {
    await seedDatabase();
  }
};

startServer();
