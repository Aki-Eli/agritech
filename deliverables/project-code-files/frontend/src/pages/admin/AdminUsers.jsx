import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Spinner, Form } from 'react-bootstrap';
import { FaUserCheck, FaBan, FaTrash, FaSearch } from 'react-icons/fa';
import axios from 'axios';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/admin/users');
      setUsers(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const action = async (fn, msg) => { await fn(); fetchUsers(); setMessage(msg); setTimeout(() => setMessage(''), 3000); };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (u) => {
    if (u.banned) return <span className="badge badge-danger">Banned</span>;
    if (!u.approved) return <span className="badge badge-warning">Pending</span>;
    return <span className="badge badge-success">Active</span>;
  };

  if (loading) return <div style={{ padding: '2rem' }}><Spinner animation="border" style={{ color: 'var(--primary)' }} /></div>;

  return (
    <>
      <div className="page-header">
        <h2>User Management</h2>
        <p>Approve, ban, and manage farmer accounts.</p>
      </div>

      {message && <Alert variant="success" className="mb-3">{message}</Alert>}

      {/* Stats */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Total Users',    value: users.length },
          { label: 'Active',         value: users.filter(u => u.approved && !u.banned).length },
          { label: 'Pending Approval', value: users.filter(u => !u.approved && !u.banned).length },
          { label: 'Banned',         value: users.filter(u => u.banned).length },
        ].map(s => (
          <Card key={s.label} className="dashboard-card" style={{ border: 'none', minWidth: 130 }}>
            <Card.Body style={{ padding: '1rem 1.25rem' }}>
              <div className="metric-value" style={{ fontSize: '1.5rem' }}>{s.value}</div>
              <div className="metric-label">{s.label}</div>
            </Card.Body>
          </Card>
        ))}
      </div>

      <Card className="dashboard-card" style={{ border: 'none' }}>
        <div className="card-header-clean">
          <h5>All Users</h5>
          <div style={{ position: 'relative', width: 220 }}>
            <FaSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '.75rem' }} />
            <Form.Control
              size="sm"
              placeholder="Search users..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '2rem' }}
            />
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table-modern" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: 'var(--primary-pale)', color: 'var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '.75rem', flexShrink: 0
                      }}>
                        {u.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '.83rem' }}>{u.name}</div>
                        <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'badge-danger' : 'badge-neutral'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>{statusBadge(u)}</td>
                  <td style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
                      {!u.approved && !u.banned && (
                        <Button size="sm" className="btn btn-primary btn-sm"
                          onClick={() => action(() => axios.put(`/api/admin/approve/${u._id}`), 'User approved.')}>
                          <FaUserCheck /> Approve
                        </Button>
                      )}
                      {!u.banned ? (
                        <Button size="sm" className="btn btn-sm"
                          style={{ background: '#d97706', color: '#fff', border: 'none' }}
                          onClick={() => action(() => axios.put(`/api/admin/ban/${u._id}`), 'User banned.')}>
                          <FaBan /> Ban
                        </Button>
                      ) : (
                        <Button size="sm" className="btn btn-sm"
                          style={{ background: '#16a34a', color: '#fff', border: 'none' }}
                          onClick={() => action(() => axios.put(`/api/admin/unban/${u._id}`), 'User unbanned.')}>
                          Unban
                        </Button>
                      )}
                      <Button size="sm" className="btn btn-sm"
                        style={{ background: '#dc2626', color: '#fff', border: 'none' }}
                        onClick={() => { if (window.confirm('Delete this user?')) action(() => axios.delete(`/api/admin/user/${u._id}`), 'User deleted.'); }}>
                        <FaTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
};

export default AdminUsers;
