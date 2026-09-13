import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession, Employee } from '../types';
import { loginUser, fetchEmployeeById } from '../services/api';

interface AuthContextType {
  user: UserSession | null;
  currentEmployee: Employee | null;
  isAuthenticated: boolean;
  role: 'HR Admin' | 'Employee';
  login: (credentials: { email?: string; employeeId?: string; role?: 'HR Admin' | 'Employee' }) => Promise<void>;
  switchPersona: (role: 'HR Admin' | 'Employee', employeeId?: string) => Promise<void>;
  logout: () => void;
  refreshEmployeeProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(() => {
    const stored = localStorage.getItem('workforce_user_session');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse auth session:', e);
      }
    }
    // Default executive session
    return {
      id: 'USR-HR-001',
      name: 'Alexandra Vance',
      email: 'alexandra.vance@workforceintel.ai',
      role: 'HR Admin',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      department: 'Human Resources',
      title: 'VP of Human Resources',
    };
  });

  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(() => {
    const storedEmp = localStorage.getItem('workforce_current_employee');
    if (storedEmp) {
      try {
        return JSON.parse(storedEmp);
      } catch (e) {
        console.error('Failed to parse employee session:', e);
      }
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('workforce_user_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('workforce_user_session');
      localStorage.removeItem('workforce_current_employee');
      setCurrentEmployee(null);
    }
  }, [user]);

  const refreshEmployeeProfile = async () => {
    if (user && user.role === 'Employee') {
      try {
        const emp = await fetchEmployeeById(user.id);
        if (emp) {
          setCurrentEmployee(emp);
          localStorage.setItem('workforce_current_employee', JSON.stringify(emp));
        }
      } catch (e) {
        console.error('Failed to refresh employee profile:', e);
      }
    }
  };

  const login = async (credentials: {
    email?: string;
    employeeId?: string;
    role?: 'HR Admin' | 'Employee';
  }) => {
    const res = await loginUser(credentials);
    if (res.success && res.user) {
      setUser(res.user);
      if (res.user.role === 'Employee') {
        const emp = await fetchEmployeeById(res.user.id);
        setCurrentEmployee(emp);
        if (emp) {
          localStorage.setItem('workforce_current_employee', JSON.stringify(emp));
        }
      } else {
        setCurrentEmployee(null);
      }
    }
  };

  const switchPersona = async (role: 'HR Admin' | 'Employee', employeeId?: string) => {
    if (role === 'HR Admin') {
      const hrUser: UserSession = {
        id: 'USR-HR-001',
        name: 'Alexandra Vance',
        email: 'alexandra.vance@workforceintel.ai',
        role: 'HR Admin',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        department: 'Human Resources',
        title: 'VP of Human Resources',
      };
      setUser(hrUser);
      setCurrentEmployee(null);
      localStorage.removeItem('workforce_current_employee');
    } else {
      const empId = employeeId || 'EMP00001';
      const emp = await fetchEmployeeById(empId);
      const empUser: UserSession = {
        id: emp ? emp.id : empId,
        name: emp ? emp.name : 'Employee_1',
        email: emp ? emp.email : `${empId.toLowerCase()}@company.com`,
        role: 'Employee',
        avatar: emp ? emp.avatar : 'https://randomuser.me/api/portraits/men/1.jpg',
        department: emp?.department || 'IT',
        title: emp?.role || 'Senior Analyst',
        employeeDetails: emp || undefined,
      };
      setUser(empUser);
      setCurrentEmployee(emp);
      if (emp) {
        localStorage.setItem('workforce_current_employee', JSON.stringify(emp));
      }
    }
  };

  const logout = () => {
    setUser(null);
    setCurrentEmployee(null);
    localStorage.removeItem('workforce_user_session');
    localStorage.removeItem('workforce_current_employee');
  };

  const currentRole = user?.role === 'Employee' ? 'Employee' : 'HR Admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        currentEmployee,
        isAuthenticated: !!user,
        role: currentRole,
        login,
        switchPersona,
        logout,
        refreshEmployeeProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
