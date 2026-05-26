import React, { useState, useContext } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaArrowRight, FaBan, FaSignInAlt } from 'react-icons/fa';
import AgriLogo from '../components/AgriLogo';

const BannedScreen = ({ onLoginAgain }) => (
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
          Access to your account has been restricted
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
          Your account has been suspended by an administrator.
          You cannot log in until the suspension is lifted.
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

        <Button
          className="btn btn-primary w-100 mb-3"
          onClick={onLoginAgain}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem' }}
        >
          <FaSignInAlt /> Login with a Different Account
        </Button>

        <Link to="/" style={{ fontSize: '.78rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
          Back to home
        </Link>
      </div>
    </div>
  </div>
);

const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [banned, setBanned]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const { login }               = useContext(AuthContext);
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBanned(false);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      if (err.response?.data?.banned) {
        setBanned(true); // show banned screen — stays until user clicks "Login Again"
      } else {
        setError(err.response?.data?.msg || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginAgain = () => {
    setBanned(false);
    setEmail('');
    setPassword('');
    setError('');
  };

  if (banned) {
    return <BannedScreen onLoginAgain={handleLoginAgain} />;
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-card-header">
          <div className="auth-logo"><AgriLogo size={28} color="#fff" /></div>
          <h2 style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: '.25rem' }}>Welcome back</h2>
          <p style={{ opacity: .7, fontSize: '.83rem', margin: 0 }}>Sign in to your Agri-Tech account</p>
        </div>

        <div className="auth-card-body" style={{ textAlign: 'center' }}>
          {error && <Alert variant="danger" className="mb-4" style={{ textAlign: 'left' }}>{error}</Alert>}

          <Form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
            <Form.Group className="mb-3">
              <Form.Label>
                <FaEnvelope className="me-1" style={{ color: 'var(--primary)' }} /> Email Address
              </Form.Label>
              <Form.Control
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>
                <FaLock className="me-1" style={{ color: 'var(--primary)' }} /> Password
              </Form.Label>
              <Form.Control
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button type="submit" className="btn btn-primary w-100 btn-lg" disabled={loading}
              style={{ justifyContent: 'center' }}>
              {loading
                ? <Spinner animation="border" size="sm" />
                : <><span>Sign In</span> <FaArrowRight /></>}
            </Button>
          </Form>

          <div style={{ marginTop: '1.5rem', fontSize: '.82rem', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Create one
            </Link>
          </div>
          <div style={{ marginTop: '.75rem' }}>
            <Link to="/" style={{ fontSize: '.78rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
