# Engineering Resource Management System - API Documentation

This documentation provides a comprehensive overview of the Engineering Resource Management System, including all available API endpoints, data models, and functionalities.

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Users and Authentication API](#users-and-authentication-api)
4. [Engineers API](#engineers-api)
5. [Projects API](#projects-api)
6. [Assignments API](#assignments-api)
7. [Data Models](#data-models)
8. [Error Handling](#error-handling)

## Overview

The Engineering Resource Management System is a full-stack application designed to help engineering managers effectively allocate resources (engineers) to various projects. It provides functionality for managing engineers, projects, and assignments while ensuring optimal resource utilization.

### Key Features

- User authentication with role-based access (Engineers and Managers)
- Engineer profile management with skills and capacity tracking
- Project creation and management
- Resource allocation with capacity checks
- Assignment management with status tracking
- Dashboard with resource utilization insights

## Authentication

The system uses JSON Web Tokens (JWT) for authentication. All protected endpoints require a valid token to be included in the Authorization header.

### Token Format

```
Authorization: Bearer <token>
```

### Roles and Permissions

- **Engineers**: Can view their own profile, projects they're assigned to, and their assignments
- **Managers**: Can create/edit/delete projects, assign engineers to projects, view all engineers and projects

## Users and Authentication API

### Register a New User

- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Auth Required**: No
- **Description**: Creates a new user account
- **Request Body**:
  ```json
  {
    "name": "User Name",
    "email": "user@example.com",
    "password": "password123",
    "role": "engineer" or "manager",
    "skills": ["JavaScript", "React", "Node.js"],  // Optional, for engineers
    "seniority": "junior" or "mid" or "senior",   // Optional, for engineers
    "maxCapacity": 100,  // Optional, for engineers (percentage)
    "department": "Frontend"  // Optional
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "success": true,
    "token": "JWT_TOKEN_HERE"
  }
  ```

### Login

- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Auth Required**: No
- **Description**: Authenticates a user and provides a token
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "token": "JWT_TOKEN_HERE",
    "user": {
      "id": "user_id",
      "name": "User Name",
      "email": "user@example.com",
      "role": "engineer" or "manager"
    }
  }
  ```

### Get Current User

- **URL**: `/api/auth/me`
- **Method**: `GET`
- **Auth Required**: Yes
- **Description**: Returns the currently authenticated user's profile
- **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "_id": "user_id",
      "name": "User Name",
      "email": "user@example.com",
      "role": "engineer" or "manager",
      "skills": ["JavaScript", "React", "Node.js"],
      "seniority": "mid",
      "maxCapacity": 100,
      "department": "Frontend",
      "createdAt": "date"
    }
  }
  ```

### Get User by ID

- **URL**: `/api/auth/users/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **Permissions**: User's own profile or manager role
- **Description**: Returns a specific user's profile
- **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "_id": "user_id",
      "name": "User Name",
      "email": "user@example.com",
      "role": "engineer" or "manager",
      "skills": ["JavaScript", "React", "Node.js"],
      "seniority": "mid",
      "maxCapacity": 100,
      "department": "Frontend",
      "createdAt": "date"
    }
  }
  ```

## Engineers API

### Get All Engineers

- **URL**: `/api/engineers`
- **Method**: `GET`
- **Auth Required**: Yes
- **Permissions**: Manager role only
- **Description**: Returns a list of all engineers
- **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "count": 5,
    "data": [
      {
        "_id": "engineer_id",
        "name": "Engineer Name",
        "email": "engineer@example.com",
        "skills": ["JavaScript", "React", "Node.js"],
        "seniority": "mid",
        "maxCapacity": 100,
        "department": "Frontend",
        "createdAt": "date"
      },
      // ...more engineers
    ]
  }
  ```

### Get Single Engineer

- **URL**: `/api/engineers/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **Permissions**: Own profile or manager role
- **Description**: Returns a specific engineer's profile
- **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "_id": "engineer_id",
      "name": "Engineer Name",
      "email": "engineer@example.com",
      "skills": ["JavaScript", "React", "Node.js"],
      "seniority": "mid",
      "maxCapacity": 100,
      "department": "Frontend",
      "createdAt": "date"
    }
  }
  ```

### Create Engineer

- **URL**: `/api/engineers`
- **Method**: `POST`
- **Auth Required**: Yes
- **Permissions**: Manager role only
- **Description**: Creates a new engineer account
- **Request Body**:
  ```json
  {
    "name": "Engineer Name",
    "email": "engineer@example.com",
    "password": "password123",
    "skills": ["JavaScript", "React", "Node.js"],
    "seniority": "mid",
    "maxCapacity": 100,
    "department": "Frontend"
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "success": true,
    "data": {
      "_id": "engineer_id",
      "name": "Engineer Name",
      "email": "engineer@example.com",
      "skills": ["JavaScript", "React", "Node.js"],
      "seniority": "mid",
      "maxCapacity": 100,
      "department": "Frontend",
      "createdAt": "date"
    }
  }
  ```

### Update Engineer

- **URL**: `/api/engineers/:id`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Permissions**: Own profile or manager role
- **Description**: Updates an engineer's profile
- **Request Body**: Any fields to update
  ```json
  {
    "skills": ["JavaScript", "React", "Node.js", "TypeScript"],
    "seniority": "senior"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "_id": "engineer_id",
      "name": "Engineer Name",
      "email": "engineer@example.com",
      "skills": ["JavaScript", "React", "Node.js", "TypeScript"],
      "seniority": "senior",
      "maxCapacity": 100,
      "department": "Frontend",
      "createdAt": "date"
    }
  }
  ```

### Get Engineer Capacity

- **URL**: `/api/engineers/:id/capacity`
- **Method**: `GET`
- **Auth Required**: Yes
- **Permissions**: Own profile or manager role
- **Description**: Returns an engineer's current capacity and assignments
- **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "engineer": {
        "id": "engineer_id",
        "name": "Engineer Name",
        "maxCapacity": 100
      },
      "activeAssignments": [
        {
          "_id": "assignment_id",
          "projectId": {
            "_id": "project_id",
            "name": "Project Name"
          },
          "allocationPercentage": 40,
          "startDate": "date",
          "endDate": "date",
          "role": "Developer"
        }
      ],
      "totalAllocated": 40,
      "availableCapacity": 60
    }
  }
  ```

### Find Engineers with Required Skills

- **URL**: `/api/engineers/skills/:skills`
- **Method**: `GET`
- **Auth Required**: Yes
- **Permissions**: Manager role only
- **Description**: Returns engineers who have at least one of the specified skills
- **URL Parameters**: `skills` - Comma-separated list of skills
- **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "count": 3,
    "data": [
      {
        "_id": "engineer_id",
        "name": "Engineer Name",
        "email": "engineer@example.com",
        "skills": ["JavaScript", "React", "Node.js"],
        "seniority": "mid",
        "maxCapacity": 100,
        "department": "Frontend"
      },
      // ...more engineers
    ]
  }
  ```

## Projects API

### Get All Projects

- **URL**: `/api/projects`
- **Method**: `GET`
- **Auth Required**: Yes
- **Description**: Returns all projects (managers) or only assigned projects (engineers)
- **Query Parameters**:
  - `select` - Comma-separated fields to include
  - `sort` - Field to sort by (prefix with `-` for descending)
  - `page` - Page number for pagination
  - `limit` - Number of results per page
- **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "count": 5,
    "pagination": {
      "next": { "page": 2, "limit": 25 },
      "prev": { "page": 1, "limit": 25 }
    },
    "data": [
      {
        "_id": "project_id",
        "name": "Project Name",
        "description": "Project description",
        "startDate": "date",
        "endDate": "date",
        "requiredSkills": ["JavaScript", "React"],
        "teamSize": 5,
        "status": "active",
        "managerId": "manager_id",
        "createdAt": "date"
      },
      // ...more projects
    ]
  }
  ```

### Get Single Project

- **URL**: `/api/projects/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **Description**: Returns details of a specific project
- **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "_id": "project_id",
      "name": "Project Name",
      "description": "Project description",
      "startDate": "date",
      "endDate": "date",
      "requiredSkills": ["JavaScript", "React"],
      "teamSize": 5,
      "status": "active",
      "managerId": "manager_id",
      "createdAt": "date"
    }
  }
  ```

### Create Project

- **URL**: `/api/projects`
- **Method**: `POST`
- **Auth Required**: Yes
- **Permissions**: Manager role only
- **Description**: Creates a new project
- **Request Body**:
  ```json
  {
    "name": "Project Name",
    "description": "Project description",
    "startDate": "2025-01-01",
    "endDate": "2025-06-30",
    "requiredSkills": ["JavaScript", "React"],
    "teamSize": 5,
    "status": "planning"
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "success": true,
    "data": {
      "_id": "project_id",
      "name": "Project Name",
      "description": "Project description",
      "startDate": "2025-01-01T00:00:00.000Z",
      "endDate": "2025-06-30T00:00:00.000Z",
      "requiredSkills": ["JavaScript", "React"],
      "teamSize": 5,
      "status": "planning",
      "managerId": "manager_id",
      "createdAt": "date"
    }
  }
  ```

### Update Project

- **URL**: `/api/projects/:id`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Permissions**: Project manager or admin role
- **Description**: Updates a project
- **Request Body**: Any fields to update
  ```json
  {
    "status": "active",
    "teamSize": 7
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "_id": "project_id",
      "name": "Project Name",
      "description": "Project description",
      "startDate": "2025-01-01T00:00:00.000Z",
      "endDate": "2025-06-30T00:00:00.000Z",
      "requiredSkills": ["JavaScript", "React"],
      "teamSize": 7,
      "status": "active",
      "managerId": "manager_id",
      "createdAt": "date"
    }
  }
  ```

### Delete Project

- **URL**: `/api/projects/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Permissions**: Project manager or admin role
- **Description**: Deletes a project
- **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {}
  }
  ```

## Assignments API

### Get All Assignments

- **URL**: `/api/assignments`
- **Method**: `GET`
- **Auth Required**: Yes
- **Description**: Returns all assignments (managers) or only own assignments (engineers)
- **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "count": 5,
    "data": [
      {
        "_id": "assignment_id",
        "engineerId": {
          "_id": "engineer_id",
          "name": "Engineer Name",
          "email": "engineer@example.com",
          "skills": ["JavaScript", "React"],
          "seniority": "mid",
          "maxCapacity": 100,
          "department": "Frontend",
          "title": "Mid Frontend Engineer"
        },
        "projectId": {
          "_id": "project_id",
          "name": "Project Name",
          "description": "Project description",
          "status": "active",
          "startDate": "date",
          "endDate": "date"
        },
        "allocationPercentage": 40,
        "startDate": "date",
        "endDate": "date",
        "role": "Developer",
        "status": "active",
        "createdAt": "date",
        "hoursPerWeek": 16
      },
      // ...more assignments
    ]
  }
  ```

### Get Assignments for Engineer

- **URL**: `/api/assignments/engineer/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **Permissions**: Own assignments or manager role
- **Description**: Returns all assignments for a specific engineer
- **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "count": 2,
    "data": [
      {
        "_id": "assignment_id",
        "engineerId": {
          "_id": "engineer_id",
          "name": "Engineer Name",
          "email": "engineer@example.com",
          "skills": ["JavaScript", "React"],
          "seniority": "mid",
          "maxCapacity": 100,
          "department": "Frontend",
          "title": "Mid Frontend Engineer"
        },
        "projectId": {
          "_id": "project_id",
          "name": "Project Name",
          "description": "Project description",
          "status": "active",
          "startDate": "date",
          "endDate": "date"
        },
        "allocationPercentage": 40,
        "startDate": "date",
        "endDate": "date",
        "role": "Developer",
        "status": "active",
        "createdAt": "date",
        "hoursPerWeek": 16
      },
      // ...more assignments
    ]
  }
  ```

### Get Single Assignment

- **URL**: `/api/assignments/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **Permissions**: Own assignment or manager role
- **Description**: Returns details of a specific assignment
- **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "_id": "assignment_id",
      "engineerId": {
        "_id": "engineer_id",
        "name": "Engineer Name",
        "email": "engineer@example.com",
        "skills": ["JavaScript", "React"],
        "seniority": "mid",
        "maxCapacity": 100,
        "department": "Frontend",
        "title": "Mid Frontend Engineer"
      },
      "projectId": {
        "_id": "project_id",
        "name": "Project Name",
        "description": "Project description",
        "status": "active",
        "startDate": "date",
        "endDate": "date"
      },
      "allocationPercentage": 40,
      "startDate": "date",
      "endDate": "date",
      "role": "Developer",
      "status": "active",
      "createdAt": "date",
      "hoursPerWeek": 16
    }
  }
  ```

### Create Assignment

- **URL**: `/api/assignments`
- **Method**: `POST`
- **Auth Required**: Yes
- **Permissions**: Manager role only
- **Description**: Assigns an engineer to a project
- **Request Body**:
  ```json
  {
    "engineerId": "engineer_id",
    "projectId": "project_id",
    "allocationPercentage": 40,
    "startDate": "2025-01-15",
    "endDate": "2025-03-15",
    "role": "Developer"
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "success": true,
    "data": {
      "_id": "assignment_id",
      "engineerId": "engineer_id",
      "projectId": "project_id",
      "allocationPercentage": 40,
      "startDate": "2025-01-15T00:00:00.000Z",
      "endDate": "2025-03-15T00:00:00.000Z",
      "role": "Developer",
      "status": "planned",
      "createdAt": "date"
    }
  }
  ```

### Update Assignment

- **URL**: `/api/assignments/:id`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Permissions**: Manager role only
- **Description**: Updates an assignment
- **Request Body**: Any fields to update
  ```json
  {
    "allocationPercentage": 60,
    "endDate": "2025-04-15"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "_id": "assignment_id",
      "engineerId": {
        "_id": "engineer_id",
        "name": "Engineer Name",
        "email": "engineer@example.com",
        "skills": ["JavaScript", "React"],
        "seniority": "mid",
        "maxCapacity": 100,
        "department": "Frontend",
        "title": "Mid Frontend Engineer"
      },
      "projectId": {
        "_id": "project_id",
        "name": "Project Name",
        "description": "Project description",
        "status": "active",
        "startDate": "date",
        "endDate": "date"
      },
      "allocationPercentage": 60,
      "startDate": "2025-01-15T00:00:00.000Z",
      "endDate": "2025-04-15T00:00:00.000Z",
      "role": "Developer",
      "status": "planned",
      "createdAt": "date",
      "hoursPerWeek": 24
    }
  }
  ```

### Delete Assignment

- **URL**: `/api/assignments/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Permissions**: Manager role only
- **Description**: Deletes an assignment
- **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {}
  }
  ```

## Data Models

### User Model

```javascript
{
  email: String (required, unique, valid email format),
  password: String (required, min 6 chars, not returned in queries),
  name: String (required),
  role: String (enum: ['engineer', 'manager'], required),
  skills: [String] (for engineers),
  seniority: String (enum: ['junior', 'mid', 'senior'], default: 'mid'),
  title: String (virtual, generated from seniority and department),
  maxCapacity: Number (default: 100),
  department: String (default: 'Engineering'),
  createdAt: Date (default: now)
}
```

### Project Model

```javascript
{
  name: String (required, max 50 chars),
  description: String (required),
  startDate: Date (required),
  endDate: Date (required),
  requiredSkills: [String] (required),
  teamSize: Number (required),
  status: String (enum: ['planning', 'active', 'completed'], default: 'planning'),
  managerId: ObjectId (reference to User, required),
  createdAt: Date (default: now)
}
```

### Assignment Model

```javascript
{
  engineerId: ObjectId (reference to User, required),
  projectId: ObjectId (reference to Project, required),
  allocationPercentage: Number (required, 1-100),
  startDate: Date (required),
  endDate: Date (required),
  role: String (required),
  status: String (enum: ['planned', 'active', 'completed'], default based on dates),
  createdAt: Date (default: now),
  hoursPerWeek: Number (virtual, calculated from allocationPercentage)
}
```

## Error Handling

All API endpoints return consistent error responses:

### Client Errors (4xx)

```json
{
  "success": false,
  "message": "Error message explaining what went wrong"
}
```

### Server Errors (5xx)

```json
{
  "success": false,
  "message": "Internal server error"
}
```

### Common Error Codes

- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## Additional Notes

- Assignments automatically update their status based on dates (planned, active, completed)
- Engineers have a capacity limit, and the system prevents over-allocation
- Engineers can only be assigned to projects if they have at least one of the required skills
- Engineers can only see their own assignments and projects they're assigned to
- Managers can see and manage all engineers, projects, and assignments
