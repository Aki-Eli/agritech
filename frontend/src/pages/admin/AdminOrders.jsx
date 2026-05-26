import React, { useState, useEffect } from 'react';
import { Card, Form, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

const statusClass = { Pending: 'status-pending', Shipped: 'status-shipped', Delivered: 'status-delivered', Cancelled: 'status-cancelled' };

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/admin/orders');
      setOrders(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/api/admin/order/${id}`, { status });
      setMessage(`Order updated to ${status}.`);
      setTimeout(() => setMessage(''), 3000);
      fetchOrders();
    } catch (err) { alert('Error updating status'); }
  };

  if (loading) return <div style={{ padding: '2rem' }}><Spinner animation="border" style={{ color: 'var(--primary)' }} /></div>;

  const revenue = orders.filter(o => o.status === 'Delivered').reduce((s, o) => s + (o.totalAmount || 0), 0);

  return (
    <>
      <div className="page-header">
        <h2>Orders</h2>
        <p>Manage and update the status of all customer orders.</p>
      </div>

      {message && <Alert variant="success" className="mb-3">{message}</Alert>}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Total Orders',   value: orders.length },
          { label: 'Pending',        value: orders.filter(o => o.status === 'Pending').length },
          { label: 'Delivered',      value: orders.filter(o => o.status === 'Delivered').length },
          { label: 'Revenue',        value: `₱${revenue.toLocaleString()}` },
        ].map(s => (
          <Card key={s.label} className="dashboard-card" style={{ border: 'none', minWidth: 130 }}>
            <Card.Body style={{ padding: '1rem 1.25rem' }}>
              <div className="metric-value" style={{ fontSize: '1.4rem' }}>{s.value}</div>
              <div className="metric-label">{s.label}</div>
            </Card.Body>
          </Card>
        ))}
      </div>

      <Card className="dashboard-card" style={{ border: 'none' }}>
        <div className="card-header-clean"><h5>All Orders</h5></div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table-modern">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Date</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td style={{ fontWeight: 600, fontSize: '.78rem', color: 'var(--text-muted)' }}>
                    #{order._id.slice(-6).toUpperCase()}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '.83rem' }}>{order.userId?.name || 'Unknown'}</div>
                    <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>{order.userId?.email}</div>
                  </td>
                  <td style={{ fontSize: '.78rem' }}>
                    {order.products?.map(p => (
                      <div key={p.productId?._id}>{p.productId?.name} × {p.quantity}</div>
                    ))}
                  </td>
                  <td style={{ fontWeight: 700 }}>₱{order.totalAmount?.toLocaleString()}</td>
                  <td style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>
                    {new Date(order.orderDate).toLocaleDateString()}
                  </td>
                  <td>
                    <span className={`badge ${statusClass[order.status] || 'badge-neutral'}`}>{order.status}</span>
                  </td>
                  <td>
                    <Form.Select
                      size="sm"
                      value={order.status}
                      onChange={e => updateStatus(order._id, e.target.value)}
                      style={{ width: 120 }}
                    >
                      <option>Pending</option>
                      <option>Shipped</option>
                      <option>Delivered</option>
                      <option>Cancelled</option>
                    </Form.Select>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No orders yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
};

export default AdminOrders;
