import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { isDatabaseConnected } from '../config/db.js';

export const extractToken = (req) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  if (req.headers.cookie) {
    const match = req.headers.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
  }
  return null;
};

/**
 * Protect middleware: strictly validates JWT and verifies that the corresponding
 * user document actively exists in MongoDB. Never synthesizes req.user from claims alone.
 */
export const protect = async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'shaadivibe_royal_super_secret_jwt_key_2026_dev';
    const decoded = jwt.verify(token, secret);

    if (!decoded || !decoded.id) {
      return res.status(401).json({ success: false, message: 'Invalid token payload.' });
    }

    if (!isDatabaseConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Authentication service temporarily unavailable. Database connection offline.',
      });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account no longer exists or session has been invalidated.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
    }
    if (error.name === 'MongoServerSelectionError' || error.name === 'MongoNetworkError') {
      return res.status(503).json({
        success: false,
        message: 'Authentication service temporarily unavailable. Database connection timeout.',
      });
    }
    return res.status(401).json({ success: false, message: 'Authentication failed.' });
  }
};

/**
 * Admin authorization middleware: verifies that the authenticated database user has role: 'admin'
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden. Admin privileges required.' });
  }
  next();
};

export const protectAdmin = [protect, requireAdmin];

/**
 * Optional authentication: for public routes that allow personalized data if logged in.
 * Verifies token and database user if token is supplied. An invalid or missing token
 * results in req.user = null without granting privileges or blocking public access.
 */
export const optionalAuth = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const secret = process.env.JWT_SECRET || 'shaadivibe_royal_super_secret_jwt_key_2026_dev';
    const decoded = jwt.verify(token, secret);

    if (decoded && decoded.id && isDatabaseConnected()) {
      const user = await User.findById(decoded.id).select('-password');
      req.user = user || null;
    } else {
      req.user = null;
    }
  } catch (err) {
    req.user = null;
  }
  next();
};

