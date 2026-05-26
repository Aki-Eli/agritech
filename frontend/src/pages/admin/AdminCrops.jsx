import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

const AdminCrops = () => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => { fetchCrops(); }, []);

  const fetchCrops = async () => {
    try {
      const res = await axios.get('/api/admin/crops');
      setCrops(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const deleteCrop = async (id) => {
    if (window.confirm('Delete this crop?')) {
      await axios.delete(`/api/admin/crop/${id}`);
      fetchCrops();
      setMessage('Crop deleted');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  if (loading) return <Spinner animation="border" />;
  return (
    <>
      {message && <Alert variant="success">{message}</Alert>}
      <Card className="dashboard-card">
        <Card.Body>
          <h4>All Crops (Global)</h4>
          <Table striped responsive>
            <thead><tr><th>Crop Type</th><th>Farm</th><th>Growth Stage</th><th>Soil Moisture</th><th>Actions</th></tr></thead>
            <tbody>
              {crops.map(c => (
                <tr key={c._id}>
                  <td>{c.type}</td>
                  <td>{c.farmId?.name || 'Unknown'}</td>
                  <td>{c.growthStage}</td>
                  <td>{c.soilMoisture ? `${c.soilMoisture}%` : '-'}</td>
                  <td><Button size="sm" variant="danger" onClick={() => deleteCrop(c._id)}>Delete</Button></td>
                </tr>
              ))}
              {crops.length === 0 && <tr><td colSpan="5" className="text-center">No crops found</td></tr>}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </>
  );
};
export default AdminCrops;