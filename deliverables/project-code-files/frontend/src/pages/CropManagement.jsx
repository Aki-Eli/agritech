import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { FaPlus, FaLeaf, FaFlask, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';

const STAGES = ['Germination', 'Vegetative', 'Flowering', 'Harvest'];

const CropManagement = () => {
  const [farms, setFarms]                   = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [crops, setCrops]                   = useState([]);
  const [showCropModal, setShowCropModal]   = useState(false);
  const [showSoilModal, setShowSoilModal]   = useState(false);
  const [currentCrop, setCurrentCrop]       = useState({ type: '', plantingDate: '', growthStage: 'Germination' });
  const [soilData, setSoilData]             = useState({ moisture: '', ph: '', nitrogen: '', phosphorus: '', potassium: '' });
  const [selectedCropId, setSelectedCropId] = useState(null);
  const [soilRec, setSoilRec]               = useState('');
  const [message, setMessage]               = useState({ text: '', variant: 'success' });
  const [loading, setLoading]               = useState(false);

  useEffect(() => { loadFarms(); }, []);

  useEffect(() => {
    const load = async () => {
      if (!selectedFarmId) return;
      setLoading(true);
      try {
        const res = await axios.get(`/api/crops/farm/${selectedFarmId}`);
        setCrops(res.data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    load();
  }, [selectedFarmId]);

  const loadFarms = async () => {
    try {
      const res = await axios.get('/api/farms');
      setFarms(res.data);
      if (res.data.length > 0) setSelectedFarmId(res.data[0]._id);
    } catch (err) { console.error(err); }
  };

  const loadCrops = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/crops/farm/${selectedFarmId}`);
      setCrops(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const flash = (text, variant = 'success') => {
    setMessage({ text, variant });
    setTimeout(() => setMessage({ text: '', variant: 'success' }), 4000);
  };

  const handleSaveCrop = async () => {
    if (!selectedFarmId) { alert('Select a farm first'); return; }
    try {
      const data = { ...currentCrop, farmId: selectedFarmId };
      if (currentCrop._id) await axios.put(`/api/crops/${currentCrop._id}`, data);
      else await axios.post('/api/crops', data);
      setShowCropModal(false);
      setCurrentCrop({ type: '', plantingDate: '', growthStage: 'Germination' });
      loadCrops();
      flash('Crop saved successfully.');
    } catch (err) { alert('Error saving crop'); }
  };

  const handleHarvest = async (cropId) => {
    if (!window.confirm('Mark this crop as harvested? It will move to Harvest History.')) return;
    try {
      await axios.put(`/api/crops/${cropId}/harvest`);
      loadCrops();
      flash('Crop harvested and activity logged.');
    } catch (err) {
      loadCrops();
      flash('Crop harvested but an error occurred. Check console.', 'warning');
    }
  };

  const handleAddSoilHealth = async () => {
    try {
      await axios.post(`/api/soil-health/crop/${selectedCropId}`, soilData);
      const recRes = await axios.get(`/api/crops/${selectedCropId}/recommendations`);
      setSoilRec(recRes.data.recommendations);
      setShowSoilModal(false);
      setSoilData({ moisture: '', ph: '', nitrogen: '', phosphorus: '', potassium: '' });
      loadCrops();
    } catch (err) { alert('Error saving soil data'); }
  };

  const handleGrowthStageChange = async (cropId, newStage) => {
    try {
      await axios.put(`/api/crops/${cropId}`, { growthStage: newStage });
      loadCrops();
      flash(`Growth stage updated to ${newStage}.`);
    } catch (err) { alert('Error updating stage'); }
  };

  return (
    <>
      <div className="page-header">
        <h2>Crop Management</h2>
        <p>Track growth stages, record soil health, and manage your active crops.</p>
      </div>

      {message.text && <Alert variant={message.variant} className="mb-3">{message.text}</Alert>}

      {soilRec && (
        <Card className="dashboard-card mb-3" style={{ border: 'none', borderLeft: '3px solid var(--primary)' }}>
          <Card.Body style={{ padding: '1rem 1.5rem' }}>
            <div style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text-muted)', marginBottom: '.4rem' }}>
              <FaFlask className="me-1" /> Soil Recommendations
            </div>
            <pre style={{ margin: 0, fontFamily: 'inherit', fontSize: '.83rem', whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>{soilRec}</pre>
          </Card.Body>
        </Card>
      )}

      {/* Farm selector */}
      <Card className="dashboard-card mb-3" style={{ border: 'none' }}>
        <Card.Body style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Form.Label style={{ margin: 0, fontWeight: 600, fontSize: '.82rem', whiteSpace: 'nowrap' }}>Farm</Form.Label>
          <Form.Select value={selectedFarmId} onChange={e => setSelectedFarmId(e.target.value)} style={{ maxWidth: 320 }}>
            {farms.map(f => <option key={f._id} value={f._id}>{f.name} — {f.location}</option>)}
            {farms.length === 0 && <option>No farms — create one in Farm Setup</option>}
          </Form.Select>
        </Card.Body>
      </Card>

      {/* Crops table */}
      <Card className="dashboard-card" style={{ border: 'none' }}>
        <div className="card-header-clean">
          <h5>Active Crops</h5>
          <Button className="btn btn-primary btn-sm" onClick={() => { setCurrentCrop({ type: '', plantingDate: '', growthStage: 'Germination' }); setShowCropModal(true); }}>
            <FaPlus /> Add Crop
          </Button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}><Spinner animation="border" style={{ color: 'var(--primary)' }} /></div>
          ) : (
            <table className="table-modern">
              <thead>
                <tr><th>Crop Type</th><th>Planting Date</th><th>Growth Stage</th><th>Soil Moisture</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {crops.map(crop => (
                  <tr key={crop._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                        <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: 'var(--primary-pale)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.75rem' }}>
                          <FaLeaf />
                        </div>
                        <span style={{ fontWeight: 600 }}>{crop.type}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '.8rem' }}>
                      {crop.plantingDate ? new Date(crop.plantingDate).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <Form.Select
                        size="sm"
                        value={crop.growthStage}
                        onChange={e => handleGrowthStageChange(crop._id, e.target.value)}
                        style={{ width: 140, borderRadius: 'var(--radius-md)', fontSize: '.78rem' }}
                      >
                        {STAGES.map(s => <option key={s}>{s}</option>)}
                      </Form.Select>
                    </td>
                    <td>
                      {crop.soilMoisture
                        ? <span style={{ fontWeight: 600 }}>{crop.soilMoisture}%</span>
                        : <span style={{ color: 'var(--text-muted)', fontSize: '.78rem' }}>Not recorded</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '.4rem' }}>
                        <Button size="sm" className="btn btn-sm"
                          style={{ background: '#0284c7', color: '#fff', border: 'none' }}
                          onClick={() => { setSelectedCropId(crop._id); setSoilRec(''); setShowSoilModal(true); }}>
                          <FaFlask /> Soil
                        </Button>
                        <Button size="sm" className="btn btn-sm"
                          style={{ background: '#16a34a', color: '#fff', border: 'none' }}
                          onClick={() => handleHarvest(crop._id)}>
                          <FaCheckCircle /> Harvest
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {crops.length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No active crops. Add one to get started.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Add Crop Modal */}
      <Modal show={showCropModal} onHide={() => setShowCropModal(false)}>
        <Modal.Header closeButton><Modal.Title>Add New Crop</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3"><Form.Label>Crop Type</Form.Label><Form.Control value={currentCrop.type || ''} onChange={e => setCurrentCrop({ ...currentCrop, type: e.target.value })} placeholder="e.g. Maize, Tomato, Wheat" /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Planting Date</Form.Label><Form.Control type="date" value={currentCrop.plantingDate?.split('T')[0] || ''} onChange={e => setCurrentCrop({ ...currentCrop, plantingDate: e.target.value })} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Initial Growth Stage</Form.Label>
              <Form.Select value={currentCrop.growthStage || 'Germination'} onChange={e => setCurrentCrop({ ...currentCrop, growthStage: e.target.value })}>
                {STAGES.map(s => <option key={s}>{s}</option>)}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn btn-secondary" onClick={() => setShowCropModal(false)}>Cancel</Button>
          <Button className="btn btn-primary" onClick={handleSaveCrop}>Save Crop</Button>
        </Modal.Footer>
      </Modal>

      {/* Soil Health Modal */}
      <Modal show={showSoilModal} onHide={() => setShowSoilModal(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>Record Soil Health</Modal.Title></Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={6}><Form.Group><Form.Label>Moisture (%)</Form.Label><Form.Control type="number" value={soilData.moisture} onChange={e => setSoilData({ ...soilData, moisture: e.target.value })} /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>pH Level</Form.Label><Form.Control type="number" step="0.1" value={soilData.ph} onChange={e => setSoilData({ ...soilData, ph: e.target.value })} /></Form.Group></Col>
            <Col md={4}><Form.Group><Form.Label>Nitrogen (ppm)</Form.Label><Form.Control type="number" value={soilData.nitrogen} onChange={e => setSoilData({ ...soilData, nitrogen: e.target.value })} /></Form.Group></Col>
            <Col md={4}><Form.Group><Form.Label>Phosphorus (ppm)</Form.Label><Form.Control type="number" value={soilData.phosphorus} onChange={e => setSoilData({ ...soilData, phosphorus: e.target.value })} /></Form.Group></Col>
            <Col md={4}><Form.Group><Form.Label>Potassium (ppm)</Form.Label><Form.Control type="number" value={soilData.potassium} onChange={e => setSoilData({ ...soilData, potassium: e.target.value })} /></Form.Group></Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn btn-secondary" onClick={() => setShowSoilModal(false)}>Cancel</Button>
          <Button className="btn btn-primary" onClick={handleAddSoilHealth}>Save &amp; Get Recommendations</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CropManagement;
