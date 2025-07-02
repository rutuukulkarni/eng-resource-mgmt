const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  engineerId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  projectId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Project',
    required: true
  },
  allocationPercentage: {
    type: Number,
    required: [true, 'Please add allocation percentage'],
    min: [1, 'Allocation must be at least 1%'],
    max: [100, 'Allocation cannot exceed 100%']
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please add an end date']
  },
  role: {
    type: String,
    required: [true, 'Please add a role for this assignment']
  },
  status: {
    type: String,
    enum: ['planned', 'active', 'completed'],
    default: 'planned'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create index for unique assignments (one engineer can have only one role in a project)
AssignmentSchema.index({ engineerId: 1, projectId: 1, role: 1 }, { unique: true });

// Update status based on dates
AssignmentSchema.pre('save', function(next) {
  const now = new Date();
  
  if (now < this.startDate) {
    this.status = 'planned';
  } else if (now >= this.startDate && now <= this.endDate) {
    this.status = 'active';
  } else if (now > this.endDate) {
    this.status = 'completed';
  }
  
  next();
});

// Virtual for calculating hours per week based on allocation percentage
AssignmentSchema.virtual('hoursPerWeek').get(function() {
  // Assuming a 40-hour work week
  return Math.round((this.allocationPercentage / 100) * 40);
});

module.exports = mongoose.model('Assignment', AssignmentSchema);
