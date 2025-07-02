# Frontend Documentation - Engineering Resource Management System

This document provides comprehensive information about the frontend components, pages, and functionality of the Engineering Resource Management System.

## Table of Contents

1. [Frontend Architecture](#frontend-architecture)
2. [Pages and Routes](#pages-and-routes)
3. [Layouts](#layouts)
4. [State Management](#state-management)
5. [API Integration](#api-integration)
6. [Authentication Flow](#authentication-flow)
7. [Component Hierarchy](#component-hierarchy)

## Frontend Architecture

The frontend is built with:

- **React 18**: For component-based UI development
- **TypeScript**: For type safety and better developer experience
- **Vite**: For fast development and optimized builds
- **TailwindCSS**: For utility-first styling
- **React Router**: For client-side routing
- **Zustand**: For lightweight state management
- **Axios**: For API requests

## Pages and Routes

### Authentication

- **/login** (`Login.tsx`): User login page
  - Email/password form
  - Authentication error handling
  - Redirects to dashboard on success

- **/register** (`Register.tsx`): User registration page
  - Registration form with validation
  - Role selection (Manager/Engineer)
  - Additional fields based on role (skills, department, etc.)

### Dashboard

- **/** (`Dashboard.tsx`): Main dashboard
  - Displays different content based on user role
  - For managers: Overview of all projects and engineers
  - For engineers: Personal assignments and projects

### Engineers

- **/engineers** (`Engineers.tsx`): Engineers list page
  - For managers: List of all engineers with skills and capacity
  - For engineers: Access denied (redirects to dashboard)
  - Filters for skills, department, and availability

- **/profile** (`Profile.tsx`): Current user profile
  - View and edit personal information
  - Update skills and other attributes
  - View capacity and allocations over time

### Projects

- **/projects** (`Projects.tsx`): Projects list page
  - For managers: All projects with status and timeline
  - For engineers: Only assigned projects
  - Filtering and sorting options

### Assignments

- **/assignments** (`Assignments.tsx`): Assignments management
  - For managers: Create and manage all assignments
  - For engineers: View personal assignments
  - Timeline visualization of assignments

- **/assignments/new** (within `Assignments.tsx`): Create new assignment
  - Select engineer, project, allocation percentage
  - Date range picker for assignment period
  - Role specification

## Layouts

The application uses two main layouts:

### AuthLayout (`AuthLayout.tsx`)

- Used for authentication pages (login, register)
- Simple layout with centered content
- Brand elements and minimal UI

### DashboardLayout (`DashboardLayout.tsx`)

- Used for all authenticated pages
- Includes navigation sidebar
- Top header with user info and logout
- Main content area with page-specific components
- Responsive design for various screen sizes

## State Management

Zustand is used for state management with the following stores:

### Auth Store (`authStore.ts`)

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  getProfile: () => Promise<void>;
}
```

- Handles authentication state
- Stores user information and JWT token
- Provides login, register, logout methods
- Persists authentication state in localStorage

## API Integration

API requests are handled using Axios with a base configuration:

- Base URL: `http://localhost:5001/api`
- Authentication header setup
- Response interceptors for error handling
- Request transformations

The frontend makes calls to the following API endpoints:

- **Authentication**: `/api/auth/*`
- **Engineers**: `/api/engineers/*`
- **Projects**: `/api/projects/*`
- **Assignments**: `/api/assignments/*`

## Authentication Flow

1. User enters credentials on login page
2. Frontend calls `/api/auth/login` endpoint
3. On success, JWT token is stored in:
   - Zustand store (in-memory)
   - localStorage (persistence)
4. Axios interceptor adds token to all subsequent requests
5. Protected routes check for authentication state
6. Token expiration is handled by refreshing or redirecting to login

## Component Hierarchy

```
App
├── AuthLayout
│   ├── Login
│   └── Register
├── DashboardLayout
│   ├── Dashboard
│   ├── Engineers
│   ├── Projects
│   ├── Assignments
│   └── Profile
└── NotFound
```

### Common Components

- **Button**: Reusable button component with variants
- **Card**: Container component for consistent styling
- **Form elements**: Input, Select, Checkbox with validation
- **Table**: Data table with sorting and pagination
- **Modal**: Dialog component for forms and confirmations
- **Toaster**: Notification system for success/error messages

## Responsive Design

The application is fully responsive with breakpoints:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

Layout adjustments:
- Sidebar collapses to bottom navigation on mobile
- Tables convert to cards on small screens
- Forms adjust field layout based on screen width
