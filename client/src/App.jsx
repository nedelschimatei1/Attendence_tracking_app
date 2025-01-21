import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './components/AdminDashboard';
import CreateEventGroup from './components/CreateEventGroup';
import ViewEventGroups from './components/ViewEventGroups';
import ViewParticipations from './components/ViewParticipations';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import EventGroupPage from './components/EventGroupPage';

const API_BASE_URL = 'http://localhost:8080/api';

const App = () => {

  const [user, setUser] = useState(() => {
    const role = localStorage.getItem('userRole');
    return role ? { role } : null;
  });

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      verifyToken(token);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/verifyUserIntegrity`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser({ role: data.role });
      } else {
        handleLogout();
      }
    } catch (err) {
      console.error('Token verification failed:', err);
      handleLogout();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userRole');
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        {/* Public route */}
        {/* Login route */}
        <Route path="/" element={<Login setUser={setUser} />} />

        {/* Protected route for Event Organizers */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute user={user} roleRequired="eventOrganizer">
              <AdminDashboard />
            </ProtectedRoute>
          }
      />

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/eventgroup/:id" element={<EventGroupPage />} />

      <Route path="/create-event-group" element={<CreateEventGroup />} />
      <Route path="/view-event-groups" element={<ViewEventGroups />} />
      <Route path="/view-participants" element={<ViewParticipations />} />

      <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
