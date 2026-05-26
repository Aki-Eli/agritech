import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  FaTractor, FaLeaf, FaCloudSun, FaBug, FaShoppingCart,
  FaCalendarAlt, FaUsers, FaChartLine, FaSignOutAlt,
  FaBars, FaBox, FaTicketAlt, FaTools,
  FaHistory, FaUserMd, FaHeadset, FaTimes, FaUserCircle
} from 'react-icons/fa';
import AgriLogo from './AgriLogo';

const farmerNavItems = [
  { section: 'Overview', items: [
    { path: '/dashboard',       label: 'Dashboard',           icon: <FaChartLine /> },
  ]},
  { section: 'Farm', items: [
    { path: '/farm-setup',      label: 'Farm Setup',          icon: <FaTractor /> },
    { path: '/crops',           label: 'Crop Management',     icon: <FaLeaf /> },
    { path: '/harvest-history', label: 'Harvest History',     icon: <FaHistory /> },
  ]},
  { section: 'Monitor', items: [
    { path: '/weather',         label: 'Weather',             icon: <FaCloudSun /> },
    { path: '/pest-alerts',     label: 'Pest Alerts',         icon: <FaBug /> },
  ]},
  { section: 'Market', items: [
    { path: '/marketplace',     label: 'Marketplace',         icon: <FaShoppingCart /> },
    { path: '/my-orders',       label: 'My Orders',           icon: <FaBox /> },
    { path: '/bookings',        label: 'Bookings',            icon: <FaCalendarAlt /> },
    { path: '/experts',         label: 'Expert Consultation', icon: <FaUserMd /> },
  ]},
  { section: 'Community', items: [
    { path: '/forum',           label: 'Forum',               icon: <FaUsers /> },
    { path: '/support',         label: 'Support',             icon: <FaHeadset /> },
    { path: '/profile',         label: 'My Profile',          icon: <FaUserCircle /> },
  ]},
];

const adminNavItems = [
  { section: 'Overview', items: [
    { path: '/admin/analytics',   label: 'Analytics',       icon: <FaChartLine /> },
  ]},
  { section: 'Management', items: [
    { path: '/admin/users',       label: 'Users',           icon: <FaUsers /> },
    { path: '/admin/products',    label: 'Products',        icon: <FaBox /> },
    { path: '/admin/orders',      label: 'Orders',          icon: <FaShoppingCart /> },
    { path: '/admin/bookings',    label: 'Bookings',        icon: <FaCalendarAlt /> },
    { path: '/admin/crops',       label: 'Crops',           icon: <FaLeaf /> },
    { path: '/admin/experts',     label: 'Experts',         icon: <FaUserMd /> },
  ]},
  { section: 'System', items: [
    { path: '/admin/support',     label: 'Support Tickets', icon: <FaTicketAlt /> },
    { path: '/admin/maintenance', label: 'Maintenance',     icon: <FaTools /> },
    { path: '/profile',           label: 'My Profile',      icon: <FaUserCircle /> },
  ]},
];

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const location         = useLocation();
  const navigate         = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navGroups = user?.role === 'admin' ? adminNavItems : farmerNavItems;

  const handleLogout = () => { logout(); navigate('/login'); };

  const allItems  = navGroups.flatMap(g => g.items);
  const current   = allItems.find(i => i.path === location.pathname);
  const pageTitle = current?.label || 'Agri-Tech';

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="dashboard-wrapper">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 199 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-icon">
            <AgriLogo size={20} color="#1b4332" />
          </div>
          <div>
            <h3>Agri-Tech</h3>
            <small>{user?.role === 'admin' ? 'Admin Panel' : 'Farmer Portal'}</small>
          </div>
        </div>

        <div className="sidebar-nav">
          {navGroups.map(group => (
            <div key={group.section}>
              <div className="sidebar-section-label">{group.section}</div>
              {group.items.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`sidebar-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-nav-item" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Sign Out</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="main-content">
        <div className="top-navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            <button
              className="btn btn-secondary btn-icon d-md-none"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <FaTimes /> : <FaBars />}
            </button>
            <span className="page-title">{pageTitle}</span>
          </div>
          <Link to="/profile" style={{ textDecoration: 'none' }}>
            <div className="user-pill">
              <div className="avatar">{initials}</div>
              <span>{user?.name}</span>
              {user?.role === 'admin' && (
                <span style={{
                  background: '#fee2e2', color: '#b91c1c',
                  fontSize: '.6rem', fontWeight: 700,
                  padding: '.15rem .45rem', borderRadius: '99px',
                  textTransform: 'uppercase', letterSpacing: '.4px'
                }}>Admin</span>
              )}
            </div>
          </Link>
        </div>

        <div className="page-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
