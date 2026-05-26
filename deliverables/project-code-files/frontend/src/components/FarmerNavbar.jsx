import React, { useContext } from 'react';
import { Navbar, Nav, Container, Button, Dropdown, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  FaTractor, FaLeaf, FaCloudSun, FaBug, FaShoppingCart, 
  FaCalendarAlt, FaUsers, FaSignOutAlt, FaUser, FaBell 
} from 'react-icons/fa';

const FarmerNavbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar expand="lg" className="navbar-brown" variant="dark" sticky="top">
      <Container fluid>
        <Navbar.Brand as={Link} to="/dashboard" className="fw-bold">
          🌾 Agri-Tech
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="farmer-navbar-nav" />
        <Navbar.Collapse id="farmer-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/farm-setup">Farm Setup</Nav.Link>
            <Nav.Link as={Link} to="/crops">Crops</Nav.Link>
            <Nav.Link as={Link} to="/weather">Weather</Nav.Link>
            <Nav.Link as={Link} to="/pest-alerts">Pests</Nav.Link>
            <Nav.Link as={Link} to="/marketplace">Marketplace</Nav.Link>
            <Nav.Link as={Link} to="/bookings">Bookings</Nav.Link>
            <Nav.Link as={Link} to="/forum">Forum</Nav.Link>
            <Dropdown align="end" className="ms-2">
              <Dropdown.Toggle variant="outline-light" size="sm" id="dropdown-user">
                <FaUser className="me-1" /> {user?.name?.split(' ')[0] || 'Farmer'}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={handleLogout}>
                  <FaSignOutAlt className="me-2" /> Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default FarmerNavbar;