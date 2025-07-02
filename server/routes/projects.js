const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { protect, authorize } = require('./auth');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    query = Project.find(JSON.parse(queryStr));

    // Engineers can only see projects they're assigned to
    if (req.user.role === 'engineer') {
      // First get all assignment IDs for this engineer
      const Assignment = require('../models/Assignment');
      const assignments = await Assignment.find({ engineerId: req.user.id });
      
      // Extract project IDs from assignments
      const projectIds = assignments.map(assignment => assignment.projectId);
      
      // Filter projects by these IDs
      query = Project.find({ _id: { $in: projectIds } });
    }

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Project.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const projects = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: projects.length,
      pagination,
      data: projects
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (manager only)
router.post('/', protect, authorize('manager'), async (req, res) => {
  try {
    // Add user to req.body
    req.body.managerId = req.user.id;

    const project = await Project.create(req.body);

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (manager only)
router.put('/:id', protect, authorize('manager'), async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Make sure user is project manager
    if (project.managerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this project`
      });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (manager only)
router.delete('/:id', protect, authorize('manager'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Make sure user is project manager
    if (project.managerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this project`
      });
    }

    await project.remove();

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
