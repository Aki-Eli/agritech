import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Button, Modal, Form, Alert, Badge, Spinner } from 'react-bootstrap';
import axios from 'axios';

const ExpertConsultation = () => {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [bookingForm, setBookingForm] = useState({ details: '', scheduledDate: '' });
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { loadExperts(); }, []);

  const loadExperts = async () => {
    try {
      const res = await axios.get('/api/experts');
      setExperts(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const openBooking = (expert) => {
    setSelectedExpert(expert);
    setBookingForm({ details: '', scheduledDate: '' });
    setError('');
    setShowBookModal(true);
  };

  const handleBook = async () => {
    if (!bookingForm.details.trim() || !bookingForm.scheduledDate) {
      setError('Please fill in all fields.');
      return;
    }
    try {
      await axios.post('/api/bookings', {
        serviceType: 'expert consultation',
        details: `Expert: ${selectedExpert.name} (${selectedExpert.specialization}). ${bookingForm.details}`,
        scheduledDate: bookingForm.scheduledDate
      });
      setShowBookModal(false);
      setFeedback(`✅ Consultation booked with ${selectedExpert.name}! Check your bookings for status updates.`);
      setTimeout(() => setFeedback(''), 5000);
    } catch (err) {
      setError('Failed to book consultation. Please try again.');
    }
  };

  if (loading) return <Container className="text-center py-5"><Spinner animation="border" /></Container>;

  return (
    <Container>
      {feedback && <Alert variant="success">{feedback}</Alert>}

      <Card className="dashboard-card mb-4">
        <Card.Body>
          <h2> Expert Consultation</h2>
          <p className="text-muted">
            Connect with agricultural experts for personalized advice on crop management,
            soil health, pest control, and more. Book a consultation and an admin will confirm your appointment.
          </p>
        </Card.Body>
      </Card>

      {experts.length === 0 ? (
        <Card className="dashboard-card">
          <Card.Body className="text-center py-5">
            <h5 className="text-muted">No experts available at the moment.</h5>
            <p className="text-muted">Please check back later or contact support.</p>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {experts.map(expert => (
            <Col md={6} lg={4} key={expert._id}>
              <Card className="dashboard-card h-100">
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    <div
                      style={{
                        width: 56, height: 56, borderRadius: '50%',
                        background: '#7a5a4b', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem', marginRight: '1rem', flexShrink: 0
                      }}
                    >
                      {expert.imageUrl
                        ? <img src={expert.imageUrl} alt={expert.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        : expert.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h5 className="mb-0">{expert.name}</h5>
                      <Badge className="badge badge-neutral">{expert.specialization}</Badge>
                    </div>
                  </div>

                  {expert.bio && <p className="text-muted small mb-2">{expert.bio}</p>}

                  {expert.contactEmail && (
                    <p className="small mb-1">
                      &#128231;&#65038; <a href={`mailto:${expert.contactEmail}`}>{expert.contactEmail}</a>
                    </p>
                  )}
                  {expert.phone && (
                    <p className="small mb-2">&#128222;&#65038; {expert.phone}</p>
                  )}

                  <div className="mt-3">
                    {expert.available ? (
                      <Button className="btn-brown w-100" onClick={() => openBooking(expert)}>
                        &#128197;&#65038; Book Consultation
                      </Button>
                    ) : (
                      <Button variant="secondary" disabled className="w-100">
                        Currently Unavailable
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Booking Modal */}
      <Modal show={showBookModal} onHide={() => setShowBookModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Book Consultation – {selectedExpert?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <p className="text-muted small">
            Specialization: <strong>{selectedExpert?.specialization}</strong>
          </p>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>What do you need help with?</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Describe your farming challenge or question..."
                value={bookingForm.details}
                onChange={e => setBookingForm({ ...bookingForm, details: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Preferred Date</Form.Label>
              <Form.Control
                type="date"
                value={bookingForm.scheduledDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setBookingForm({ ...bookingForm, scheduledDate: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBookModal(false)}>Cancel</Button>
          <Button className="btn-brown" onClick={handleBook}>Confirm Booking</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ExpertConsultation;
