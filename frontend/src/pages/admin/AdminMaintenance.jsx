import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Alert, Spinner, Form, Modal, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const AdminMaintenance = () => {
  const [logs, setLogs] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    pestName: '', description: '', severity: 'high', preventiveMeasures: '', treatment: ''
  });
  const [broadcastError, setBroadcastError] = useState('');

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get('/api/admin/logs');
      setLogs(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const runMaintenance = async () => {
    await axios.post('/api/admin/maintenance');
    setMessage('✅ Maintenance completed: old alerts cleared');
    setTimeout(() => setMessage(''), 3000);
    fetchLogs();
  };

  const handleBroadcast = async () => {
    if (!broadcastForm.pestName.trim() || !broadcastForm.description.trim()) {
      setBroadcastError('Pest name and description are required.');
      return;
    }
    try {
      const res = await axios.post('/api/admin/broadcast-alert', broadcastForm);
      setShowBroadcast(false);
      setBroadcastForm({ pestName: '', description: '', severity: 'high', preventiveMeasures: '', treatment: '' });
      setBroadcastError('');
      setMessage(`✅ ${res.data.msg}`);
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setBroadcastError('Failed to broadcast alert.');
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <>
      {message && <Alert variant="success">{message}</Alert>}

      {/* System Status */}
      <Card className="dashboard-card mb-4">
        <Card.Body>
          <h4>&#9881;&#65038; System Maintenance & Security</h4>
          <Row className="mb-3">
            <Col md={4}>
              <p><strong>Status:</strong> <span className="text-success">{logs.status || 'Operational'}</span></p>
            </Col>
            <Col md={4}>
              <p><strong>Uptime:</strong> {Math.round((logs.uptime || 0) / 60)} minutes</p>
            </Col>
          </Row>
          <Button className="btn-brown me-3" onClick={runMaintenance}>
            🧹 Run Maintenance (Clean Old Alerts)
          </Button>
        </Card.Body>
      </Card>

      {/* Broadcast Pest Alert */}
      <Card className="dashboard-card mb-4">
        <Card.Body>
          <h4>&#128364;&#65038; Broadcast Pest Alert</h4>
          <p className="text-muted">
            Send an urgent pest or disease alert to all approved farmers on the platform.
          </p>
          <Button variant="danger" onClick={() => setShowBroadcast(true)}>
            &#128680;&#65038; Broadcast Alert to All Farmers
          </Button>
        </Card.Body>
      </Card>

      {/* Recent Activity */}
      <Card className="dashboard-card">
        <Card.Body>
          <h5>&#128203;&#65038; Recent Activity</h5>
          <Row>
            <Col md={6}>
              <h6>Recent Users</h6>
              <Table striped size="sm">
                <thead><tr><th>Name</th><th>Role</th><th>Joined</th></tr></thead>
                <tbody>
                  {logs.recentUsers?.map(u => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td><span className={`badge ${u.role === 'admin' ? 'bg-danger' : 'bg-success'}`}>{u.role}</span></td>
                      <td><small>{new Date(u.createdAt).toLocaleDateString()}</small></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
            <Col md={6}>
              <h6>Recent Orders</h6>
              <Table striped size="sm">
                <thead><tr><th>Amount</th><th>Status</th></tr></thead>
                <tbody>
                  {logs.recentOrders?.map(o => (
                    <tr key={o._id}>
                      <td>${o.totalAmount?.toFixed(2)}</td>
                      <td><span className="badge bg-secondary">{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Broadcast Modal */}
      <Modal show={showBroadcast} onHide={() => { setShowBroadcast(false); setBroadcastError(''); }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>🚨 Broadcast Pest/Disease Alert</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {broadcastError && <Alert variant="danger">{broadcastError}</Alert>}
          <Alert variant="warning">
            This will send an alert notification to <strong>all approved farmers</strong> on the platform.
          </Alert>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Pest / Disease Name *</Form.Label>
              <Form.Control
                placeholder="e.g. Fall Armyworm, Maize Streak Virus"
                value={broadcastForm.pestName}
                onChange={e => setBroadcastForm({ ...broadcastForm, pestName: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Describe the pest/disease, affected areas, and symptoms..."
                value={broadcastForm.description}
                onChange={e => setBroadcastForm({ ...broadcastForm, description: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Severity</Form.Label>
              <Form.Select
                value={broadcastForm.severity}
                onChange={e => setBroadcastForm({ ...broadcastForm, severity: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Preventive Measures</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="e.g. Regular scouting, crop rotation, remove infected plants..."
                value={broadcastForm.preventiveMeasures}
                onChange={e => setBroadcastForm({ ...broadcastForm, preventiveMeasures: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Recommended Treatment</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="e.g. Apply neem oil spray, use certified pesticide X..."
                value={broadcastForm.treatment}
                onChange={e => setBroadcastForm({ ...broadcastForm, treatment: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowBroadcast(false); setBroadcastError(''); }}>Cancel</Button>
          <Button variant="danger" onClick={handleBroadcast}>🚨 Send Broadcast</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AdminMaintenance;
