import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Array<'HR Admin' | 'Employee'>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, role, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(role)) {
    // If an employee tries to access an HR route, redirect to Employee Portal
    if (role === 'Employee') {
      return <Navigate to="/portal" replace />;
    }
    // If HR Admin tries to access the Employee self-service personal portal, redirect to HR Dashboard
    if (role === 'HR Admin') {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};
