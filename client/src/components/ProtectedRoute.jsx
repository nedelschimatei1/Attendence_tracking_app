import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ user, roleRequired, children }) => {
  if (!user || !roleRequired.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default ProtectedRoute;