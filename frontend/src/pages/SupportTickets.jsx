import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Modal, Alert } from 'react-bootstrap';
import { FaPlus, FaHeadset, FaCheckCircle, FaClock } from 'react-icons/fa';
import axios from 'axios';

const SupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [show, setShow]       = useState(false);
  const [form, setForm]       = useState({ subject: '', message: '' });
  const [feedback, setFeedback] = useState('');
  const [error, setError]     = useState('');

  useEffect(() => { loadTickets(); }, []);

  const loadTickets = async () => {
    try {
      const res = await axios.get('/api/support/me');
      setTickets(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async () => {
    if (!form.subject.trim() || !form.message.trim()) {
      setError('Subject and message are required.');
      return;
    }
    try {
      await axios.post('/api/support', form);
      setShow(false);
      setForm({ subject: '', message: '' });
      setError('');
      loadTickets();
      setFeedback('Support ticket submitted. An admin will respond shortly.');
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      setError('Failed to submit ticket. Please try again.');
    }
  };

  return (
    <>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h2>Support Tickets</h2>
          <p>Submit issues or questions to the admin team.</p>
        </div>
        <Button className="btn btn-primary" onClick={() => setShow(true)}>
          <FaPlus /> New Ticket
        </Button>
      </div>

      {feedback && <Alert variant="success" className="mb-3">{feedback}</Alert>}

      <Card className="dashboard-card" style={{ border: 'none' }}>
        <div className="card-header-clean">
          <h5>My Tickets</h5>
          <span style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table-modern">
            <thead>
              <tr><th>Subject</th><th>Message</th><th>Status</th><th>Admin Response</th><th>Date</th></tr>
            </thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t._id}>
                  <td style={{ fontWeight: 600 }}>{t.subject}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)', fontSize: '.8rem' }}>
                    {t.message}
                  </td>
                  <td>
                    <span className={`badge ${t.status === 'resolved' ? 'status-resolved' : 'status-open'}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}>
                      {t.status === 'resolved' ? <FaCheckCircle /> : <FaClock />}
                      {t.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '.8rem' }}>
                    {t.response
                      ? <span style={{ color: 'var(--success)' }}>{t.response}</span>
                      : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Awaiting response...</span>}
                  </td>
                  <td style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <FaHeadset style={{ fontSize: '2rem', marginBottom: '.75rem', display: 'block', margin: '0 auto .75rem', color: 'var(--primary)' }} />
                    No tickets yet. Submit one if you need help.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal show={show} onHide={() => { setShow(false); setError(''); }}>
        <Modal.Header closeButton><Modal.Title>Submit Support Ticket</Modal.Title></Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger" style={{ fontSize: '.8rem' }}>{error}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Subject</Form.Label>
              <Form.Control placeholder="Brief description of your issue" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Message</Form.Label>
              <Form.Control as="textarea" rows={4} placeholder="Describe your issue in detail..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn btn-secondary" onClick={() => { setShow(false); setError(''); }}>Cancel</Button>
          <Button className="btn btn-primary" onClick={handleSubmit}>Submit Ticket</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SupportTickets;
