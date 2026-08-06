import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Navigation/Sidebar';
import { Navbar } from './components/Navigation/Navbar';

import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Workflows } from './pages/Workflows';
import { WorkflowBuilder } from './pages/WorkflowBuilder';
import { WorkflowDetail } from './pages/WorkflowDetail';
import { Templates } from './pages/Templates';
import { Tasks } from './pages/Tasks';
import { Approvals } from './pages/Approvals';
import { Documents } from './pages/Documents';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center text-slate-400">
        <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#080c14] overflow-x-hidden">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected App Workspace Routes */}
        <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
        <Route path="/workflows" element={<ProtectedLayout><Workflows /></ProtectedLayout>} />
        <Route path="/workflows/new" element={<ProtectedLayout><WorkflowBuilder /></ProtectedLayout>} />
        <Route path="/workflows/:id" element={<ProtectedLayout><WorkflowDetail /></ProtectedLayout>} />
        <Route path="/templates" element={<ProtectedLayout><Templates /></ProtectedLayout>} />
        <Route path="/tasks" element={<ProtectedLayout><Tasks /></ProtectedLayout>} />
        <Route path="/approvals" element={<ProtectedLayout><Approvals /></ProtectedLayout>} />
        <Route path="/documents" element={<ProtectedLayout><Documents /></ProtectedLayout>} />
        <Route path="/analytics" element={<ProtectedLayout><Analytics /></ProtectedLayout>} />
        <Route path="/settings" element={<ProtectedLayout><Settings /></ProtectedLayout>} />
        <Route path="/profile" element={<ProtectedLayout><Profile /></ProtectedLayout>} />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
};
