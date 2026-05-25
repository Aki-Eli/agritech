import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Form, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get('/api/admin/bookings');
      setBookings(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    await axios.put(`/api/admin/booking/${id}`, { status });
    fetchBookings();
    setMessage('Booking status updated');
    setTimeout(() => setMessage(''), 2000);
  };

  if (loading) return <Spinner animation="border" />;
  return (
    <>
      {message && <Alert variant="success">{message}</Alert>}
      <Card className="dashboard-card">
        <Card.Body>
          <h4>Service Bookings</h4>
          <Table striped responsive>
            <thead>
              <tr><th>User</th><th>Service</th><th>Details</th><th>Date</th><th>Status</th><th>Actions</th></tr>    
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b._id}>
                  <td>{b.userId?.name || 'Unknown'} </td>
                  <td>{b.serviceType} </td>
                  <td>{b.details} </td>
                  <td>{new Date(b.scheduledDate).toLocaleDateString()} </td>
                  <td><Badge bg={b.status === 'Pending' ? 'warning' : 'success'}>{b.status}</Badge> </td>
                  <td>
                    <Form.Select size="sm" style={{ width: '130px' }} value={b.status} onChange={e => updateStatus(b._id, e.target.value)}>
                      <option>Pending</option>
                      <option>Confirmed</option>
                      <option>Completed</option>
                      <option>Cancelled</option>
                    </Form.Select>
                   </td>
                </tr>
              ))}
              {bookings.length === 0 && <tr><td colSpan="6" className="text-center">No bookings</td></tr>}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </>
  );
};
export default AdminBookings;