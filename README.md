# Event Management & Attendance Tracking System

## 🌟 Core Features

### 🔐 User Authentication System
- Secure login/registration with JWT tokens
- Role-based access control (Event Organizer and Participant roles)
- Password encryption using bcrypt

### 📅 Event Group Management
- Create and manage event groups with multiple events
- Event properties include:
  - Name
  - Start time
  - Duration
  - Unique access code (auto-generated)
  - State management (OPEN/CLOSED)
- Comprehensive event group viewing
- CSV export for participant data

### ✅ Event Check-in System
- Smart state management (auto OPEN/CLOSED based on time)
- Unique access codes per event
- Real-time check-in validation
- Duplicate check-in prevention
- QR code integration for access codes

### 🔄 Real-time Updates
- 5-second automatic polling interval
- Live participant count updates
- Dynamic event state changes

### 📊 Reporting and Analytics
- Event and group participation tracking
- Detailed attendance history
- CSV export capabilities
- Comprehensive participation analytics

## 🛠 Technical Features

### 💻 Modern Tech Stack
- **Frontend:** React with Vite
- **Backend:** Express.js
- **Database:** PostgreSQL with Sequelize ORM
- **UI Framework:** Tailwind CSS

### 🔒 Security Features
- JWT authentication
- Protected routing
- Secure password hashing
- Role-based access
- Input validation and sanitization

### 🎨 UI/UX Features
- Responsive design architecture
- Modern, clean interface
- Dynamic loading states
- Error handling system
- Success notifications
- Interactive data tables
- Collapsible sections

### 📁 Code Organization
- Component modularity
- Clean code architecture
- Reusable UI components
- Structured routing
- Middleware patterns

### 💾 Data Management
- Optimized database relations
- Transaction integrity
- Real-time sync
- Automated state handling
