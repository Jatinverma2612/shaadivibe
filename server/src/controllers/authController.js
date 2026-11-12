import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { isDatabaseConnected } from '../config/db.js';

const generateToken = (id, email, role, name = '') => {
  const secret = process.env.JWT_SECRET || 'shaadivibe_royal_super_secret_jwt_key_2026_dev';
  return jwt.sign({ id, email, role, name }, secret, {
    expiresIn: '7d',
  });
};

const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user._id, user.email, user.role, user.name);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  };

  res.cookie('token', token, cookieOptions);

  return res.status(statusCode).json({
    success: true,
    message,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

/**
 * Register a new customer account directly into MongoDB
 * Rejects with 503 if database is unavailable. Never creates synthetic/memory accounts.
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (!isDatabaseConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Authentication service temporarily unavailable. Database connection offline.',
      });
    }

    // Check if user already exists in MongoDB
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: 'customer',
    });

    return sendTokenResponse(newUser, 201, res, 'Customer account registered successfully.');
  } catch (error) {
    if (error.name === 'MongoServerSelectionError' || error.name === 'MongoNetworkError') {
      return res.status(503).json({
        success: false,
        message: 'Authentication service temporarily unavailable. Database connection timeout.',
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }
    next(error);
  }
};

/**
 * Log in using verified credentials stored in MongoDB
 * Validates password using bcrypt. Rejects with 503 if database is unavailable.
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (!isDatabaseConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Authentication service temporarily unavailable. Database connection offline.',
      });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    return sendTokenResponse(user, 200, res, 'Login successful.');
  } catch (error) {
    if (error.name === 'MongoServerSelectionError' || error.name === 'MongoNetworkError') {
      return res.status(503).json({
        success: false,
        message: 'Authentication service temporarily unavailable. Database connection timeout.',
      });
    }
    next(error);
  }
};

export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  return res.json({
    success: true,
    message: 'Logged out successfully.',
  });
};

/**
 * Fetch authenticated customer/admin profile using verified database identity
 */
export const getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated.' });
    }
    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
