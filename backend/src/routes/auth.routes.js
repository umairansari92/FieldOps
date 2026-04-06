import express from 'express';
const router = express.Router();
import { register, login, getMe } from '../controllers/auth.controller.js';
import auth from '../middleware/auth.middleware.js';

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me — Protected
router.get('/me', auth, getMe);

export default router;
