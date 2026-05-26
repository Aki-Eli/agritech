import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Layout from './components/Layout';
import { FaBan, FaSignInAlt } from 'react-icons/fa';

// Public pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';

// Farmer pages
import FarmerDashboard from './pages/FarmerDashboard';
import FarmSetup from './pages/FarmSetup';
import CropManagement from './pages/CropManagement';
import WeatherPage from './pages/WeatherPage';
import PestAlerts from './pages/PestAlerts';
import Marketplace from './pages/Marketplace';
import Bookings from './pages/Bookings';
import Forum from './pages/Forum';
import MyOrders from './pages/MyOrders';
import SupportTickets from './pages/SupportTickets';
import HarvestHistory from './pages/HarvestHistory';
import ExpertConsultation from './pages/ExpertConsultation';
import Profile from './pages/Profile';

// Admin pages
import AdminUsers from './pages/admin/AdminUsers';
import AdminProducts from './pages/admin/AdminProducts';
import AdminBookings from './pages/admin/AdminBookings';
import AdminCrops from './pages/admin/AdminCrops';
import AdminSupport from './pages/admin/AdminSupport';
import AdminMaintenance from './pages/admin/AdminMaintenance';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminOrders from './pages/admin/AdminOrders';
import AdminExperts from './pages/admin/AdminExperts';

const AppRoutes = () => {
  const { user, loading, banned, clearBanned } = useContext(AuthContext);

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  // Mid-session ban — show full-screen banned notice, no redirect
  if (banned) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card" style={{ maxWidth: 440 }}>
          <div className="auth-card-header" style={{
            background: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%)'
          }}>
            <div className="auth-logo" style={{ background: 'rgba(255,255,255,.15)' }}>
              <FaBan />
            </div>
            <h2 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '.25rem' }}>
              Account Suspended
            </h2>
            <p style={{ opacity: .75, fontSize: '.83rem', margin: 0 }}>
              Your session has been terminated
            </p>
          </div>
          <div className="auth-card-body" style={{ textAlign: 'center' }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: '#fecaca', color: '#7f1d1d',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', margin: '0 auto 1.25rem'
            }}>
              <FaBan />
            </div>
            <p style={{ fontSize: '.88rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              Your account has been suspended by an administrator while you were logged in.
              Your session has been ended.
            </p>
            <div style={{
              background: '#fef9c3', border: '1px solid #fde047',
              borderRadius: 'var(--radius-md)', padding: '1rem',
              fontSize: '.82rem', color: '#713f12',
              textAlign: 'left', marginBottom: '1.75rem'
            }}>
              <strong style={{ display: 'block', marginBottom: '.4rem' }}>What can you do?</strong>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 1.9 }}>
                <li>Contact an administrator to appeal the suspension</li>
                <li>Wait for an admin to review and lift the ban</li>
                <li>If you believe this is a mistake, reach out via the support channel</li>
              </ul>
            </div>
            <button
              className="btn btn-primary w-100 mb-3"
              onClick={clearBanned}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem' }}
            >
              <FaSignInAlt /> Login with a Different Account
            </button>
            <a href="/" style={{ fontSize: '.78rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
              Back to home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={!user ? <LandingPage /> : <Navigate to={user.role === 'admin' ? '/admin/analytics' : '/dashboard'} />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'admin' ? '/admin/analytics' : '/dashboard'} />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to={user.role === 'admin' ? '/admin/analytics' : '/dashboard'} />} />

        {/* Farmer routes */}
        <Route path="/dashboard" element={user && user.role === 'farmer' ? <Layout><FarmerDashboard /></Layout> : <Navigate to="/login" />} />
        <Route path="/farm-setup" element={user ? <Layout><FarmSetup /></Layout> : <Navigate to="/login" />} />
        <Route path="/crops" element={user ? <Layout><CropManagement /></Layout> : <Navigate to="/login" />} />
        <Route path="/harvest-history" element={user ? <Layout><HarvestHistory /></Layout> : <Navigate to="/login" />} />
        <Route path="/weather" element={user ? <Layout><WeatherPage /></Layout> : <Navigate to="/login" />} />
        <Route path="/pest-alerts" element={user ? <Layout><PestAlerts /></Layout> : <Navigate to="/login" />} />
        <Route path="/marketplace" element={user ? <Layout><Marketplace /></Layout> : <Navigate to="/login" />} />
        <Route path="/my-orders" element={user ? <Layout><MyOrders /></Layout> : <Navigate to="/login" />} />
        <Route path="/bookings" element={user ? <Layout><Bookings /></Layout> : <Navigate to="/login" />} />
        <Route path="/experts" element={user ? <Layout><ExpertConsultation /></Layout> : <Navigate to="/login" />} />
        <Route path="/forum" element={user ? <Layout><Forum /></Layout> : <Navigate to="/login" />} />
        <Route path="/support" element={user ? <Layout><SupportTickets /></Layout> : <Navigate to="/login" />} />
        <Route path="/profile" element={user ? <Layout><Profile /></Layout> : <Navigate to="/login" />} />

        {/* Admin routes */}
        <Route path="/admin" element={user && user.role === 'admin' ? <Navigate to="/admin/analytics" /> : <Navigate to="/login" />} />
        <Route path="/admin/analytics" element={user && user.role === 'admin' ? <Layout><AdminAnalytics /></Layout> : <Navigate to="/login" />} />
        <Route path="/admin/users" element={user && user.role === 'admin' ? <Layout><AdminUsers /></Layout> : <Navigate to="/login" />} />
        <Route path="/admin/products" element={user && user.role === 'admin' ? <Layout><AdminProducts /></Layout> : <Navigate to="/login" />} />
        <Route path="/admin/orders" element={user && user.role === 'admin' ? <Layout><AdminOrders /></Layout> : <Navigate to="/login" />} />
        <Route path="/admin/bookings" element={user && user.role === 'admin' ? <Layout><AdminBookings /></Layout> : <Navigate to="/login" />} />
        <Route path="/admin/crops" element={user && user.role === 'admin' ? <Layout><AdminCrops /></Layout> : <Navigate to="/login" />} />
        <Route path="/admin/experts" element={user && user.role === 'admin' ? <Layout><AdminExperts /></Layout> : <Navigate to="/login" />} />
        <Route path="/admin/support" element={user && user.role === 'admin' ? <Layout><AdminSupport /></Layout> : <Navigate to="/login" />} />
        <Route path="/admin/maintenance" element={user && user.role === 'admin' ? <Layout><AdminMaintenance /></Layout> : <Navigate to="/login" />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
