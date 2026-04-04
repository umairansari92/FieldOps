const express = require('express');
const router = express.Router();
const { getUsers, getUserById, toggleUserStatus } = require('../controllers/user.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

// All user management routes require Admin
router.use(auth, role('ADMIN'));

router.get('/', getUsers);
router.get('/:id', getUserById);
router.patch('/:id/status', toggleUserStatus);

module.exports = router;
