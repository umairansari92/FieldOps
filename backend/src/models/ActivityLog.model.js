const mongoose = require('mongoose');

// Every important action on a job is logged here for data integrity and audit trail
const activityLogSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Human-readable description of what happened
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['STATUS_CHANGE', 'NOTE', 'ASSIGNMENT', 'CREATION', 'CANCELLATION'],
      required: true,
    },
    // For STATUS_CHANGE entries, we store the before/after
    previousStatus: {
      type: String,
      default: null,
    },
    newStatus: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
