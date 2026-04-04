const mongoose = require('mongoose');

// Job statuses represent the full lifecycle of a field job
const JOB_STATUSES = ['PENDING', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'CANCELLED'];

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: JOB_STATUSES,
      default: 'PENDING',
    },
    // The client who requested this job
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Client is required'],
    },
    // The technician assigned to this job (optional until assigned)
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // When the job is scheduled to be performed
    scheduledAt: {
      type: Date,
      default: null,
    },
    // Location/address where the job will take place
    location: {
      type: String,
      trim: true,
      default: '',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
  },
  { timestamps: true }
);

// Index for common queries
jobSchema.index({ client: 1, status: 1 });
jobSchema.index({ technician: 1, status: 1 });

module.exports = mongoose.model('Job', jobSchema);
