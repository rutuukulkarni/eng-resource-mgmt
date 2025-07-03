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

    // Copy req.query
    const reqQuery = { ...req.query };
    
    // Engineers can only see their own assignments
    if (req.user.role === 'engineer') {
      query = Assignment.find({ engineerId: req.user.id });
    } else {
      // If projectId query param is provided, filter by project
      if (reqQuery.projectId) {
        query = Assignment.find({ projectId: reqQuery.projectId });
      } else {
        query = Assignment.find();
      }
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
    
    console.log('\n=== Creating New Assignment ===');
    console.log('Engineer ID:', engineerId);
    console.log('Project ID:', projectId);
    console.log('Allocation:', allocationPercentage);
    console.log('Start Date:', startDate);
    console.log('End Date:', endDate);
    console.log('Role:', role);

    // Validate that engineer exists
    const engineer = await User.findById(engineerId);
    if (!engineer || engineer.role !== 'engineer') {
      console.log('Error: Invalid engineer ID');
      return res.status(400).json({
        success: false,
        message: 'Invalid engineer ID'
      });
    }
    
    console.log('Engineer found:', engineer.name);
    console.log('Engineer max capacity:', engineer.maxCapacity);

    // Validate that project exists
    const project = await Project.findById(projectId);
    if (!project) {
      console.log('Error: Invalid project ID');
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
    }
    
    console.log('Project found:', project.name);

    // Check if the engineer has the required skills
    const hasRequiredSkill = project.requiredSkills.some(skill => 
      engineer.skills.includes(skill)
    );

    console.log('Engineer skills:', engineer.skills);
    console.log('Project required skills:', project.requiredSkills);
    console.log('Has required skill:', hasRequiredSkill);

    if (!hasRequiredSkill) {
      console.log('Error: Engineer does not have the required skills');
      return res.status(400).json({
        success: false,
        message: 'Engineer does not have the required skills for this project'
      });
    }

    // Convert dates to Date objects for comparison
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    console.log('Parsed Start Date:', startDateObj);
    console.log('Parsed End Date:', endDateObj);

    // Check engineer's available capacity during the assignment period
    const overlappingAssignments = await Assignment.find({
      engineerId,
      $or: [
        // Assignment starts before or on our start date and ends after or on our start date
        {
          startDate: { $lte: startDateObj },
          endDate: { $gte: startDateObj }
        },
        // Assignment starts before or on our end date and ends after or on our end date
        {
          startDate: { $lte: endDateObj },
          endDate: { $gte: endDateObj }
        },
        // Assignment starts after our start date and ends before our end date
        {
          startDate: { $gt: startDateObj },
          endDate: { $lt: endDateObj }
        }
      ]
    });

    console.log('Overlapping assignments found:', overlappingAssignments.length);
    
    if (overlappingAssignments.length > 0) {
      console.log('Overlapping assignments details:');
      overlappingAssignments.forEach(assignment => {
        console.log(`- ID: ${assignment._id}, Allocation: ${assignment.allocationPercentage}%, Start: ${assignment.startDate}, End: ${assignment.endDate}`);
      });
    }
    
    const totalAllocated = overlappingAssignments.reduce((sum, assignment) => {
      return sum + assignment.allocationPercentage;
    }, 0);

    console.log('Total allocated capacity:', totalAllocated);
    console.log('Engineer max capacity:', engineer.maxCapacity);
    
    const availableCapacity = engineer.maxCapacity - totalAllocated;

    console.log('Available capacity:', availableCapacity);
    console.log('Requested allocation:', allocationPercentage);
    console.log('Is allocation possible:', allocationPercentage <= availableCapacity);

    if (allocationPercentage > availableCapacity) {
      console.log('Error: Insufficient capacity');
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
      startDate: startDateObj,
      endDate: endDateObj,
      role
    });

    console.log('Assignment created successfully');
    
    res.status(201).json({
      success: true,
      data: assignment
    });
  } catch (err) {
    console.error('Error creating assignment:', err);
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
      
      // Get dates for the assignment (use updated dates if provided)
      const startDate = req.body.startDate ? new Date(req.body.startDate) : assignment.startDate;
      const endDate = req.body.endDate ? new Date(req.body.endDate) : assignment.endDate;
      
      const overlappingAssignments = await Assignment.find({
        engineerId: assignment.engineerId,
        _id: { $ne: req.params.id }, // Exclude this assignment
        $or: [
          // Assignment starts before and ends after our start date
          {
            startDate: { $lte: startDate },
            endDate: { $gte: startDate }
          },
          // Assignment starts before and ends after our end date
          {
            startDate: { $lte: endDate },
            endDate: { $gte: endDate }
          },
          // Assignment is entirely within our date range
          {
            startDate: { $gte: startDate },
            endDate: { $lte: endDate }
          }
        ]
      });

      console.log('Overlapping assignments found (update):', overlappingAssignments.length);
      
      const totalAllocated = overlappingAssignments.reduce((sum, assignment) => {
        return sum + assignment.allocationPercentage;
      }, 0);

      console.log('Total allocated capacity (update):', totalAllocated);
      console.log('Engineer max capacity (update):', engineer.maxCapacity);
      
      const availableCapacity = engineer.maxCapacity - totalAllocated;

      console.log('Available capacity (update):', availableCapacity);

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

    await assignment.deleteOne();

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
