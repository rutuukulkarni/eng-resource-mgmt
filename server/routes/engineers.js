const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const { protect, authorize } = require('./auth');

// @desc    Get all engineers
// @route   GET /api/engineers
// @access  Private (manager only)
router.get('/', protect, authorize('manager'), async (req, res) => {
  try {
    const engineers = await User.find({ role: 'engineer' }).select('-__v');
    
    res.status(200).json({
      success: true,
      count: engineers.length,
      data: engineers
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// @desc    Get single engineer
// @route   GET /api/engineers/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const engineer = await User.findById(req.params.id);
    
    if (!engineer) {
      return res.status(404).json({
        success: false,
        message: 'Engineer not found'
      });
    }

    // Only managers can view other engineers
    if (req.user.role !== 'manager' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this engineer'
      });
    }

    res.status(200).json({
      success: true,
      data: engineer
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// @desc    Create new engineer
// @route   POST /api/engineers
// @access  Private (manager only)
router.post('/', protect, authorize('manager'), async (req, res) => {
  try {
    const engineer = await User.create({
      ...req.body,
      role: 'engineer'
    });
    
    res.status(201).json({
      success: true,
      data: engineer
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
});

// @desc    Update engineer
// @route   PUT /api/engineers/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    // Find engineer
    let engineer = await User.findById(req.params.id);
    
    if (!engineer) {
      return res.status(404).json({
        success: false,
        message: 'Engineer not found'
      });
    }

    // Check if user is authorized to update
    if (req.user.role !== 'manager' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this engineer'
      });
    }

    // Engineers can't change their role, only managers can
    if (req.user.role !== 'manager' && req.body.role) {
      delete req.body.role;
    }

    // Update engineer
    engineer = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: engineer
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
});

// @desc    Get engineer capacity
// @route   GET /api/engineers/:id/capacity
// @access  Private
router.get('/:id/capacity', protect, async (req, res) => {
  try {
    // Find engineer
    const engineer = await User.findById(req.params.id);
    
    if (!engineer) {
      return res.status(404).json({
        success: false,
        message: 'Engineer not found'
      });
    }

    // Only managers or the engineer themselves can view capacity
    if (req.user.role !== 'manager' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this engineer capacity'
      });
    }

    // Get active assignments
    const now = new Date();
    const activeAssignments = await Assignment.find({
      engineerId: req.params.id,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).populate('projectId', 'name');
    
    // Calculate total allocation
    const totalAllocated = activeAssignments.reduce((sum, assignment) => {
      return sum + assignment.allocationPercentage;
    }, 0);
    
    // Calculate available capacity
    const availableCapacity = engineer.maxCapacity - totalAllocated;

    res.status(200).json({
      success: true,
      data: {
        engineer: {
          id: engineer._id,
          name: engineer.name,
          maxCapacity: engineer.maxCapacity
        },
        activeAssignments,
        totalAllocated,
        availableCapacity
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// @desc    Find engineers with required skills
// @route   GET /api/engineers/skills/:skills
// @access  Private (manager only)
router.get('/skills/:skills', protect, authorize('manager'), async (req, res) => {
  try {
    const skills = req.params.skills.split(',');
    
    const engineers = await User.find({ 
      role: 'engineer',
      skills: { $in: skills }
    });

    res.status(200).json({
      success: true,
      count: engineers.length,
      data: engineers
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;
