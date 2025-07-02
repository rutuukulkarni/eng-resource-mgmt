# Backend Documentation - Engineering Resource Management System

This document provides detailed information about the backend architecture, models, routes, and functionality of the Engineering Resource Management System.

## Table of Contents

1. [Backend Architecture](#backend-architecture)
2. [Environment Setup](#environment-setup)
3. [Database Models](#database-models)
4. [API Routes](#api-routes)
5. [Authentication](#authentication)
6. [Error Handling](#error-handling)
7. [Data Validation](#data-validation)
8. [Middleware](#middleware)

## Backend Architecture

The backend is built with:

- **Node.js**: JavaScript runtime
- **Express**: Web framework for handling HTTP requests
- **MongoDB**: NoSQL database for storing application data
- **Mongoose**: MongoDB object modeling tool
- **JWT**: JSON Web Tokens for authentication
- **Bcrypt**: For password hashing

## Environment Setup

The backend requires the following environment variables, typically stored in a `.env` file:

```
MONGODB_URI=mongodb://localhost:27017/eng-res-mgmt
JWT_SECRET=supersecretkey
JWT_EXPIRE=7d
```

### Database Connection

The `server.js` file handles connection to MongoDB:

```javascript
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error(err));
```

## Database Models

### User Model (`models/User.js`)

Represents both engineers and managers in the system.

#### Schema:

```javascript
{
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/valid-email-regex/, 'Please add a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false  // Don't return password in queries
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['engineer', 'manager'],
    required: true
  },
  // Engineer-specific fields
  skills: {
    type: [String],
    default: []
  },
  seniority: {
    type: String,
    enum: ['junior', 'mid', 'senior'],
    default: 'mid'
  },
  title: {
    type: String,
    default: function() {
      return `${this.seniority.charAt(0).toUpperCase() + this.seniority.slice(1)} ${this.department} Engineer`;
    }
  },
  maxCapacity: {
    type: Number,
    default: 100  // 100 for full-time
  },
  department: {
    type: String,
    default: 'Engineering'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}
```

#### Methods:

- **getSignedJwtToken**: Generates a JWT token for authentication
- **matchPassword**: Compares entered password with stored hash

#### Hooks:

- **pre-save**: Hashes password before saving to database

### Project Model (`models/Project.js`)

Represents engineering projects.

#### Schema:

```javascript
{
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  requiredSkills: {
    type: [String],
    required: true
  },
  teamSize: {
    type: Number,
    required: true
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
}
```

### Assignment Model (`models/Assignment.js`)

Represents the assignment of engineers to projects.

#### Schema:

```javascript
{
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
    required: true,
    min: 1,
    max: 100
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  role: {
    type: String,
    required: true
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
}
```

#### Hooks:

- **pre-save**: Updates status based on current date and start/end dates

#### Virtuals:

- **hoursPerWeek**: Calculates hours per week based on allocation percentage

## API Routes

### Authentication Routes (`routes/auth.js`)

- **POST /api/auth/register**: Register a new user
- **POST /api/auth/login**: Authenticate a user
- **GET /api/auth/me**: Get current user profile
- **GET /api/auth/users/:id**: Get a specific user's profile

### Engineer Routes (`routes/engineers.js`)

- **GET /api/engineers**: Get all engineers (manager only)
- **GET /api/engineers/:id**: Get a specific engineer
- **POST /api/engineers**: Create a new engineer (manager only)
- **PUT /api/engineers/:id**: Update an engineer
- **GET /api/engineers/:id/capacity**: Get engineer capacity and allocations
- **GET /api/engineers/skills/:skills**: Find engineers with specific skills

### Project Routes (`routes/projects.js`)

- **GET /api/projects**: Get all projects (filtered by role)
- **GET /api/projects/:id**: Get a specific project
- **POST /api/projects**: Create a new project (manager only)
- **PUT /api/projects/:id**: Update a project (manager only)
- **DELETE /api/projects/:id**: Delete a project (manager only)

### Assignment Routes (`routes/assignments.js`)

- **GET /api/assignments**: Get all assignments (filtered by role)
- **GET /api/assignments/engineer/:id**: Get assignments for a specific engineer
- **GET /api/assignments/:id**: Get a specific assignment
- **POST /api/assignments**: Create a new assignment (manager only)
- **PUT /api/assignments/:id**: Update an assignment (manager only)
- **DELETE /api/assignments/:id**: Delete an assignment (manager only)

## Authentication

### JWT Implementation

Authentication is implemented using JSON Web Tokens (JWT):

1. When a user logs in successfully, a JWT is generated with user ID and role
2. The token is returned to the client and should be included in subsequent requests
3. Protected routes use middleware to verify the token
4. The token includes an expiration time (defined in .env)

### Middleware

The `protect` middleware:
- Checks for the presence of a token in the Authorization header
- Verifies the token is valid
- Attaches the user object to the request for use in route handlers

The `authorize` middleware:
- Checks if the authenticated user has the required role
- Used to restrict certain routes to specific roles (e.g., managers only)

## Error Handling

Error handling is implemented consistently across all routes:

### Client Errors (4xx)

For expected errors like validation failures or unauthorized access:

```javascript
res.status(400).json({
  success: false,
  message: 'Error message'
});
```

### Server Errors (5xx)

For unexpected errors:

```javascript
res.status(500).json({
  success: false,
  message: err.message
});
```

## Data Validation

Validation occurs at multiple levels:

### Mongoose Schema Validation

Models define required fields, allowed values, and other constraints.

### Route-Level Validation

Routes check for additional business logic:
- Engineers have the required skills for a project
- Engineers aren't over-allocated
- Users have permission to access or modify resources

## Middleware

### Custom Middleware

- **protect**: Authentication middleware
- **authorize**: Role-based access control middleware

### Express Middleware

- **express.json()**: Parse JSON request bodies
- **cors**: Enable CORS for frontend access

## Seed Data

The `seedData.js` script populates the database with initial data:

- Sample manager account
- Multiple engineer accounts with different skills
- Several projects with varying requirements
- Initial assignments between engineers and projects

This provides a working environment for testing and development without manual data entry.
