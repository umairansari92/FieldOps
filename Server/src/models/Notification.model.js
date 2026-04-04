const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    // The user who triggered the notification (e.g. sender of signup/note)
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Link to relevant job
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ['JOB_ASSIGNED', 'STATUS_UPDATE', 'NOTE_ADDED', 'JOB_CREATED', 'JOB_CANCELLED', 'TECH_SIGNUP'],
      required: true,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
