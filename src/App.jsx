import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './stores/useAuthStore';
import useThemeStore from './stores/useThemeStore';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import SearchModal from './components/search/SearchModal';
import StudentDashboard from './components/dashboard/StudentDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Results from './pages/Results';
import Trends from './pages/Trends';
import Transcript from './pages/Transcript';
import Students from './pages/Students';
import StudentDetails from './pages/StudentDetails';
import Upload from './pages/Upload';
import AuditLogs from './pages/AuditLogs';
import UserManagement from './pages/UserManagement';
import Settings from './pages/Settings';
import Onboarding from './pages/Onboarding';
import './index.css';

function App() {
  const { isAuthenticated, user } = useAuthStore();
  const { theme } = useThemeStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  if (!isAuthenticated) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  if (user?.requiresOnboarding) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="*" element={<Navigate to="/onboarding" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
        <Toaster position="top-center" reverseOrder={false} />
        <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

        <div
          style={{
            flex: 1,
            marginLeft: 'calc(var(--sidebar-collapsed-width) + 48px)',
            marginRight: '24px',
            marginTop: '24px',
            marginBottom: '24px',
            transition: 'margin-left 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div className="glass" style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: 'var(--border-radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-premium)' }}>
            <Header onSearchClick={() => setIsSearchOpen(true)} />

            <main style={{ flex: 1, overflowY: 'auto', paddingBottom: '32px' }}>
              <Routes>
              <Route
                path="/dashboard"
                element={
                  user?.role === 'student' ? <StudentDashboard /> : <AdminDashboard />
                }
              />
              {/* Common Routes */}
              <Route path="/profile" element={<Profile />} />

              {/* Student Routes */}
              <Route path="/results" element={<Results />} />
              <Route path="/trends" element={<Trends />} />
              <Route path="/transcript" element={<Transcript />} />

              {/* Admin Routes */}
              <Route path="/students" element={<Students />} />
              <Route path="/students/:id" element={<StudentDetails />} />
              <Route path="/upload" element={<Upload />} />

              {/* Super Admin Routes */}
              <Route path="/audit-logs" element={<AuditLogs />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/settings" element={<Settings />} />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
          </div>
        </div>

        <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      </div>
    </BrowserRouter>
  );
}

export default App;
