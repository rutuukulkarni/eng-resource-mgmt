const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Load models
const User = require('./models/User');
const Project = require('./models/Project');
const Assignment = require('./models/Assignment');

// Connect to DB
async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
    
    // Clear existing data
    await User.deleteMany();
    await Project.deleteMany();
    await Assignment.deleteMany();

    console.log('Data cleared...');

    // Create manager users
    // Using plain password, model's pre-save hook will hash it
    const manager1 = await User.create({
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      password: 'password123',
      role: 'manager',
      department: 'Engineering'
    });

    const manager2 = await User.create({
      name: 'Michael Chen',
      email: 'michael@example.com',
      password: 'password123',
      role: 'manager',
      department: 'Product'
    });

    console.log('Managers created...');

    // Create engineer users
    const engineer1 = await User.create({
      name: 'Alex Rodriguez',
      email: 'alex@example.com',
      password: 'password123',
      role: 'engineer',
      skills: ['React', 'JavaScript', 'TypeScript', 'Node.js'],
      seniority: 'senior',
      maxCapacity: 100,
      department: 'Frontend'
    });

    const engineer2 = await User.create({
      name: 'Priya Patel',
      email: 'priya@example.com',
      password: 'password123',
      role: 'engineer',
      skills: ['Python', 'Django', 'AWS', 'Machine Learning'],
      seniority: 'mid',
      maxCapacity: 100,
      department: 'Backend'
    });

    const engineer3 = await User.create({
      name: 'James Wilson',
      email: 'james@example.com',
      password: 'password123',
      role: 'engineer',
      skills: ['React', 'Node.js', 'MongoDB', 'Express'],
      seniority: 'junior',
      maxCapacity: 100,
      department: 'Fullstack'
    });

    const engineer4 = await User.create({
      name: 'Olivia Martinez',
      email: 'olivia@example.com',
      password: 'password123',
      role: 'engineer',
      skills: ['React Native', 'JavaScript', 'UI/UX', 'Firebase'],
      seniority: 'mid',
      maxCapacity: 50, // Part-time
      department: 'Mobile'
    });

    console.log('Engineers created...');

    // Create projects
    const project1 = await Project.create({
      name: 'Customer Portal Redesign',
      description: 'Rebuild the customer-facing portal with modern UI and improved functionality',
      startDate: new Date('2025-07-15'),
      endDate: new Date('2025-12-30'),
      requiredSkills: ['React', 'TypeScript', 'Node.js'],
      teamSize: 3,
      status: 'planning',
      managerId: manager1._id
    });

    const project2 = await Project.create({
      name: 'Data Analytics Platform',
      description: 'Build a data analytics platform for internal teams',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-09-30'),
      requiredSkills: ['Python', 'Machine Learning', 'AWS'],
      teamSize: 2,
      status: 'active',
      managerId: manager2._id
    });

    const project3 = await Project.create({
      name: 'Mobile App Development',
      description: 'Develop a mobile app for iOS and Android',
      startDate: new Date('2025-08-01'),
      endDate: new Date('2026-01-31'),
      requiredSkills: ['React Native', 'JavaScript', 'Firebase'],
      teamSize: 2,
      status: 'planning',
      managerId: manager1._id
    });

    const project4 = await Project.create({
      name: 'API Gateway Implementation',
      description: 'Implement a central API gateway for all services',
      startDate: new Date('2025-05-01'),
      endDate: new Date('2025-07-31'),
      requiredSkills: ['Node.js', 'Express', 'AWS'],
      teamSize: 2,
      status: 'active',
      managerId: manager2._id
    });

    console.log('Projects created...');

    // Create assignments
    await Assignment.create({
      engineerId: engineer1._id,
      projectId: project1._id,
      allocationPercentage: 70,
      startDate: new Date('2025-07-15'),
      endDate: new Date('2025-12-30'),
      role: 'Tech Lead',
      status: 'planned'
    });

    await Assignment.create({
      engineerId: engineer3._id,
      projectId: project1._id,
      allocationPercentage: 100,
      startDate: new Date('2025-07-15'),
      endDate: new Date('2025-12-30'),
      role: 'Frontend Developer',
      status: 'planned'
    });

    await Assignment.create({
      engineerId: engineer2._id,
      projectId: project2._id,
      allocationPercentage: 80,
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-09-30'),
      role: 'Data Engineer',
      status: 'active'
    });

    await Assignment.create({
      engineerId: engineer4._id,
      projectId: project3._id,
      allocationPercentage: 50,
      startDate: new Date('2025-08-01'),
      endDate: new Date('2026-01-31'),
      role: 'Mobile Developer',
      status: 'planned'
    });

    await Assignment.create({
      engineerId: engineer1._id,
      projectId: project4._id,
      allocationPercentage: 30,
      startDate: new Date('2025-05-01'),
      endDate: new Date('2025-07-31'),
      role: 'Backend Developer',
      status: 'active'
    });

    await Assignment.create({
      engineerId: engineer3._id,
      projectId: project4._id,
      allocationPercentage: 50,
      startDate: new Date('2025-05-01'),
      endDate: new Date('2025-07-31'),
      role: 'DevOps Engineer',
      status: 'active'
    });

    console.log('Assignments created...');

    console.log('Database seeded successfully!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

// No longer needed - using model's pre-save hook for password hashing

// Run the seed function
seedDatabase();
