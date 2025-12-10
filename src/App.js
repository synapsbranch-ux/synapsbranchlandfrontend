import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import MainLayout from './components/MainLayout';
import LoginPage from './components/LoginPage';
import InvitePage from './components/InvitePage';
import AuthCallback from './components/AuthCallback';
import ArtifactsGallery from './components/ArtifactsGallery';

import { useStore } from './store/useStore';
import './App.css';

/**
 * Protected Route Component
 * Redirects to /invite if user doesn't have access_granted
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user is authenticated but doesn't have access_granted, redirect to invite page
  if (user && !user.access_granted) {
    return <Navigate to="/invite" replace />;
  }

  return children;
};

/**
 * Auth Route Component
 * Redirects to home if already authenticated with access
 */
const AuthRoute = ({ children }) => {
  const { isAuthenticated, user } = useStore();

  if (isAuthenticated && user?.access_granted) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { theme, initTheme, initAuth, isAuthenticated, user } = useStore();

  useEffect(() => {
    initTheme();
    initAuth();
  }, [initTheme, initAuth]);

  // Determine what to render for the main route
  const getMainElement = () => {
    if (!isAuthenticated) {
      return <LoginPage />;
    }

    // Check if user needs to enter invite code
    if (user && !user.access_granted) {
      return <Navigate to="/invite" replace />;
    }

    return <MainLayout />;
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              <AuthRoute>
                <LoginPage />
              </AuthRoute>
            }
          />

          {/* OAuth Callback */}
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Invite Code Page */}
          <Route
            path="/invite"
            element={
              isAuthenticated ? <InvitePage /> : <Navigate to="/login" replace />
            }
          />

          {/* Protected Routes */}
          <Route
            path="/artifacts"
            element={
              <ProtectedRoute>
                <ArtifactsGallery />
              </ProtectedRoute>
            }
          />

          {/* Main App Routes */}
          <Route
            path="/*"
            element={getMainElement()}
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" theme={theme} richColors />
    </div>
  );
}

export default App;
