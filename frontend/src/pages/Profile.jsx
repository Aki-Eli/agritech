import React, { useState, useContext } from 'react';
import { Row, Col, Card, Form, Button, Alert, Modal, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
  FaUser, FaEnvelope, FaLock, FaSave, FaTrash,
  FaExclamationTriangle, FaEye, FaEyeSlash, FaSignOutAlt
} from 'react-icons/fa';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { user, logout, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [nameForm, setNameForm]       = useState({ name: user?.name || '' });
  const [emailForm, setEmailForm]     = useState({ email: user?.email || '' });
  const [pwForm, setPwForm]           = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw]           = useState({ current: false, newPw: false, confirm: false });

  const [saving, setSaving]           = useState({ name: false, email: false, pw: false });
  const [success, setSuccess]         = useState({ name: '', email: '', pw: '' });
  const [errors, setErrors]           = useState({ name: '', email: '', pw: '' });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm]     = useState('');
  const [deleting, setDeleting]               = useState(false);
  const [deleteError, setDeleteError]         = useState('');

  const flash = (field, msg, isError = false) => {
    if (isError) {
      setErrors(p => ({ ...p, [field]: msg }));
      setTimeout(() => setErrors(p => ({ ...p, [field]: '' })), 4000);
    } else {
      setSuccess(p => ({ ...p, [field]: msg }));
      setTimeout(() => setSuccess(p => ({ ...p, [field]: '' })), 4000);
    }
  };

  /* ── Update name ── */
  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!nameForm.name.trim()) { flash('name', 'Name cannot be empty.', true); return; }
    setSaving(p => ({ ...p, name: true }));
    try {
      await axios.put(`/api/users/profile/${user._id}`, { name: nameForm.name });
      await refreshUser();
      flash('name', 'Name updated successfully.');
    } catch (err) {
      flash('name', err.response?.data?.msg || 'Failed to update name.', true);
    }
    setSaving(p => ({ ...p, name: false }));
  };

  /* ── Update email ── */
  const handleSaveEmail = async (e) => {
    e.preventDefault();
    if (!emailForm.email.trim()) { flash('email', 'Email cannot be empty.', true); return; }
    setSaving(p => ({ ...p, email: true }));
    try {
      await axios.put(`/api/users/profile/${user._id}`, { email: emailForm.email });
      await refreshUser();
      flash('email', 'Email updated successfully.');
    } catch (err) {
      flash('email', err.response?.data?.msg || 'Failed to update email.', true);
    }
    setSaving(p => ({ ...p, email: false }));
  };

  /* ── Update password ── */
  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!pwForm.current)              { flash('pw', 'Enter your current password.', true); return; }
    if (pwForm.newPw.length < 6)      { flash('pw', 'New password must be at least 6 characters.', true); return; }
    if (pwForm.newPw !== pwForm.confirm) { flash('pw', 'New passwords do not match.', true); return; }

    setSaving(p => ({ ...p, pw: true }));
    try {
      // Verify current password by attempting login
      await axios.post('/api/auth/login', { email: user.email, password: pwForm.current });
      await axios.put(`/api/users/profile/${user._id}`, { password: pwForm.newPw });
      setPwForm({ current: '', newPw: '', confirm: '' });
      flash('pw', 'Password changed successfully.');
    } catch (err) {
      flash('pw', err.response?.data?.msg === 'Invalid credentials'
        ? 'Current password is incorrect.'
        : err.response?.data?.msg || 'Failed to update password.', true);
    }
    setSaving(p => ({ ...p, pw: false }));
  };

  /* ── Delete account ── */
  const handleDeleteAccount = async () => {
    if (deleteConfirm !== user.name) {
      setDeleteError(`Type your name exactly: "${user.name}"`);
      return;
    }
    setDeleting(true);
    try {
      await axios.delete(`/api/users/profile/${user._id}`);
      logout();
      navigate('/');
    } catch (err) {
      setDeleteError(err.response?.data?.msg || 'Failed to delete account.');
      setDeleting(false);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const togglePw = (field) => setShowPw(p => ({ ...p, [field]: !p[field] }));

  const PasswordInput = ({ field, placeholder, value, onChange }) => (
    <div style={{ position: 'relative' }}>
      <Form.Control
        type={showPw[field] ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{ paddingRight: '2.5rem' }}
      />
      <button
        type="button"
        onClick={() => togglePw(field)}
        style={{
          position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', padding: 0, fontSize: '.85rem'
        }}
      >
        {showPw[field] ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
  );

  return (
    <>
      <div className="page-header">
        <h2>My Profile</h2>
        <p>Manage your account details and security settings.</p>
      </div>

      <Row className="g-4">
        {/* Left — avatar + info */}
        <Col lg={3}>
          <Card className="dashboard-card" style={{ border: 'none', textAlign: 'center' }}>
            <Card.Body style={{ padding: '2rem 1.5rem' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'var(--primary)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.75rem', fontWeight: 800,
                margin: '0 auto 1rem'
              }}>
                {initials}
              </div>
              <h5 style={{ fontWeight: 700, marginBottom: '.25rem' }}>{user?.name}</h5>
              <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginBottom: '.75rem' }}>{user?.email}</p>
              <span style={{
                display: 'inline-block',
                background: user?.role === 'admin' ? '#fee2e2' : 'var(--primary-pale)',
                color: user?.role === 'admin' ? '#b91c1c' : 'var(--primary)',
                fontSize: '.7rem', fontWeight: 700,
                padding: '.25rem .75rem', borderRadius: 'var(--radius-full)',
                textTransform: 'uppercase', letterSpacing: '.5px'
              }}>
                {user?.role}
              </span>

              <hr style={{ margin: '1.25rem 0', borderColor: 'var(--border)' }} />

              <button
                onClick={() => { logout(); navigate('/login'); }}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
                  background: 'var(--surface-3)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '.55rem 1rem',
                  fontSize: '.82rem', fontWeight: 600,
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'background .15s, color .15s, border-color .15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#fee2e2';
                  e.currentTarget.style.color = '#b91c1c';
                  e.currentTarget.style.borderColor = '#fca5a5';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--surface-3)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                <FaSignOutAlt /> Sign Out
              </button>
            </Card.Body>
          </Card>
        </Col>

        {/* Right — edit forms */}
        <Col lg={9}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Name */}
            <Card className="dashboard-card" style={{ border: 'none' }}>
              <div className="card-header-clean">
                <h5><FaUser className="me-2" style={{ color: 'var(--primary)' }} />Display Name</h5>
              </div>
              <Card.Body style={{ padding: '1.5rem' }}>
                {success.name && <Alert variant="success" style={{ fontSize: '.82rem' }}>{success.name}</Alert>}
                {errors.name  && <Alert variant="danger"  style={{ fontSize: '.82rem' }}>{errors.name}</Alert>}
                <Form onSubmit={handleSaveName}>
                  <Row className="g-3 align-items-end">
                    <Col md={8}>
                      <Form.Group>
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                          value={nameForm.name}
                          onChange={e => setNameForm({ name: e.target.value })}
                          placeholder="Your full name"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Button type="submit" className="btn btn-primary w-100" disabled={saving.name}>
                        {saving.name ? <Spinner animation="border" size="sm" /> : <><FaSave /> Save Name</>}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>

            {/* Email */}
            <Card className="dashboard-card" style={{ border: 'none' }}>
              <div className="card-header-clean">
                <h5><FaEnvelope className="me-2" style={{ color: 'var(--primary)' }} />Email Address</h5>
              </div>
              <Card.Body style={{ padding: '1.5rem' }}>
                {success.email && <Alert variant="success" style={{ fontSize: '.82rem' }}>{success.email}</Alert>}
                {errors.email  && <Alert variant="danger"  style={{ fontSize: '.82rem' }}>{errors.email}</Alert>}
                <Form onSubmit={handleSaveEmail}>
                  <Row className="g-3 align-items-end">
                    <Col md={8}>
                      <Form.Group>
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control
                          type="email"
                          value={emailForm.email}
                          onChange={e => setEmailForm({ email: e.target.value })}
                          placeholder="you@example.com"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Button type="submit" className="btn btn-primary w-100" disabled={saving.email}>
                        {saving.email ? <Spinner animation="border" size="sm" /> : <><FaSave /> Save Email</>}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>

            {/* Password */}
            <Card className="dashboard-card" style={{ border: 'none' }}>
              <div className="card-header-clean">
                <h5><FaLock className="me-2" style={{ color: 'var(--primary)' }} />Change Password</h5>
              </div>
              <Card.Body style={{ padding: '1.5rem' }}>
                {success.pw && <Alert variant="success" style={{ fontSize: '.82rem' }}>{success.pw}</Alert>}
                {errors.pw  && <Alert variant="danger"  style={{ fontSize: '.82rem' }}>{errors.pw}</Alert>}
                <Form onSubmit={handleSavePassword}>
                  <Row className="g-3">
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>Current Password</Form.Label>
                        <PasswordInput
                          field="current"
                          placeholder="Enter your current password"
                          value={pwForm.current}
                          onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>New Password</Form.Label>
                        <PasswordInput
                          field="newPw"
                          placeholder="At least 6 characters"
                          value={pwForm.newPw}
                          onChange={e => setPwForm(p => ({ ...p, newPw: e.target.value }))}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Confirm New Password</Form.Label>
                        <PasswordInput
                          field="confirm"
                          placeholder="Repeat new password"
                          value={pwForm.confirm}
                          onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12}>
                      <Button type="submit" className="btn btn-primary" disabled={saving.pw}>
                        {saving.pw ? <Spinner animation="border" size="sm" /> : <><FaLock /> Update Password</>}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>

            {/* Danger zone */}
            <Card style={{ border: '1.5px solid #fca5a5', borderRadius: 'var(--radius-lg)', background: '#fff' }}>
              <div className="card-header-clean" style={{ borderBottom: '1px solid #fca5a5' }}>
                <h5 style={{ color: '#b91c1c' }}>
                  <FaExclamationTriangle className="me-2" />Danger Zone
                </h5>
              </div>
              <Card.Body style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '.88rem', marginBottom: '.25rem' }}>Delete Account</div>
                    <div style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>
                      Permanently delete your account and all associated data. This cannot be undone.
                    </div>
                  </div>
                  <Button
                    className="btn btn-danger btn-sm"
                    onClick={() => { setShowDeleteModal(true); setDeleteConfirm(''); setDeleteError(''); }}
                  >
                    <FaTrash /> Delete Account
                  </Button>
                </div>
              </Card.Body>
            </Card>

          </div>
        </Col>
      </Row>

      {/* Delete confirmation modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton style={{ borderBottom: '1px solid #fca5a5' }}>
          <Modal.Title style={{ color: '#b91c1c', fontSize: '.95rem' }}>
            <FaExclamationTriangle className="me-2" />Confirm Account Deletion
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger" style={{ fontSize: '.82rem' }}>
            This will permanently delete your account, all your farm data, crops, activities, and orders.
            <strong> This action cannot be undone.</strong>
          </Alert>
          {deleteError && <Alert variant="warning" style={{ fontSize: '.82rem' }}>{deleteError}</Alert>}
          <Form.Group>
            <Form.Label style={{ fontSize: '.83rem' }}>
              To confirm, type your name: <strong>{user?.name}</strong>
            </Form.Label>
            <Form.Control
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder={user?.name}
              style={{ borderColor: deleteConfirm === user?.name ? 'var(--success)' : 'var(--border)' }}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button
            className="btn btn-danger"
            onClick={handleDeleteAccount}
            disabled={deleting || deleteConfirm !== user?.name}
          >
            {deleting ? <Spinner animation="border" size="sm" /> : <><FaTrash /> Delete My Account</>}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Profile;
