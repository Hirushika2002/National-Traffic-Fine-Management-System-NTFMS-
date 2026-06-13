# National Traffic Fine Management System (NTFMS) - Admin Portal

A modern, responsive web application for managing traffic fines and violations in a centralized admin dashboard. Built with React and Vite, this portal provides law enforcement agencies with comprehensive tools to track, manage, and analyze traffic violations across multiple districts.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Components Overview](#components-overview)
- [Usage](#usage)

---

## ✨ Features

### 🔐 **Authentication & Security**
- User login/logout functionality with session management
- Secure authentication service integration
- Session persistence and token management
- Protected routes for authenticated users only

### 📊 **Dashboard**
- **Real-time Metrics**
  - Total revenue collection
  - Total fines issued
  - Pending cases
  - Active monitoring indicators
  
- **Visual Analytics**
  - Revenue trends with area charts
  - District-wise performance comparison (bar charts)
  - Fine category breakdown (pie charts)
  - Monthly trend analysis
  
- **Key Performance Indicators (KPIs)**
  - Total Amount: Comprehensive revenue overview
  - Amount Collected: Actual collected revenue with percentage tracking
  - Pending Cases: Outstanding fine counts
  - Closure Rate: Efficiency metrics
  
- **Recent Fines Display**
  - Latest issued fines preview
  - Quick status overview

### 📋 **Fines Management**
- **Comprehensive Fine Listing**
  - Search functionality (by fine details)
  - Multi-field filtering:
    - By District
    - By Category
    - By Status (Pending, Paid, Closed)
    - By Date Range (Start & End Date)
  
- **Detailed Fine Information**
  - Fine ID and violation details
  - Violator information (Name, Phone, License)
  - Location (District, GPS coordinates)
  - Fine category and amount
  - Status tracking
  
- **Payment Processing**
  - Online payment simulation modal
  - Credit card information capture
  - Payment confirmation workflow
  - Transaction status updates

### 🏙️ **District Management**
- **District Performance Tracking**
  - View all districts with collection statistics
  - Real-time data on:
    - Total fines issued per district
    - Total amount pending
    - Amount collected
    - Collection efficiency percentage
  
- **Search & Sorting**
  - Search districts by name
  - Dynamic sorting by multiple fields:
    - Collected amount
    - Total fines
    - Efficiency rate
  - Ascending/Descending order toggle

### 🏷️ **Fine Categories Management**
- **Category CRUD Operations**
  - View all fine categories
  - Add new violation categories
  - Manage penalty information
  
- **Category Details**
  - Category ID and Name
  - Fine Amount
  - Penalty Points
  - Total fines in category
  - Delete functionality

- **Form Interface**
  - Intuitive form for adding new categories
  - Field validation
  - Expandable/Collapsible form UI
  - Error handling

### 🎨 **User Interface & Experience**
- **Responsive Design**
  - Fully responsive layout for desktop and tablet
  - Adaptive components
  - Mobile-friendly navigation
  
- **Theme Support**
  - Dark mode and Light mode toggle
  - Theme persistence in localStorage
  - Dynamic CSS variable system
  
- **Navigation**
  - Intuitive sidebar navigation
  - Active tab highlighting
  - User profile display
  - Quick logout access
  
- **Visual Components**
  - Icon-rich interface using Lucide React icons
  - Interactive charts with Recharts library
  - Loading states and animations
  - Modal dialogs for detailed views
  - Table layouts for data presentation

### 📈 **Data Visualization**
- **Charts & Graphs**
  - Area charts for trend analysis
  - Bar charts for district comparison
  - Pie charts for category distribution
  - Responsive chart containers
  - Interactive tooltips and legends
  
- **Color-Coded Displays**
  - Status indicators (Pending, Paid, Closed)
  - Performance metrics with visual emphasis
  - Harmonious color palette for data differentiation

### 🔍 **Data Analysis & Reporting**
- **Dashboard Metrics**
  - Monthly trends and patterns
  - District-wise collection analysis
  - Category-wise breakdown
  - Statistical summaries
  
- **Filtering & Querying**
  - Advanced search capabilities
  - Multi-criteria filtering
  - Date range filtering
  - Real-time data updates

### ⚙️ **Additional Features**
- **Session Management**
  - Auto-checking of user authentication
  - Secure logout functionality
  - User data persistence
  
- **Error Handling**
  - User-friendly error messages
  - Validation feedback
  - Loading indicators
  
- **Performance Optimization**
  - API service abstraction
  - Efficient state management
  - Lazy loading where applicable

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.2.6 | UI Framework |
| **Vite** | 8.0.12 | Build Tool & Dev Server |
| **Recharts** | 3.8.1 | Data Visualization |
| **Lucide React** | 1.18.0 | Icon Library |
| **React DOM** | 19.2.6 | DOM Rendering |
| **ESLint** | 10.3.0 | Code Linting |

---

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd admin-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Verify installation**
   ```bash
   npm run lint
   ```

---

## 🚀 Getting Started

### Development Server

Start the development server with hot module replacement:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (default Vite port)

**Note:** Current build script has an issue. Use `npm run dev` for development.

### Build for Production

```bash
npm run build
```

Generated files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Linting

Check code quality:

```bash
npm run lint
```

---

## 📁 Project Structure

```
admin-portal/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, fonts, etc.
│   ├── components/        # React components
│   │   ├── Categories.jsx # Fine category management
│   │   ├── Dashboard.jsx  # Main dashboard with analytics
│   │   ├── Districts.jsx  # District performance tracking
│   │   ├── FinesList.jsx  # Fines listing and filtering
│   │   ├── Login.jsx      # Authentication UI
│   │   └── Sidebar.jsx    # Navigation sidebar
│   ├── services/
│   │   └── api.js         # API service & mock data
│   ├── App.jsx            # Root application component
│   ├── App.css            # Global application styles
│   ├── main.jsx           # Application entry point
│   └── index.css          # Base styles
├── eslint.config.js       # ESLint configuration
├── vite.config.js         # Vite configuration
├── package.json           # Project dependencies
├── README.md              # This file
└── index.html             # HTML entry point
```

---

## 🧩 Components Overview

### **Login.jsx**
User authentication component with credentials validation and session establishment.

**Features:**
- Email/Username input
- Password authentication
- Login error handling
- Session creation

### **Sidebar.jsx**
Main navigation component with theme toggle and user menu.

**Features:**
- Navigation links to all sections
- Active tab highlighting
- User profile display
- Theme toggle (Dark/Light mode)
- Logout button

### **Dashboard.jsx**
Central analytics and reporting dashboard with comprehensive metrics and visualizations.

**Features:**
- KPI cards with key metrics
- Monthly revenue trend chart
- District-wise performance bar chart
- Fine category distribution pie chart
- Recent fines list
- Real-time data updates

### **FinesList.jsx**
Complete fine management interface with advanced filtering and payment processing.

**Features:**
- Searchable fine listing
- Multi-criteria filtering (district, category, status, date range)
- Detailed fine modal view
- Payment processing simulation
- Status tracking
- Contact information display

### **Districts.jsx**
District performance and collection statistics dashboard.

**Features:**
- District listing with statistics
- Search by district name
- Multi-field sorting (collections, total fines, efficiency)
- Performance metrics display
- Responsive table layout

### **Categories.jsx**
Fine category management interface with CRUD operations.

**Features:**
- View all categories
- Add new fine categories
- Category details (ID, name, amount, points)
- Delete categories
- Form validation
- Category statistics

---

## 📖 Usage

### Logging In

1. Navigate to the login page
2. Enter your credentials
3. Click "Login" to access the dashboard

### Viewing Dashboard

- **Dashboard Tab:** View all metrics, trends, and recent activity
- **Metrics:** Scroll through key performance indicators
- **Charts:** Interact with charts (hover for details, zoom, etc.)

### Managing Fines

1. Go to **Fines List** section
2. Use filters to find specific fines:
   - Enter search term
   - Select district
   - Choose category
   - Set status filter
   - Select date range
3. Click on a fine to view details
4. Use **Pay** button to process payment (simulation)

### Analyzing Districts

1. Navigate to **Districts** section
2. Search for specific district
3. Sort by different metrics (collected, total, efficiency)
4. View performance data

### Managing Categories

1. Go to **Categories** section
2. View existing categories
3. Click **Add New Category** to create:
   - Enter Category ID
   - Enter Category Name
   - Set Fine Amount
   - Set Penalty Points
4. Delete categories as needed

### Toggling Theme

- Click the theme toggle button in the sidebar
- Current theme preference is saved automatically

---

## 🔐 Security Considerations

- Session validation on app load
- Protected authenticated routes
- Secure logout functionality
- Data isolation between user sessions
- Payment processing simulation (educational purposes)

---

## 🎯 Future Enhancements

- Real backend API integration
- Actual payment gateway integration
- Real-time notifications
- Advanced reporting features
- Bulk operations
- Export functionality (CSV, PDF)
- Role-based access control (RBAC)
- Two-factor authentication

---

## 📝 License

This project is part of an academic curriculum for Information Security studies.

---

## 👥 Contributors

National Traffic Fine Management System - Admin Portal  
Semester 6 - Information Security Project

---

## 📞 Support

For issues, questions, or suggestions, please contact your course instructor or project coordinator.

---

**Happy Traffic Management! 🚓**
