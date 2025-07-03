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
8. [Assignment System Implementation](#assignment-system-implementation)

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

## Assignment System Implementation

The assignment system is a core component of the Engineering Resource Management System, enabling managers to effectively allocate engineers to projects while tracking capacity utilization.

### Key Features

1. **Assign Engineers to Projects**:
   - Select engineer with appropriate skills
   - Select project that matches engineer's skills
   - Specify allocation percentage (5-100%)
   - Define start and end dates
   - Assign a specific role for the engineer on the project

2. **View Current Assignments**:
   - Table view showing who's working on which projects
   - Duration information (start date, end date, total days)
   - Role information for each assignment
   - Filter by engineer, project, or status

3. **Capacity Tracking**:
   - Visual progress bars showing allocation percentages
   - Color-coded indicators (blue: low, green: moderate, yellow: high)
   - Available capacity calculation for each engineer
   - Warning indicators when assignments exceed available capacity

### Components

#### AddAssignmentModal.tsx

The modal component for creating new assignments with these key features:

- **Engineer selection** with skill filtering
- **Project selection** with automatic filtering based on skill match
- **Real-time capacity visualization** showing engineer's current allocation
- **Validation** to prevent over-allocation of engineers
- **Allocation slider** with percentage and hours per week calculation
- **Date range selection** for assignment period

#### ProjectDetailsModal.tsx

Detailed project view with assignment management capabilities:

- **Project information** display (skills, dates, team size)
- **Assignment list** specific to the selected project
- **Add/remove engineers** directly from the project view
- **Capacity visualization** for each assigned engineer
- **Team capacity tracker** showing progress toward desired team size

### Integration Points

1. **Engineers Page**:
   - Enhanced to show real-time capacity information
   - Visual indicators of current workload
   - Available capacity percentage display

2. **Projects Page**:
   - Click on any project card to open ProjectDetailsModal
   - Manage assignments directly from project context
   - Visual team size progress indicator

3. **Assignments Page**:
   - Comprehensive view of all assignments
   - Enhanced capacity visualization
   - Duration calculation and display
   - Assignment filtering capabilities

### Implementation Details

1. **Capacity Calculation**:
   - Uses the backend `/api/engineers/:id/capacity` endpoint
   - Considers date overlaps for accurate capacity calculation
   - Updates in real-time when assignments change

2. **Skill Matching**:
   - Projects list filtered based on engineer's skills
   - Warning indicators for skill mismatches
   - Prevents assigning engineers to projects requiring skills they don't have

3. **Visual Indicators**:
   - Color-coded progress bars for capacity
   - Allocation indicators (low/moderate/high)
   - Warning indicators for overallocation
