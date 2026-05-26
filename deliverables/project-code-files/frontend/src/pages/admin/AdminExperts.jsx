import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

const AdminExperts = () => {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '', specialization: '', bio: '', contactEmail: '', phone: '', available: true, imageUrl: ''
  });
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

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', specialization: '', bio: '', contactEmail: '', phone: '', available: true, imageUrl: '' });
    setError('');
    setShow(true);
  };

  const openEdit = (expert) => {
    setEditing(expert._id);
    setForm({
      name: expert.name,
      specialization: expert.specialization,
      bio: expert.bio || '',
      contactEmail: expert.contactEmail || '',
      phone: expert.phone || '',
      available: expert.available,
      imageUrl: expert.imageUrl || ''
    });
    setError('');
    setShow(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.specialization.trim()) {
      setError('Name and specialization are required.');
      return;
    }
    try {
      if (editing) {
        await axios.put(`/api/experts/${editing}`, form);
        setFeedback('Expert updated successfully.');
      } else {
        await axios.post('/api/experts', form);
        setFeedback('Expert added successfully.');
      }
      setShow(false);
      loadExperts();
      setTimeout(() => setFeedback(''), 3000);
    } catch (err) {
      setError('Failed to save expert.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expert profile?')) return;
    try {
      await axios.delete(`/api/experts/${id}`);
      loadExperts();
      setFeedback('Expert deleted.');
      setTimeout(() => setFeedback(''), 3000);
    } catch (err) {
      alert('Failed to delete expert.');
    }
  };

  const toggleAvailability = async (expert) => {
    try {
      await axios.put(`/api/experts/${expert._id}`, { ...expert, available: !expert.available });
      loadExperts();
    } catch (err) {
      alert('Failed to update availability.');
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <>
      {feedback && <Alert variant="success">{feedback}</Alert>}

      <Card className="dashboard-card">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4> Expert Profiles</h4>
            <Button className="btn-brown" onClick={openCreate}>+ Add Expert</Button>
          </div>

          <Table className="table-modern" responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Specialization</th>
                <th>Contact</th>
                <th>Availability</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {experts.map(e => (
                <tr key={e._id}>
                  <td><strong>{e.name}</strong><br /><small className="text-muted">{e.bio?.slice(0, 60)}{e.bio?.length > 60 ? '...' : ''}</small></td>
                  <td><span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>{e.specialization}</span></td>
                  <td>
                    {e.contactEmail && <div><small>📧 {e.contactEmail}</small></div>}
                    {e.phone && <div><small>📞 {e.phone}</small></div>}
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant={e.available ? 'success' : 'secondary'}
                      onClick={() => toggleAvailability(e)}
                    >
                      {e.available ? '✅ Available' : '❌ Unavailable'}
                    </Button>
                  </td>
                  <td>
                    <Button size="sm" variant="outline-primary" className="me-2" onClick={() => openEdit(e)}>Edit</Button>
                    <Button size="sm" variant="outline-danger" onClick={() => handleDelete(e._id)}>Delete</Button>
                  </td>
                </tr>
              ))}
              {experts.length === 0 && (
                <tr><td colSpan="5" className="text-center text-muted py-4">No experts added yet.</td></tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Add/Edit Modal */}
      <Modal show={show} onHide={() => setShow(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editing ? 'Edit Expert' : 'Add Expert'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Full Name *</Form.Label>
              <Form.Control value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Dr. Jane Smith" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Specialization *</Form.Label>
              <Form.Select value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })}>
                <option value="">Select specialization...</option>
                <option>Soil Science</option>
                <option>Pest Management</option>
                <option>Crop Nutrition</option>
                <option>Irrigation Management</option>
                <option>Organic Farming</option>
                <option>Plant Pathology</option>
                <option>Agronomy</option>
                <option>Horticulture</option>
                <option>Other</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Bio</Form.Label>
              <Form.Control as="textarea" rows={3} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Brief description of expertise and experience..." />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contact Email</Form.Label>
              <Form.Control type="email" value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })} placeholder="expert@example.com" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1 234 567 8900" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Profile Image URL (optional)</Form.Label>
              <Form.Control value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
            </Form.Group>
            <Form.Check
              type="switch"
              label="Available for consultations"
              checked={form.available}
              onChange={e => setForm({ ...form, available: e.target.checked })}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>Cancel</Button>
          <Button className="btn-brown" onClick={handleSave}>{editing ? 'Update' : 'Add Expert'}</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AdminExperts;
