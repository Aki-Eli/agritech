import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaBox } from 'react-icons/fa';
import axios from 'axios';

const CATEGORIES = ['seed', 'fertilizer', 'pesticide', 'equipment', 'other'];

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    const res = await axios.get('/api/admin/products');
    setProducts(res.data);
    setLoading(false);
  };

  const openCreate = () => {
    setEditing({ name: '', category: 'seed', price: '', stock: '', description: '', imageUrl: '' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (p) => { setEditing({ ...p }); setError(''); setShowModal(true); };

  const saveProduct = async () => {
    if (!editing.name?.trim()) { setError('Product name is required.'); return; }
    try {
      if (editing._id) await axios.put(`/api/admin/products/${editing._id}`, editing);
      else await axios.post('/api/admin/products', editing);
      setShowModal(false);
      fetchProducts();
      setMessage(editing._id ? 'Product updated.' : 'Product created.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { setError('Failed to save product.'); }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await axios.delete(`/api/admin/products/${id}`);
    fetchProducts();
    setMessage('Product deleted.');
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) return <div style={{ padding: '2rem' }}><Spinner animation="border" style={{ color: 'var(--primary)' }} /></div>;

  return (
    <>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h2>Products</h2>
          <p>Manage the marketplace inventory.</p>
        </div>
        <Button className="btn btn-primary" onClick={openCreate}><FaPlus /> Add Product</Button>
      </div>

      {message && <Alert variant="success" className="mb-3">{message}</Alert>}

      <Card className="dashboard-card" style={{ border: 'none' }}>
        <div className="card-header-clean">
          <h5>All Products ({products.length})</h5>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table-modern">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 'var(--radius-md)',
                        overflow: 'hidden', background: 'var(--surface-3)', flexShrink: 0
                      }}>
                        {p.imageUrl
                          ? <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <FaBox style={{ color: 'var(--text-muted)', fontSize: '.85rem' }} />
                            </div>}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '.83rem' }}>{p.name}</div>
                        <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>{p.description?.slice(0, 40)}...</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>{p.category}</span></td>
                  <td style={{ fontWeight: 700 }}>₱{p.price?.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${p.stock > 10 ? 'badge-success' : p.stock > 0 ? 'badge-warning' : 'badge-danger'}`}>
                      {p.stock} units
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '.4rem' }}>
                      <Button size="sm" className="btn btn-sm" style={{ background: '#e2e8f0', color: '#1e293b', border: 'none' }}
                        onClick={() => openEdit(p)}>
                        <FaEdit />
                      </Button>
                      <Button size="sm" className="btn btn-sm" style={{ background: '#dc2626', color: '#fff', border: 'none' }}
                        onClick={() => deleteProduct(p._id)}>
                        <FaTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No products yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editing?._id ? 'Edit Product' : 'Add New Product'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form>
            <Row className="g-3">
              <Col md={8}>
                <Form.Group>
                  <Form.Label>Product Name *</Form.Label>
                  <Form.Control value={editing?.name || ''} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. NPK Fertilizer 20-20-20" />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Category</Form.Label>
                  <Form.Select value={editing?.category || 'seed'} onChange={e => setEditing({ ...editing, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Price (₱)</Form.Label>
                  <Form.Control type="number" min="0" value={editing?.price || ''} onChange={e => setEditing({ ...editing, price: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Stock Quantity</Form.Label>
                  <Form.Control type="number" min="0" value={editing?.stock || ''} onChange={e => setEditing({ ...editing, stock: e.target.value })} />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control as="textarea" rows={3} value={editing?.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })} />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Image URL (optional)</Form.Label>
                  <Form.Control value={editing?.imageUrl || ''} onChange={e => setEditing({ ...editing, imageUrl: e.target.value })} placeholder="https://..." />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button className="btn btn-primary" onClick={saveProduct}>
            {editing?._id ? 'Update Product' : 'Create Product'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AdminProducts;
