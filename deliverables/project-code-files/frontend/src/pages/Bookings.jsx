import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Modal, Alert } from 'react-bootstrap';
import { FaPlus, FaCalendarAlt, FaTools, FaUserMd } from 'react-icons/fa';
import axios from 'axios';

const statusClass = { Pending: 'status-pending', Confirmed: 'status-shipped', Completed: 'status-delivered', Cancelled: 'status-cancelled' };

const Bookings = () => {
  const [bookings, setBookings]     = useState([]);
  const [show, setShow]             = useState(false);
  const [newBooking, setNewBooking] = useState({ serviceType: 'equipment rental', details: '', scheduledDate: '' });
  const [message, setMessage]       = useState('');
  const [error, setError]           = useState('');

  useEffect(() => { loadBookings(); }, []);

  const loadBookings = async () => {
    try {
      const res = await axios.get('/api/bookings/me');
      setBookings(res.data);
    } catch (err) { console.error(err); }
  };

  const handleBook = async () => {
    if (!newBooking.details.trim() || !newBooking.scheduledDate) {
      setError('Please fill in all fields.');
      return;
    }
    try {
      await axios.post('/api/bookings', newBooking);
      setShow(false);
      setNewBooking({ serviceType: 'equipment rental', details: '', scheduledDate: '' });
      setError('');
      loadBookings();
      setMessage('Booking submitted. An admin will confirm your appointment.');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) { alert('Error creating booking'); }
  };

  const serviceIcon = (type) =>
    type === 'expert consultation' ? <FaUserMd /> : <FaTools />;

  return (
    <>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h2>Service Bookings</h2>
          <p>Schedule equipment rentals and expert consultations.</p>
        </div>
        <Button className="btn btn-primary" onClick={() => setShow(true)}>
          <FaPlus /> New Booking
        </Button>
      </div>

      {message && <Alert variant="success" className="mb-3">{message}</Alert>}

      <Card className="dashboard-card" style={{ border: 'none' }}>
        <div className="card-header-clean">
          <h5>My Bookings</h5>
          <span style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table-modern">
            <thead>
              <tr><th>Service</th><th>Details</th><th>Scheduled Date</th><th>Status</th></tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                      <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: 'var(--primary-pale)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.75rem' }}>
                        {serviceIcon(b.serviceType)}
                      </div>
                      <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{b.serviceType}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: '.8rem', color: 'var(--text-secondary)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {b.details}
                  </td>
                  <td style={{ fontSize: '.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                      <FaCalendarAlt style={{ color: 'var(--text-muted)', fontSize: '.75rem' }} />
                      {new Date(b.scheduledDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${statusClass[b.status] || 'badge-neutral'}`}>{b.status}</span>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No bookings yet. Click New Booking to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* New Booking Modal */}
      <Modal show={show} onHide={() => { setShow(false); setError(''); }}>
        <Modal.Header closeButton><Modal.Title>New Booking</Modal.Title></Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger" style={{ fontSize: '.8rem' }}>{error}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Service Type</Form.Label>
              <Form.Select value={newBooking.serviceType} onChange={e => setNewBooking({ ...newBooking, serviceType: e.target.value })}>
                <option value="equipment rental">Equipment Rental</option>
                <option value="expert consultation">Expert Consultation</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Details</Form.Label>
              <Form.Control
                as="textarea" rows={3}
                placeholder="Describe what you need..."
                value={newBooking.details}
                onChange={e => setNewBooking({ ...newBooking, details: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Preferred Date</Form.Label>
              <Form.Control
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={newBooking.scheduledDate}
                onChange={e => setNewBooking({ ...newBooking, scheduledDate: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn btn-secondary" onClick={() => { setShow(false); setError(''); }}>Cancel</Button>
          <Button className="btn btn-primary" onClick={handleBook}>Submit Booking</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Bookings;
