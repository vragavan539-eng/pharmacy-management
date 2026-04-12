import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Pages
import LandingPage   from './pages/LandingPage';
import Login         from './pages/Login';
import Home          from './pages/Home';
import Dashboard     from './pages/Dashboard';
import Drugs         from './pages/Drugs';
import Patients      from './pages/Patients';
import Prescriptions from './pages/Prescriptions';
import Billing       from './pages/Billing';
import Inventory     from './pages/Inventory';
import AIFeatures    from './pages/AIFeatures';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#6b7c74' }}>
      ⏳ Loading…
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/"      element={<LandingPage />} />
      <Route path="/login" element={<Login />} />

      {/* Protected Routes - inside Layout (sidebar) */}
      <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index                  element={<Home />} />
        <Route path="dashboard"       element={<Dashboard />} />
        <Route path="drugs"           element={<Drugs />} />
        <Route path="patients"        element={<Patients />} />
        <Route path="prescriptions"   element={<Prescriptions />} />
        <Route path="billing"         element={<Billing />} />
        <Route path="inventory"       element={<Inventory />} />
        <Route path="ai"              element={<AIFeatures />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontSize: 13, borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.12)' },
          success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
        }}
      />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;