import express from 'express';
const router = express.Router();
import { getUsers, getUserById, toggleUserStatus } from '../controllers/user.controller.js';
import auth from '../middleware/auth.middleware.js';
import role from '../middleware/role.middleware.js';

// All user management routes require Admin
router.use(auth, role('ADMIN'));

router.get('/', getUsers);
router.get('/:id', getUserById);
router.patch('/:id/status', toggleUserStatus);

export default router;
