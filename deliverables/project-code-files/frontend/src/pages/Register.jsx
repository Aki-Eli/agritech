import React, { useState, useContext } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { FaUser, FaEnvelope, FaLock, FaUserTag, FaArrowRight, FaClock, FaEye, FaEyeSlash } from 'react-icons/fa';
import AgriLogo from '../components/AgriLogo';

const PasswordInput = ({ placeholder, value, onChange, show, onToggle }) => (
  <div style={{ position: 'relative' }}>
    <Form.Control
      type={show ? 'text' : 'password'}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required
      style={{ paddingRight: '2.5rem' }}
    />
    <button
      type="button"
      onClick={onToggle}
      style={{
        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text-muted)', padding: 0, fontSize: '.85rem', lineHeight: 1,
      }}
      tabIndex={-1}
    >
      {show ? <FaEyeSlash /> : <FaEye />}
    </button>
  </div>
);

const Register = () => {
  const [form, setForm]           = useState({ name: '', email: '', password: '', role: 'farmer' });
  const [confirm, setConfirm]     = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [pending, setPending]     = useState(null);
  const { login }                 = useContext(AuthContext);
  const navigate                  = useNavigate();

  const passwordsMatch = confirm === '' || form.password === confirm;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', form);

      if (res.data.approved === false) {
        setPending({ msg: res.data.msg, role: form.role });
        setLoading(false);
        return;
      }

      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Pending approval screen
  if (pending) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card" style={{ maxWidth: 440 }}>
          <div className="auth-card-header">
            <div className="auth-logo"><FaClock /></div>
            <h2 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '.25rem' }}>Account Pending Approval</h2>
            <p style={{ opacity: .7, fontSize: '.83rem', margin: 0 }}>
              {pending.role === 'admin' ? 'Admin account created' : 'Farmer account created'}
            </p>
          </div>
          <div className="auth-card-body" style={{ textAlign: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: '#fef9c3', color: '#a16207',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', margin: '0 auto 1.25rem'
            }}>
              <FaClock />
            </div>
            <p style={{ fontSize: '.88rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              {pending.msg}
            </p>
            <Link to="/login">
              <Button className="btn btn-primary w-100">Go to Login</Button>
            </Link>
            <div style={{ marginTop: '1rem' }}>
              <Link to="/" style={{ fontSize: '.78rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const helpText = {
    farmer: 'Farmer accounts require admin approval before first login.',
    admin:  'If an admin already exists, your account will need their approval. The very first admin is approved automatically.',
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-card-header">
          <div className="auth-logo"><AgriLogo size={28} color="#fff" /></div>
          <h2 style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: '.25rem' }}>Create your account</h2>
          <p style={{ opacity: .7, fontSize: '.83rem', margin: 0 }}>Start your smart farming journey today</p>
        </div>

        <div className="auth-card-body">
          {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label><FaUser className="me-1" style={{ color: 'var(--primary)' }} /> Full Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="John Farmer"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label><FaEnvelope className="me-1" style={{ color: 'var(--primary)' }} /> Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label><FaLock className="me-1" style={{ color: 'var(--primary)' }} /> Password</Form.Label>
              <PasswordInput
                placeholder="At least 6 characters"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                show={showPw}
                onToggle={() => setShowPw(p => !p)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label><FaLock className="me-1" style={{ color: 'var(--primary)' }} /> Confirm Password</Form.Label>
              <PasswordInput
                placeholder="Re-enter your password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                show={showConfirm}
                onToggle={() => setShowConfirm(p => !p)}
              />
              {confirm && !passwordsMatch && (
                <Form.Text style={{ color: 'var(--danger)', fontSize: '.75rem' }}>
                  Passwords do not match.
                </Form.Text>
              )}
              {confirm && passwordsMatch && confirm.length > 0 && (
                <Form.Text style={{ color: 'var(--success)', fontSize: '.75rem' }}>
                  Passwords match.
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label><FaUserTag className="me-1" style={{ color: 'var(--primary)' }} /> Account Type</Form.Label>
              <Form.Select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="farmer">Farmer</option>
                <option value="admin">Admin</option>
              </Form.Select>
              <Form.Text style={{ color: 'var(--text-muted)', fontSize: '.75rem' }}>
                {helpText[form.role]}
              </Form.Text>
            </Form.Group>

            <Button
              type="submit"
              className="btn btn-primary w-100 btn-lg"
              disabled={loading || !passwordsMatch}
            >
              {loading
                ? <Spinner animation="border" size="sm" />
                : <><span>Create Account</span> <FaArrowRight /></>}
            </Button>
          </Form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '.82rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </div>
          <div style={{ textAlign: 'center', marginTop: '.75rem' }}>
            <Link to="/" style={{ fontSize: '.78rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
