import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import Notification from '../models/Notification.model.js';

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '2d' }
  );
};

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, role, fields } = req.body;

    if (!name || !email || !password || !role || !fields) {
      return res.status(400).json({ message: 'Name, email, password, role and fields are required.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (role === 'ADMIN') {
      return res.status(403).json({ message: 'Admin accounts cannot be created via public signup.' });
    }

    const allowedRoles = ['TECHNICIAN', 'CLIENT'];
    const userRole = allowedRoles.includes(role) ? role : 'CLIENT';
    
    const isActive = userRole !== 'TECHNICIAN';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: userRole,
      isActive,
      fields: userRole === 'TECHNICIAN' ? fields || [] : [],
    });

    if (userRole === 'TECHNICIAN') {
      const admin = await User.findOne({ role: 'ADMIN' });
      if (admin) {
        await Notification.create({
          recipient: admin._id,
          sender: user._id,
          message: `New technician "${user.name}" has signed up and awaits approval.`,
          type: 'TECH_SIGNUP',
        });
      }
    }

    const token = generateToken(user);

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        fields: user.fields,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated. Contact admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  res.json({ user: req.user });
};

// Remove module.exports

