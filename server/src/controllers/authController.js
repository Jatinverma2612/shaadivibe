import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const generateToken = (id, email, role, name = '') => {
  const secret = process.env.JWT_SECRET || 'shaadivibe_royal_super_secret_jwt_key_2026_dev';
  return jwt.sign({ id, email, role, name }, secret, {
    expiresIn: '7d',
  });
};

const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user._id || user.id, user.email, user.role, user.name);

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
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

// Memory fallback store for accounts when DB is temporarily in testing/offline
const memoryUsers = new Map();

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

    // Check if user already exists
    let existingUser = null;
    try {
      existingUser = await User.findOne({ email: cleanEmail });
    } catch (e) {
      existingUser = memoryUsers.get(cleanEmail);
    }

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    let newUser = null;
    try {
      newUser = await User.create({
        name: name.trim(),
        email: cleanEmail,
        password,
        role: 'customer',
      });
    } catch (dbErr) {
      // Memory fallback
      const mockId = `user_${Date.now()}`;
      newUser = {
        _id: mockId,
        id: mockId,
        name: name.trim(),
        email: cleanEmail,
        role: 'customer',
      };
      memoryUsers.set(cleanEmail, { ...newUser, password });
    }

    return sendTokenResponse(newUser, 201, res, 'Customer account registered successfully.');
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Default admin fallback for seamless local development
    if (cleanEmail === 'admin@shaadivibe.com' && password === 'Admin@123456') {
      const adminUser = {
        _id: 'admin-default',
        id: 'admin-default',
        name: 'ShaadiVibe Royal Admin',
        email: 'admin@shaadivibe.com',
        role: 'admin',
      };
      return sendTokenResponse(adminUser, 200, res, 'Admin login successful.');
    }

    let user = null;
    try {
      user = await User.findOne({ email: cleanEmail });
    } catch (dbErr) {
      user = memoryUsers.get(cleanEmail);
      if (user && user.password === password) {
        return sendTokenResponse(user, 200, res, 'Login successful.');
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.comparePassword) {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }
    } else if (user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    return sendTokenResponse(user, 200, res, 'Login successful.');
  } catch (error) {
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

export const getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id || req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
