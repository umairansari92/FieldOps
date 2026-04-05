const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJobById,
  createJob,
  assignJob,
  updateStatus,
  addNote,
  getStats,
} = require('../controllers/job.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

// All job routes require authentication
router.use(auth);

// GET /api/jobs/stats — Admin only
router.get('/stats', role('ADMIN'), getStats);

// GET /api/jobs — Role-filtered list
router.get('/', getJobs);

// POST /api/jobs — Admin and Client
router.post('/', role('ADMIN', 'CLIENT'), createJob);

// GET /api/jobs/:id
router.get('/:id', getJobById);

// PATCH /api/jobs/:id/assign — Admin only
router.patch('/:id/assign', role('ADMIN'), assignJob);

// PATCH /api/jobs/:id/status — Admin or Technician
router.patch('/:id/status', role('ADMIN', 'TECHNICIAN'), updateStatus);

// POST /api/jobs/:id/notes — Admin or Technician
router.post('/:id/notes', role('ADMIN', 'TECHNICIAN'), addNote);

module.exports = router;
