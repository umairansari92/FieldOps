import express from 'express';
const router = express.Router();
import { getNotifications, markAllRead, markOneRead } from '../controllers/notification.controller.js';
import auth from '../middleware/auth.middleware.js';

router.use(auth);

router.get('/', getNotifications);
router.patch('/mark-all-read', markAllRead);
router.patch('/:id/read', markOneRead);

export default router;
