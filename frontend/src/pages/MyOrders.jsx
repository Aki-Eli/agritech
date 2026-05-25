import React, { useState, useEffect } from 'react';
import { Card, Alert, Spinner } from 'react-bootstrap';
import { FaShoppingCart } from 'react-icons/fa';
import axios from 'axios';

const statusClass = {
  Pending:   'status-pending',
  Shipped:   'status-shipped',
  Delivered: 'status-delivered',
  Cancelled: 'status-cancelled',
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/orders/me')
      .then(res => { setOrders(res.data); setLoading(false); })
      .catch(() => { setError('Failed to load orders.'); setLoading(false); });
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <Spinner animation="border" style={{ color: 'var(--primary)' }} />
    </div>
  );

  return (
    <>
      <div className="page-header">
        <h2>My Orders</h2>
        <p>Track the status of your marketplace purchases.</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="dashboard-card" style={{ border: 'none' }}>
        <div className="card-header-clean">
          <h5>Order History</h5>
          <span style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table-modern">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td style={{ fontWeight: 600, fontSize: '.78rem', color: 'var(--text-muted)' }}>
                    #{order._id.slice(-6).toUpperCase()}
                  </td>
                  <td style={{ fontSize: '.8rem' }}>
                    {order.products.map((item, i) => (
                      <div key={i}>
                        {item.productId?.name || 'Product removed'} &times; {item.quantity}
                      </div>
                    ))}
                  </td>
                  <td style={{ fontWeight: 700 }}>&#8369;{order.totalAmount?.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${statusClass[order.status] || 'badge-neutral'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>
                    {new Date(order.orderDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <FaShoppingCart style={{ fontSize: '2rem', marginBottom: '.75rem', display: 'block', margin: '0 auto .75rem' }} />
                    No orders yet. Visit the Marketplace to purchase resources.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
};

export default MyOrders;
