const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a project name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please add an end date']
  },
  requiredSkills: {
    type: [String],
    required: [true, 'Please add required skills']
  },
  teamSize: {
    type: Number,
    required: [true, 'Please add required team size']
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'completed'],
    default: 'planning'
  },
  managerId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Project', ProjectSchema);
