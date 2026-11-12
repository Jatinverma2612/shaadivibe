import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { UPLOAD_ROOT } from './middleware/uploadMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import themeRoutes from './routes/themeRoutes.js';
import invitationRoutes from './routes/invitationRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import rsvpRoutes from './routes/rsvpRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import adminTicketRoutes from './routes/adminTicketRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import { getConnectionStatus } from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Lightweight Cookie Parser Middleware
app.use((req, res, next) => {
  req.cookies = {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    cookieHeader.split(';').forEach((cookie) => {
      const [name, ...rest] = cookie.trim().split('=');
      if (name) {
        try {
          req.cookies[name] = decodeURIComponent(rest.join('='));
        } catch {
          req.cookies[name] = rest.join('=');
        }
      }
    });
  }
  next();
});

// Static uploads serving from server/uploads
if (!fs.existsSync(UPLOAD_ROOT)) {
  fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
}
app.use('/uploads', express.static(UPLOAD_ROOT));

// Rate Limiter for API
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = getConnectionStatus();
  res.json({
    status: dbStatus.isConnected ? 'healthy' : 'degraded',
    platform: 'ShaadiVibe Indian Wedding Invitation Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/customers', customerRoutes);
app.use('/api/admin/coupons', couponRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/admin/tickets', adminTicketRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/rsvp', rsvpRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin/payments', paymentRoutes);

// Error Handling Middleware
app.use(errorHandler);

export default app;
