import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

const AdminSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    try {
      const res = await axios.get('/api/admin/tickets');
      setTickets(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const respond = async (id, response) => {
    if (!response) return;
    await axios.post(`/api/admin/ticket/${id}/respond`, { response });
    fetchTickets();
    setMessage('Response sent');
    setTimeout(() => setMessage(''), 2000);
  };

  if (loading) return <Spinner animation="border" />;
  return (
    <>
      {message && <Alert variant="success">{message}</Alert>}
      <Card className="dashboard-card">
        <Card.Body>
          <h4>Support Tickets</h4>
          {tickets.length === 0 ? <p>No tickets.</p> : tickets.map(t => (
            <Card key={t._id} className="mb-3">
              <Card.Body>
                <strong>{t.userId?.name || 'User'}</strong> - <small>{new Date(t.createdAt).toLocaleString()}</small>
                <p><strong>Subject:</strong> {t.subject}</p>
                <p><strong>Message:</strong> {t.message}</p>
                {t.response && <Alert variant="info">Admin response: {t.response}</Alert>}
                <Form.Control as="textarea" placeholder="Your response..." id={`resp-${t._id}`} rows={2} />
                <Button className="btn-brown mt-2" onClick={() => respond(t._id, document.getElementById(`resp-${t._id}`).value)}>Send Response</Button>
              </Card.Body>
            </Card>
          ))}
        </Card.Body>
      </Card>
    </>
  );
};
export default AdminSupport;