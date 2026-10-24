import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const generateToken = (id, email, role) => {
  const secret = process.env.JWT_SECRET || 'shaadivibe_royal_super_secret_jwt_key_2026_dev';
  return jwt.sign({ id, email, role }, secret, {
    expiresIn: '7d',
  });
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    // Default admin fallback for seamless local development
    if (email.toLowerCase() === 'admin@shaadivibe.com' && password === 'Admin@123456') {
      const token = generateToken('admin-default', 'admin@shaadivibe.com', 'admin');
      return res.json({
        success: true,
        token,
        user: {
          id: 'admin-default',
          name: 'ShaadiVibe Royal Admin',
          email: 'admin@shaadivibe.com',
          role: 'admin',
        },
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = generateToken(user._id, user.email, user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};
