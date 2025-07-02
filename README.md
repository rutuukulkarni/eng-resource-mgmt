# Engineering Resource Management System

A full-stack application to manage engineering team assignments across projects. Track who's working on what, their capacity allocation, and when they'll be available for new projects.

## Features

- **Authentication & User Roles**: Login system with Manager and Engineer roles
- **Engineer Management**: Track skills, seniority, employment type, and availability
- **Project Management**: Create and manage projects with required skills and timelines
- **Assignment System**: Assign engineers to projects with capacity tracking
- **Dashboard Views**: Different views for managers and engineers
- **Search & Analytics**: Find resources and view utilization metrics

## Tech Stack

### Frontend
- React with TypeScript
- ShadCN UI components with Tailwind CSS
- React Hook Form for forms
- Zustand for state management
- Charts for analytics

### Backend
- Node.js with Express
- MongoDB for database
- JWT for authentication
- RESTful API design

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB
- npm or yarn

### Backend Setup
```bash
cd server
npm install
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

## AI Development Approach

This project was developed with the assistance of AI tools:

- **GitHub Copilot**: Used for code generation and autocompletion
- **AI-assisted code review**: Used for optimizing code quality
- **AI for architectural decisions**: Used for designing the system architecture

### Examples of AI Acceleration
(To be documented during development)

### Challenges with AI-Generated Code
(To be documented during development)

### Validation Approach
(To be documented during development)

## Project Structure

- `/client` - Frontend React application
- `/server` - Backend Node.js API
- `/server/models` - Database schemas
- `/server/routes` - API endpoints
- `/client/src/components` - Reusable UI components
- `/client/src/pages` - Application pages

## Sample Data

The application includes seed data with:
- 3-4 Engineers with different skills and capacity
- 3-4 Projects with various requirements
- 6-8 Assignments showing different scenarios
- Mix of full-time and part-time engineers
