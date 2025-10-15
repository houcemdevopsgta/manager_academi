import { useState, useEffect } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

// Pages
import LoginPage from '@/pages/LoginPage';
import DashboardLayout from '@/components/DashboardLayout';
import Dashboard from '@/pages/Dashboard';
import Students from '@/pages/Students';
import Teachers from '@/pages/Teachers';
import Courses from '@/pages/Courses';
import Exams from '@/pages/Exams';
import Grades from '@/pages/Grades';
import Attendance from '@/pages/Attendance';
import Schedules from '@/pages/Schedules';
import Departments from '@/pages/Departments';
import Profile from '@/pages/Profile';
import Users from '@/pages/Users';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Axios interceptor for auth
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <LoginPage onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/*"
            element={
              isAuthenticated ? (
                <DashboardLayout user={user} onLogout={handleLogout}>
                  <Routes>
                    <Route path="/" element={<Dashboard user={user} />} />
                    <Route path="/students" element={<Students user={user} />} />
                    <Route path="/teachers" element={<Teachers user={user} />} />
                    <Route path="/courses" element={<Courses user={user} />} />
                    <Route path="/exams" element={<Exams user={user} />} />
                    <Route path="/grades" element={<Grades user={user} />} />
                    <Route path="/attendance" element={<Attendance user={user} />} />
                    <Route path="/schedules" element={<Schedules user={user} />} />
                    <Route path="/departments" element={<Departments user={user} />} />
                    <Route path="/profile" element={<Profile user={user} />} />
                  </Routes>
                </DashboardLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
