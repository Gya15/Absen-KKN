import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import Navbar from './components/layout/Navbar';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AttendancePage from './pages/AttendancePage';
import HistoryPage from './pages/HistoryPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAttendance from './pages/admin/AdminAttendance';

// Layout wrapper for participant routes to include Navbar
const PesertaLayout = ({ children }) => (
  <div className="min-h-screen bg-surface">
    <div className="gradient-mesh" />
    <Navbar />
    <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {children}
    </main>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            
            {/* Protected Peserta Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={
                <PesertaLayout>
                  <DashboardPage />
                </PesertaLayout>
              } />
              <Route path="/attendance" element={
                <PesertaLayout>
                  <AttendancePage />
                </PesertaLayout>
              } />
              <Route path="/history" element={
                <PesertaLayout>
                  <HistoryPage />
                </PesertaLayout>
              } />
            </Route>
            
            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute requireAdmin={true} />}>
              <Route path="/admin" element={
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              } />
              <Route path="/admin/users" element={
                <AdminLayout>
                  <AdminUsers />
                </AdminLayout>
              } />
              <Route path="/admin/attendance" element={
                <AdminLayout>
                  <AdminAttendance />
                </AdminLayout>
              } />
            </Route>
            
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
