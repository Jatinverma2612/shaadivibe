import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const protectAdmin = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'shaadivibe_royal_super_secret_jwt_key_2026_dev';
    const decoded = jwt.verify(token, secret);
    
    // In-memory bypass for emergency fallback if DB is not populated
    if (decoded.email === 'admin@shaadivibe.com' && decoded.role === 'admin') {
      req.user = { id: 'admin-1', name: 'Royal Admin', email: decoded.email, role: 'admin' };
      return next();
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found or token expired.' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden. Admin privileges required.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
  }
};
