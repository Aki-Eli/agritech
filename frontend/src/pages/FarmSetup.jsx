import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Modal } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaTractor, FaMapMarkerAlt, FaSeedling, FaTint, FaCut, FaWater } from 'react-icons/fa';
import axios from 'axios';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmModal';

const activityTypeIcon = (type) => {
  const map = {
    planting:    { icon: <FaSeedling />, bg: '#dcfce7', color: '#15803d' },
    fertilizing: { icon: <FaTint />,     bg: '#fff3e0', color: '#e76f51' },
    harvesting:  { icon: <FaCut />,      bg: '#fee2e2', color: '#b91c1c' },
    irrigation:  { icon: <FaWater />,    bg: '#e0f2fe', color: '#0369a1' },
  };
  return map[type] || { icon: <FaTractor />, bg: '#f0f4f1', color: '#4a6358' };
};

const FarmSetup = () => {
  const toast   = useToast();
  const confirm = useConfirm();

  const [farms, setFarms]               = useState([]);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [activities, setActivities]     = useState([]);
  const [showActivity, setShowActivity] = useState(false);
  const [newActivity, setNewActivity]   = useState({ type: 'planting', cropType: '', date: '', quantity: '', notes: '' });
  const [showFarmModal, setShowFarmModal] = useState(false);
  const [editingFarm, setEditingFarm]   = useState({ name: '', size: '', location: '', irrigationMethod: 'Drip', soilType: 'Loamy' });

  useEffect(() => { loadFarms(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const loadActivities = async () => {
      if (!selectedFarm?._id) { setActivities([]); return; }
      try {
        const res = await axios.get(`/api/farm-activities/${selectedFarm._id}`);
        setActivities(res.data);
      } catch (err) { console.error(err); }
    };
    loadActivities();
  }, [selectedFarm]);

  const loadFarms = async () => {
    try {
      const res = await axios.get('/api/farms');
      setFarms(res.data);
      if (res.data.length > 0 && !selectedFarm) setSelectedFarm(res.data[0]);
    } catch (err) { console.error(err); }
  };

  const loadActivities = async () => {
    try {
      const res = await axios.get(`/api/farm-activities/${selectedFarm._id}`);
      setActivities(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSaveFarm = async () => {
    try {
      if (editingFarm._id) {
        await axios.put(`/api/farms/${editingFarm._id}`, editingFarm);
        toast('Farm updated successfully.', 'success');
      } else {
        await axios.post('/api/farms', editingFarm);
        toast('Farm created successfully.', 'success');
      }
      await loadFarms();
      setShowFarmModal(false);
      setEditingFarm({ name: '', size: '', location: '', irrigationMethod: 'Drip', soilType: 'Loamy' });
    } catch (err) {
      toast('Error saving farm. Please try again.', 'danger');
    }
  };

  const handleAddActivity = async () => {
    if (!selectedFarm) return;
    try {
      const res = await axios.post('/api/farm-activities', { ...newActivity, farmId: selectedFarm._id });
      if (res.data.tip) {
        toast(`Activity logged! Tip: ${res.data.tip}`, 'info', 6000);
      } else {
        toast('Activity logged successfully.', 'success');
      }
      setShowActivity(false);
      setNewActivity({ type: 'planting', cropType: '', date: '', quantity: '', notes: '' });
      loadActivities();
    } catch (err) {
      toast('Error adding activity. Please try again.', 'danger');
    }
  };

  const handleDeleteFarm = async (farmId) => {
    const ok = await confirm('Delete this farm? All crops and activities will be permanently lost.');
    if (!ok) return;
    try {
      await axios.delete(`/api/farms/${farmId}`);
      await loadFarms();
      if (selectedFarm?._id === farmId) setSelectedFarm(null);
      toast('Farm deleted.', 'success');
    } catch (err) {
      toast('Error deleting farm.', 'danger');
    }
  };

  return (
    <>
      <div className="page-header">
        <h2>Farm Setup</h2>
        <p>Manage your farms and log daily activities.</p>
      </div>

      <Row className="g-3">
        {/* Farm list */}
        <Col md={4}>
          <Card className="dashboard-card" style={{ border: 'none' }}>
            <div className="card-header-clean">
              <h5>My Farms</h5>
              <Button className="btn btn-primary btn-sm" onClick={() => { setEditingFarm({ name: '', size: '', location: '', irrigationMethod: 'Drip', soilType: 'Loamy' }); setShowFarmModal(true); }}>
                <FaPlus /> New Farm
              </Button>
            </div>
            <Card.Body style={{ padding: 0 }}>
              {farms.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '.83rem' }}>
                  No farms yet. Click New Farm to get started.
                </div>
              ) : farms.map(farm => (
                <div key={farm._id} onClick={() => setSelectedFarm(farm)} style={{
                  display: 'flex', alignItems: 'center', gap: '.75rem',
                  padding: '.85rem 1.25rem', cursor: 'pointer',
                  borderBottom: '1px solid var(--border)',
                  background: selectedFarm?._id === farm._id ? 'var(--primary-pale)' : 'transparent',
                  borderLeft: selectedFarm?._id === farm._id ? '3px solid var(--primary)' : '3px solid transparent',
                  transition: 'background .15s',
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--primary-pale)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FaTractor />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '.85rem', color: 'var(--text-primary)' }}>{farm.name}</div>
                    <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                      <FaMapMarkerAlt style={{ fontSize: '.65rem' }} />{farm.location} · {farm.size} acres
                    </div>
                  </div>
                  <button className="btn btn-sm" style={{ background: '#fecaca', color: '#7f1d1d', border: 'none', padding: '.25rem .45rem', borderRadius: 'var(--radius-sm)' }}
                    onClick={e => { e.stopPropagation(); handleDeleteFarm(farm._id); }}>
                    <FaTrash style={{ fontSize: '.7rem' }} />
                  </button>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>

        {/* Farm detail + activities */}
        <Col md={8}>
          {!selectedFarm ? (
            <Card className="dashboard-card" style={{ border: 'none' }}>
              <Card.Body style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                <FaTractor style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--primary)' }} />
                <p>Select a farm from the list or create a new one.</p>
              </Card.Body>
            </Card>
          ) : (
            <>
              <Card className="dashboard-card mb-3" style={{ border: 'none' }}>
                <Card.Body style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontWeight: 700, marginBottom: '.5rem' }}>{selectedFarm.name}</h4>
                      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '.82rem', color: 'var(--text-secondary)' }}>
                        <span><strong>Size:</strong> {selectedFarm.size} acres</span>
                        <span><strong>Location:</strong> {selectedFarm.location}</span>
                        <span><strong>Irrigation:</strong> {selectedFarm.irrigationMethod}</span>
                        <span><strong>Soil:</strong> {selectedFarm.soilType}</span>
                      </div>
                    </div>
                    <Button className="btn btn-secondary btn-sm" onClick={() => { setEditingFarm(selectedFarm); setShowFarmModal(true); }}>
                      <FaEdit /> Edit
                    </Button>
                  </div>
                </Card.Body>
              </Card>

              <Card className="dashboard-card" style={{ border: 'none' }}>
                <div className="card-header-clean">
                  <h5>Farm Activities</h5>
                  <Button className="btn btn-primary btn-sm" onClick={() => setShowActivity(true)}>
                    <FaPlus /> Log Activity
                  </Button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="table-modern">
                    <thead><tr><th>Type</th><th>Crop</th><th>Date</th><th>Quantity</th><th>Notes</th></tr></thead>
                    <tbody>
                      {activities.map(act => {
                        const { icon, bg, color } = activityTypeIcon(act.type);
                        return (
                          <tr key={act._id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                                <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.75rem' }}>{icon}</div>
                                <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{act.type}</span>
                              </div>
                            </td>
                            <td>{act.cropType}</td>
                            <td style={{ color: 'var(--text-muted)', fontSize: '.78rem' }}>{new Date(act.date).toLocaleDateString()}</td>
                            <td>{act.quantity || '—'}</td>
                            <td style={{ color: 'var(--text-secondary)', fontSize: '.78rem' }}>{act.notes || '—'}</td>
                          </tr>
                        );
                      })}
                      {activities.length === 0 && (
                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No activities logged yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}
        </Col>
      </Row>

      {/* Farm Modal */}
      <Modal show={showFarmModal} onHide={() => setShowFarmModal(false)}>
        <Modal.Header closeButton><Modal.Title>{editingFarm._id ? 'Edit Farm' : 'New Farm'}</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3"><Form.Label>Farm Name</Form.Label><Form.Control value={editingFarm.name || ''} onChange={e => setEditingFarm({ ...editingFarm, name: e.target.value })} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Size (acres)</Form.Label><Form.Control type="number" value={editingFarm.size || ''} onChange={e => setEditingFarm({ ...editingFarm, size: e.target.value })} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Location</Form.Label><Form.Control value={editingFarm.location || ''} onChange={e => setEditingFarm({ ...editingFarm, location: e.target.value })} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Irrigation Method</Form.Label>
              <Form.Select value={editingFarm.irrigationMethod || 'Drip'} onChange={e => setEditingFarm({ ...editingFarm, irrigationMethod: e.target.value })}>
                <option>Drip</option><option>Sprinkler</option><option>Flood</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3"><Form.Label>Soil Type</Form.Label>
              <Form.Select value={editingFarm.soilType || 'Loamy'} onChange={e => setEditingFarm({ ...editingFarm, soilType: e.target.value })}>
                <option>Clay</option><option>Sandy</option><option>Loamy</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn btn-secondary" onClick={() => setShowFarmModal(false)}>Cancel</Button>
          <Button className="btn btn-primary" onClick={handleSaveFarm}>Save Farm</Button>
        </Modal.Footer>
      </Modal>

      {/* Activity Modal */}
      <Modal show={showActivity} onHide={() => setShowActivity(false)}>
        <Modal.Header closeButton><Modal.Title>Log Farm Activity</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3"><Form.Label>Activity Type</Form.Label>
              <Form.Select value={newActivity.type} onChange={e => setNewActivity({ ...newActivity, type: e.target.value })}>
                <option value="planting">Planting</option>
                <option value="fertilizing">Fertilizing</option>
                <option value="harvesting">Harvesting</option>
                <option value="irrigation">Irrigation</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3"><Form.Label>Crop Type</Form.Label><Form.Control value={newActivity.cropType} onChange={e => setNewActivity({ ...newActivity, cropType: e.target.value })} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Date</Form.Label><Form.Control type="date" value={newActivity.date} onChange={e => setNewActivity({ ...newActivity, date: e.target.value })} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Quantity (kg / litres)</Form.Label><Form.Control value={newActivity.quantity} onChange={e => setNewActivity({ ...newActivity, quantity: e.target.value })} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Notes</Form.Label><Form.Control as="textarea" rows={2} value={newActivity.notes} onChange={e => setNewActivity({ ...newActivity, notes: e.target.value })} /></Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn btn-secondary" onClick={() => setShowActivity(false)}>Cancel</Button>
          <Button className="btn btn-primary" onClick={handleAddActivity}>Save Activity</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default FarmSetup;
