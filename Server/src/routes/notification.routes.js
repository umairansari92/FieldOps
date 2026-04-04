const express = require('express');
const router = express.Router();
const { getNotifications, markAllRead, markOneRead } = require('../controllers/notification.controller');
const auth = require('../middleware/auth.middleware');

router.use(auth);

router.get('/', getNotifications);
router.patch('/mark-all-read', markAllRead);
router.patch('/:id/read', markOneRead);

module.exports = router;
