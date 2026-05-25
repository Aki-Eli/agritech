import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Modal, Form, Alert } from 'react-bootstrap';
import { FaBug, FaPlus, FaShieldAlt, FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';

const severityConfig = {
  high:     { label: 'High',     className: 'severity-high',     icon: <FaExclamationTriangle /> },
  medium:   { label: 'Medium',   className: 'severity-medium',   icon: <FaInfoCircle /> },
  low:      { label: 'Low',      className: 'severity-low',      icon: <FaInfoCircle /> },
  critical: { label: 'Critical', className: 'severity-critical', icon: <FaExclamationTriangle /> },
};

const PestAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [message, setMessage] = useState('');
  const [reportData, setReportData] = useState({
    pestName: '', description: '', severity: 'medium', preventiveMeasures: '', treatment: ''
  });

  useEffect(() => { loadAlerts(); }, []);

  const loadAlerts = async () => {
    try {
      const res = await axios.get('/api/alerts');
      setAlerts(res.data);
    } catch (err) { console.error(err); }
  };

  const implementAction = async (id) => {
    try {
      await axios.put(`/api/alerts/${id}/implement`);
      loadAlerts();
      setShowModal(false);
      setMessage('Alert marked as implemented.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { alert('Error updating alert'); }
  };

  const handleReportPest = async () => {
    try {
      await axios.post('/api/alerts/report', reportData);
      setShowReportModal(false);
      setReportData({ pestName: '', description: '', severity: 'medium', preventiveMeasures: '', treatment: '' });
      setMessage('Pest alert added to your alerts.');
      setTimeout(() => setMessage(''), 4000);
      loadAlerts();
    } catch (err) { alert('Error submitting report'); }
  };

  const pending = alerts.filter(a => !a.implemented);
  const done    = alerts.filter(a => a.implemented);

  return (
    <>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h2>Pest &amp; Disease Alerts</h2>
          <p>Monitor threats and take action to protect your crops.</p>
        </div>
        <Button className="btn btn-primary" onClick={() => setShowReportModal(true)}>
          <FaPlus /> Report Sighting
        </Button>
      </div>

      {message && <Alert variant="success" className="mb-3">{message}</Alert>}

      {/* Summary row */}
      <Row className="g-3 mb-4">
        <Col xs={6} md={3}>
          <Card className="dashboard-card" style={{ border: 'none' }}>
            <Card.Body style={{ padding: '1rem 1.25rem' }}>
              <div className="metric-icon red"><FaBug /></div>
              <div className="metric-value">{pending.length}</div>
              <div className="metric-label">Active Alerts</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="dashboard-card" style={{ border: 'none' }}>
            <Card.Body style={{ padding: '1rem 1.25rem' }}>
              <div className="metric-icon green"><FaCheckCircle /></div>
              <div className="metric-value">{done.length}</div>
              <div className="metric-label">Resolved</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Active Alerts */}
      <Card className="dashboard-card mb-4" style={{ border: 'none' }}>
        <div className="card-header-clean">
          <h5>Active Alerts</h5>
          <span style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{pending.length} pending</span>
        </div>
        <Card.Body style={{ padding: 0 }}>
          {pending.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <FaShieldAlt style={{ fontSize: '2rem', marginBottom: '.75rem', color: 'var(--primary)' }} />
              <p style={{ margin: 0, fontSize: '.85rem' }}>No active alerts. Your crops are safe.</p>
            </div>
          ) : (
            pending.map(alert => {
              const sev = severityConfig[alert.severity] || severityConfig.medium;
              return (
                <div key={alert._id} style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)'
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 'var(--radius-md)',
                    background: '#fee2e2', color: '#b91c1c',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <FaBug />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '.85rem', textTransform: 'capitalize', marginBottom: '.15rem' }}>
                      {alert.type}
                    </div>
                    <div style={{ fontSize: '.78rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {alert.message}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flexShrink: 0 }}>
                    <span className={`badge ${sev.className}`} style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                      {sev.icon} {sev.label}
                    </span>
                    <Button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => { setSelectedAlert(alert); setShowModal(true); }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </Card.Body>
      </Card>

      {/* Resolved */}
      {done.length > 0 && (
        <Card className="dashboard-card" style={{ border: 'none' }}>
          <div className="card-header-clean">
            <h5>Resolved Alerts</h5>
          </div>
          <Card.Body style={{ padding: 0 }}>
            {done.map(alert => (
              <div key={alert._id} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '.75rem 1.5rem', borderBottom: '1px solid var(--border)',
                opacity: .6
              }}>
                <FaCheckCircle style={{ color: 'var(--success)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600, fontSize: '.82rem', textTransform: 'capitalize' }}>{alert.type}</span>
                  <span style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginLeft: '.5rem' }}>— Implemented</span>
                </div>
              </div>
            ))}
          </Card.Body>
        </Card>
      )}

      {/* Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Alert Details — {selectedAlert?.type}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text-muted)', marginBottom: '.35rem' }}>Description</div>
            <p style={{ fontSize: '.85rem', margin: 0 }}>{selectedAlert?.message}</p>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text-muted)', marginBottom: '.35rem' }}>
              <FaShieldAlt className="me-1" /> Preventive Measures
            </div>
            <p style={{ fontSize: '.85rem', margin: 0 }}>{selectedAlert?.preventiveMeasures || 'Regular scouting, crop rotation, resistant varieties.'}</p>
          </div>
          <div>
            <div style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text-muted)', marginBottom: '.35rem' }}>
              Recommended Treatment
            </div>
            <p style={{ fontSize: '.85rem', margin: 0 }}>{selectedAlert?.treatment || 'Apply recommended pesticide or organic solution.'}</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</Button>
          <Button className="btn btn-primary" onClick={() => implementAction(selectedAlert._id)}>
            <FaCheckCircle /> Mark as Implemented
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Report Modal */}
      <Modal show={showReportModal} onHide={() => setShowReportModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Report Pest / Disease Sighting</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info" style={{ fontSize: '.8rem' }}>
            This alert will only be visible to you.
          </Alert>
          <Form>
            <Row className="g-3">
              <Col md={8}>
                <Form.Group>
                  <Form.Label>Pest / Disease Name *</Form.Label>
                  <Form.Control value={reportData.pestName} onChange={e => setReportData({ ...reportData, pestName: e.target.value })} placeholder="e.g. Fall Armyworm" />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Severity</Form.Label>
                  <Form.Select value={reportData.severity} onChange={e => setReportData({ ...reportData, severity: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Description *</Form.Label>
                  <Form.Control as="textarea" rows={3} value={reportData.description} onChange={e => setReportData({ ...reportData, description: e.target.value })} placeholder="What do you see? Which crops are affected?" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Preventive Measures (optional)</Form.Label>
                  <Form.Control as="textarea" rows={2} value={reportData.preventiveMeasures} onChange={e => setReportData({ ...reportData, preventiveMeasures: e.target.value })} placeholder="e.g. Remove infected plants..." />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Suggested Treatment (optional)</Form.Label>
                  <Form.Control as="textarea" rows={2} value={reportData.treatment} onChange={e => setReportData({ ...reportData, treatment: e.target.value })} placeholder="e.g. Apply copper fungicide..." />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn btn-secondary" onClick={() => setShowReportModal(false)}>Cancel</Button>
          <Button className="btn btn-primary" onClick={handleReportPest}>Submit Report</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PestAlerts;
