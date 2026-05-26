import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Table, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

const HarvestHistory = () => {
  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [harvestedCrops, setHarvestedCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadFarms(); }, []);

  useEffect(() => {
    if (selectedFarmId) loadHarvestedCrops();
  }, [selectedFarmId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadFarms = async () => {
    try {
      const res = await axios.get('/api/farms');
      setFarms(res.data);
      if (res.data.length > 0) setSelectedFarmId(res.data[0]._id);
    } catch (err) {
      setError('Failed to load farms.');
    }
  };

  const loadHarvestedCrops = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/crops/farm/${selectedFarmId}/harvested`);
      setHarvestedCrops(res.data);
    } catch (err) {
      setError('Failed to load harvest history.');
    }
    setLoading(false);
  };

  const daysSincePlanting = (plantingDate, harvestDate) => {
    if (!plantingDate || !harvestDate) return '-';
    const diff = new Date(harvestDate) - new Date(plantingDate);
    return Math.round(diff / (1000 * 60 * 60 * 24)) + ' days';
  };

  return (
    <Container>
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="dashboard-card mb-4">
        <Card.Body>
          <h2>🌾 Harvest History</h2>
          <p className="text-muted">View all crops that have been harvested from your farms.</p>
          <Form.Group className="mt-3">
            <Form.Label><strong>Select Farm</strong></Form.Label>
            <Form.Select
              value={selectedFarmId}
              onChange={e => setSelectedFarmId(e.target.value)}
              style={{ maxWidth: '300px' }}
            >
              {farms.map(f => (
                <option key={f._id} value={f._id}>{f.name} ({f.location})</option>
              ))}
              {farms.length === 0 && <option>No farms found</option>}
            </Form.Select>
          </Form.Group>
        </Card.Body>
      </Card>

      <Card className="dashboard-card">
        <Card.Body>
          <h4>Harvested Crops {harvestedCrops.length > 0 && <span className="badge badge-success ms-2">{harvestedCrops.length}</span>}</h4>

          {loading ? (
            <div className="text-center py-4"><Spinner animation="border" /></div>
          ) : (
            <Table className="table-modern" responsive>
              <thead>
                <tr>
                  <th>Crop Type</th>
                  <th>Planting Date</th>
                  <th>Harvest Date</th>
                  <th>Growing Duration</th>
                  <th>Soil Moisture at Harvest</th>
                </tr>
              </thead>
              <tbody>
                {harvestedCrops.map(crop => (
                  <tr key={crop._id}>
                    <td><strong>{crop.type}</strong></td>
                    <td>{crop.plantingDate ? new Date(crop.plantingDate).toLocaleDateString() : '-'}</td>
                    <td>{crop.harvestDate ? new Date(crop.harvestDate).toLocaleDateString() : '-'}</td>
                    <td>{daysSincePlanting(crop.plantingDate, crop.harvestDate)}</td>
                    <td>{crop.soilMoisture ? `${crop.soilMoisture}%` : 'Not recorded'}</td>
                  </tr>
                ))}
                {harvestedCrops.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">
                      No harvested crops yet for this farm.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default HarvestHistory;
