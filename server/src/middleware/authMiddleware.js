import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

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

export const protect = async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'shaadivibe_royal_super_secret_jwt_key_2026_dev';
    const decoded = jwt.verify(token, secret);

    // Default admin fallback for seamless local development
    if (decoded.id === 'admin-default' || (decoded.email === 'admin@shaadivibe.com' && decoded.role === 'admin')) {
      req.user = {
        _id: 'admin-default',
        id: 'admin-default',
        name: 'ShaadiVibe Royal Admin',
        email: 'admin@shaadivibe.com',
        role: 'admin',
      };
      return next();
    }

    let user = null;
    try {
      user = await User.findById(decoded.id).select('-password');
    } catch (dbErr) {
      // Database connection fallback
    }

    if (!user) {
      if (decoded.id && decoded.email) {
        req.user = {
          _id: decoded.id,
          id: decoded.id,
          name: decoded.name || 'User',
          email: decoded.email,
          role: decoded.role || 'customer',
        };
        return next();
      }
      return res.status(401).json({ success: false, message: 'User not found or token expired.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden. Admin privileges required.' });
  }
  next();
};

export const protectAdmin = [protect, requireAdmin];

export const optionalAuth = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const secret = process.env.JWT_SECRET || 'shaadivibe_royal_super_secret_jwt_key_2026_dev';
    const decoded = jwt.verify(token, secret);

    if (decoded.id === 'admin-default' || (decoded.email === 'admin@shaadivibe.com' && decoded.role === 'admin')) {
      req.user = {
        _id: 'admin-default',
        id: 'admin-default',
        name: 'ShaadiVibe Royal Admin',
        email: 'admin@shaadivibe.com',
        role: 'admin',
      };
      return next();
    }

    let user = null;
    try {
      user = await User.findById(decoded.id).select('-password');
    } catch (e) {}

    if (user) {
      req.user = user;
    } else if (decoded.id && decoded.email) {
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        name: decoded.name || 'User',
        email: decoded.email,
        role: decoded.role || 'customer',
      };
    } else {
      req.user = null;
    }
  } catch (err) {
    req.user = null;
  }
  next();
};
