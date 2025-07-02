const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const User = require('../models/User');
const Project = require('../models/Project');
const { protect, authorize } = require('./auth');

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query;

    // Engineers can only see their own assignments
    if (req.user.role === 'engineer') {
      query = Assignment.find({ engineerId: req.user.id });
    } else {
      query = Assignment.find();
    }

    // Execute query with populated references
    const assignments = await query
      .populate({
        path: 'engineerId',
        select: 'name email skills seniority maxCapacity department title'
      })
      .populate({
        path: 'projectId',
        select: 'name description status startDate endDate'
      });

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// @desc    Get all assignments for a specific engineer
// @route   GET /api/assignments/engineer/:id
// @access  Private
router.get('/engineer/:id', protect, async (req, res) => {
  try {
    // Check if the user is allowed to access this data
    if (req.user.role !== 'manager' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these assignments'
      });
    }

    const assignments = await Assignment.find({ engineerId: req.params.id })
      .populate({
        path: 'engineerId',
        select: 'name email skills seniority maxCapacity department title'
      })
      .populate({
        path: 'projectId',
        select: 'name description status startDate endDate'
      });

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate({
        path: 'engineerId',
        select: 'name email skills seniority maxCapacity department title'
      })
      .populate({
        path: 'projectId',
        select: 'name description status startDate endDate'
      });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Engineers can only see their own assignments
    if (req.user.role === 'engineer' && assignment.engineerId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this assignment'
      });
    }

    res.status(200).json({
      success: true,
      data: assignment
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// @desc    Create new assignment
// @route   POST /api/assignments
// @access  Private (manager only)
router.post('/', protect, authorize('manager'), async (req, res) => {
  try {
    const { engineerId, projectId, allocationPercentage, startDate, endDate, role } = req.body;

    // Validate that engineer exists
    const engineer = await User.findById(engineerId);
    if (!engineer || engineer.role !== 'engineer') {
      return res.status(400).json({
        success: false,
        message: 'Invalid engineer ID'
      });
    }

    // Validate that project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
    }

    // Check if the engineer has the required skills
    const hasRequiredSkill = project.requiredSkills.some(skill => 
      engineer.skills.includes(skill)
    );

    if (!hasRequiredSkill) {
      return res.status(400).json({
        success: false,
        message: 'Engineer does not have the required skills for this project'
      });
    }

    // Check engineer's available capacity during the assignment period
    const overlappingAssignments = await Assignment.find({
      engineerId,
      $or: [
        {
          startDate: { $lte: new Date(startDate) },
          endDate: { $gte: new Date(startDate) }
        },
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(endDate) }
        },
        {
          startDate: { $gte: new Date(startDate) },
          endDate: { $lte: new Date(endDate) }
        }
      ]
    });

    const totalAllocated = overlappingAssignments.reduce((sum, assignment) => {
      return sum + assignment.allocationPercentage;
    }, 0);

    const availableCapacity = engineer.maxCapacity - totalAllocated;

    if (allocationPercentage > availableCapacity) {
      return res.status(400).json({
        success: false,
        message: `Engineer only has ${availableCapacity}% capacity available during this period`
      });
    }

    // Create assignment
    const assignment = await Assignment.create({
      engineerId,
      projectId,
      allocationPercentage,
      startDate,
      endDate,
      role
    });

    res.status(201).json({
      success: true,
      data: assignment
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
});

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private (manager only)
router.put('/:id', protect, authorize('manager'), async (req, res) => {
  try {
    let assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // If changing allocation, check capacity
    if (req.body.allocationPercentage && req.body.allocationPercentage !== assignment.allocationPercentage) {
      const engineer = await User.findById(assignment.engineerId);
      
      const overlappingAssignments = await Assignment.find({
        engineerId: assignment.engineerId,
        _id: { $ne: req.params.id }, // Exclude this assignment
        $or: [
          {
            startDate: { $lte: assignment.startDate },
            endDate: { $gte: assignment.startDate }
          },
          {
            startDate: { $lte: assignment.endDate },
            endDate: { $gte: assignment.endDate }
          },
          {
            startDate: { $gte: assignment.startDate },
            endDate: { $lte: assignment.endDate }
          }
        ]
      });

      const totalAllocated = overlappingAssignments.reduce((sum, assignment) => {
        return sum + assignment.allocationPercentage;
      }, 0);

      const availableCapacity = engineer.maxCapacity - totalAllocated;

      if (req.body.allocationPercentage > availableCapacity) {
        return res.status(400).json({
          success: false,
          message: `Engineer only has ${availableCapacity}% capacity available during this period`
        });
      }
    }

    // Update assignment
    assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    .populate({
      path: 'engineerId',
      select: 'name email skills seniority maxCapacity department title'
    })
    .populate({
      path: 'projectId',
      select: 'name description status startDate endDate'
    });

    res.status(200).json({
      success: true,
      data: assignment
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
});

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private (manager only)
router.delete('/:id', protect, authorize('manager'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    await assignment.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;
