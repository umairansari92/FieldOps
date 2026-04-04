const Job = require('../models/Job.model');
const User = require('../models/User.model');
const ActivityLog = require('../models/ActivityLog.model');
const Notification = require('../models/Notification.model');

// Helper to create an activity log entry
const logActivity = async (jobId, actorId, message, type, previousStatus = null, newStatus = null) => {
  await ActivityLog.create({ job: jobId, actor: actorId, message, type, previousStatus, newStatus });
};

// Helper to send a notification to a user
const notify = async (recipientId, message, jobId, type, senderId = null) => {
  if (recipientId) {
    await Notification.create({ recipient: recipientId, message, job: jobId, type, sender: senderId });
  }
};

// GET /api/jobs — Admins see all, Technicians see assigned, Clients see their own
const getJobs = async (req, res) => {
  try {
    let filter = {};
    const { status, priority } = req.query;

    if (req.user.role === 'TECHNICIAN') filter.technician = req.user._id;
    if (req.user.role === 'CLIENT') filter.client = req.user._id;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const jobs = await Job.find(filter)
      .populate('client', 'name email')
      .populate('technician', 'name email')
      .sort({ createdAt: -1 });

    res.json({ jobs, count: jobs.length });
  } catch (err) {
    console.error('getJobs error:', err);
    res.status(500).json({ message: 'Failed to fetch jobs.' });
  }
};

// GET /api/jobs/:id
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('client', 'name email')
      .populate('technician', 'name email');

    if (!job) return res.status(404).json({ message: 'Job not found.' });

    // Clients can only view their own jobs
    if (req.user.role === 'CLIENT' && job.client._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    // Technicians can only view their assigned jobs
    if (req.user.role === 'TECHNICIAN' && job.technician?._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const activityLog = await ActivityLog.find({ job: job._id })
      .populate('actor', 'name role')
      .sort({ createdAt: -1 });

    res.json({ job, activityLog });
  } catch (err) {
    console.error('getJobById error:', err);
    res.status(500).json({ message: 'Failed to fetch job.' });
  }
};

// POST /api/jobs — Admin only
const createJob = async (req, res) => {
  try {
    const { title, description, clientId, technicianId, scheduledAt, location, priority } = req.body;

    if (!title || !description || !clientId) {
      return res.status(400).json({ message: 'Title, description, and clientId are required.' });
    }

    // Enforce that Clients can only create jobs for themselves
    if (req.user.role === 'CLIENT' && clientId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Clients can only create jobs for themselves.' });
    }

    const client = await User.findById(clientId);
    if (!client || client.role !== 'CLIENT') {
      return res.status(400).json({ message: 'Invalid client ID.' });
    }

    const jobData = { title, description, client: clientId, priority: priority || 'MEDIUM', location };
    if (scheduledAt) jobData.scheduledAt = scheduledAt;

    if (technicianId) {
      const tech = await User.findById(technicianId);
      if (!tech || tech.role !== 'TECHNICIAN') {
        return res.status(400).json({ message: 'Invalid technician ID.' });
      }
      jobData.technician = technicianId;
      jobData.status = 'ASSIGNED';
    }

    const job = await Job.create(jobData);

    await logActivity(job._id, req.user._id, `Job "${title}" created.`, 'CREATION');
    await notify(clientId, `A new job "${title}" has been created for you.`, job._id, 'JOB_CREATED', req.user._id);

    if (req.user.role === 'CLIENT') {
      const admin = await User.findOne({ role: 'ADMIN' });
      if (admin) {
        await notify(admin._id, `Client ${req.user.name} submitted a new job request: "${title}".`, job._id, 'JOB_CREATED', req.user._id);
      }
    }

    if (technicianId) {
      await logActivity(job._id, req.user._id, `Job assigned to technician.`, 'ASSIGNMENT');
      await notify(technicianId, `You have been assigned a new job: "${title}".`, job._id, 'JOB_ASSIGNED', req.user._id);
    }

    const populated = await Job.findById(job._id)
      .populate('client', 'name email')
      .populate('technician', 'name email');

    res.status(201).json({ message: 'Job created successfully.', job: populated });
  } catch (err) {
    console.error('createJob error:', err);
    res.status(500).json({ message: 'Failed to create job.' });
  }
};

// PATCH /api/jobs/:id/assign — Admin only
const assignJob = async (req, res) => {
  try {
    const { technicianId, scheduledAt } = req.body;

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found.' });

    if (job.status === 'COMPLETED' || job.status === 'CANCELLED') {
      return res.status(400).json({ message: `Cannot reassign a ${job.status} job.` });
    }

    const tech = await User.findById(technicianId);
    if (!tech || tech.role !== 'TECHNICIAN') {
      return res.status(400).json({ message: 'Invalid technician ID.' });
    }

    const previousTechId = job.technician;
    job.technician = technicianId;
    job.status = 'ASSIGNED';
    if (scheduledAt) job.scheduledAt = scheduledAt;
    await job.save();

    await logActivity(job._id, req.user._id, `Job assigned to ${tech.name}.`, 'ASSIGNMENT');
    await notify(technicianId, `You have been assigned job: "${job.title}".`, job._id, 'JOB_ASSIGNED', req.user._id);
    // Notify previous technician if reassigned
    if (previousTechId && previousTechId.toString() !== technicianId) {
      await notify(previousTechId, `Job "${job.title}" has been reassigned.`, job._id, 'STATUS_UPDATE', req.user._id);
    }

    const populated = await Job.findById(job._id)
      .populate('client', 'name email')
      .populate('technician', 'name email');

    res.json({ message: 'Job assigned successfully.', job: populated });
  } catch (err) {
    console.error('assignJob error:', err);
    res.status(500).json({ message: 'Failed to assign job.' });
  }
};

// PATCH /api/jobs/:id/status — Admin or assigned Technician
const updateStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    const validStatuses = ['PENDING', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Valid: ${validStatuses.join(', ')}` });
    }

    const job = await Job.findById(req.params.id).populate('client technician');
    if (!job) return res.status(404).json({ message: 'Job not found.' });

    // Technician can only update their own assigned jobs
    if (
      req.user.role === 'TECHNICIAN' &&
      job.technician?._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'You can only update your own assigned jobs.' });
    }

    // Technician cannot cancel or set back to PENDING
    if (req.user.role === 'TECHNICIAN' && (status === 'CANCELLED' || status === 'PENDING')) {
      return res.status(403).json({ message: 'Technicians cannot cancel or reset jobs.' });
    }

    const previousStatus = job.status;
    job.status = status;
    await job.save();

    const logMsg = `Status changed from ${previousStatus} to ${status}.${note ? ` Note: ${note}` : ''}`;
    await logActivity(job._id, req.user._id, logMsg, 'STATUS_CHANGE', previousStatus, status);

    // Notify relevant parties
    const updaterName = req.user.name;
    if (job.client?._id) {
      await notify(job.client._id, `Your job "${job.title}" status updated to ${status}.`, job._id, 'STATUS_UPDATE', req.user._id);
    }
    if (job.technician?._id && job.technician._id.toString() !== req.user._id.toString()) {
      await notify(job.technician._id, `Job "${job.title}" status updated to ${status} by ${updaterName}.`, job._id, 'STATUS_UPDATE', req.user._id);
    }

    // If cancelled, also notify the technician
    if (status === 'CANCELLED' && job.technician?._id) {
      await notify(job.technician._id, `Job "${job.title}" has been cancelled.`, job._id, 'JOB_CANCELLED', req.user._id);
    }

    res.json({ message: 'Status updated.', job: await Job.findById(job._id).populate('client', 'name email').populate('technician', 'name email') });
  } catch (err) {
    console.error('updateStatus error:', err);
    res.status(500).json({ message: 'Failed to update status.' });
  }
};

// POST /api/jobs/:id/notes — Admin or assigned Technician
const addNote = async (req, res) => {
  try {
    const { note } = req.body;
    if (!note || !note.trim()) {
      return res.status(400).json({ message: 'Note content is required.' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found.' });

    if (
      req.user.role === 'TECHNICIAN' &&
      job.technician?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'You can only add notes to your own jobs.' });
    }

    await logActivity(job._id, req.user._id, note.trim(), 'NOTE');

    if (job.client && req.user._id.toString() !== job.client.toString()) {
      await notify(job.client, `A new note was added to your job "${job.title}".`, job._id, 'NOTE_ADDED', req.user._id);
    }

    res.json({ message: 'Note added.' });
  } catch (err) {
    console.error('addNote error:', err);
    res.status(500).json({ message: 'Failed to add note.' });
  }
};

// GET /api/jobs/stats — Admin only
const getStats = async (req, res) => {
  try {
    const [total, pending, assigned, accepted, inProgress, blocked, completed, cancelled, pendingTechCount] = await Promise.all([
      Job.countDocuments(),
      Job.countDocuments({ status: 'PENDING' }),
      Job.countDocuments({ status: 'ASSIGNED' }),
      Job.countDocuments({ status: 'ACCEPTED' }),
      Job.countDocuments({ status: 'IN_PROGRESS' }),
      Job.countDocuments({ status: 'BLOCKED' }),
      Job.countDocuments({ status: 'COMPLETED' }),
      Job.countDocuments({ status: 'CANCELLED' }),
      User.countDocuments({ role: 'TECHNICIAN', isActive: false }),
    ]);

    const recentJobs = await Job.find()
      .populate('client', 'name')
      .populate('technician', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({ total, pending, assigned, accepted, inProgress, blocked, completed, cancelled, recentJobs, pendingTechCount });
  } catch (err) {
    console.error('getStats error:', err);
    res.status(500).json({ message: 'Failed to fetch stats.' });
  }
};

module.exports = { getJobs, getJobById, createJob, assignJob, updateStatus, addNote, getStats };
