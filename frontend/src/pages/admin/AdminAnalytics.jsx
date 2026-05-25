import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner } from 'react-bootstrap';
import { FaUsers, FaShoppingCart, FaLeaf, FaTractor, FaBug, FaCalendarAlt } from 'react-icons/fa';
import {
  AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine, Legend
} from 'recharts';
import axios from 'axios';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/* Custom tooltip */
const RevenueTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--border)',
      borderRadius: 10, padding: '.75rem 1rem',
      boxShadow: '0 4px 12px rgba(0,0,0,.08)', fontSize: 12
    }}>
      <div style={{ fontWeight: 700, marginBottom: '.4rem', color: 'var(--text-primary)' }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.2rem' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <span style={{ color: 'var(--text-secondary)' }}>
            {p.dataKey === 'revenue' ? 'Revenue' : 'Orders'}:
          </span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
            {p.dataKey === 'revenue' ? `₱${Number(p.value).toLocaleString()}` : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const AdminAnalytics = () => {
  const [data, setData]     = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/admin/analytics').then(res => { setData(res.data); setLoading(false); });
  }, []);

  if (loading) return (
    <div style={{ padding: '2rem' }}>
      <Spinner animation="border" style={{ color: 'var(--primary)' }} />
    </div>
  );

  const chartData = (data.monthlyOrders || []).map(m => ({
    month: MONTH_NAMES[(m._id || 1) - 1],
    revenue: m.revenue || 0,
    orders:  m.count   || 0,
  }));

  const avgRevenue = chartData.length
    ? Math.round(chartData.reduce((s, d) => s + d.revenue, 0) / chartData.length)
    : 0;

  const approvalRate = data.totalUsers
    ? Math.round((data.approvedUsers / data.totalUsers) * 100)
    : 0;

  const kpis = [
    { label: 'Total Users',      value: data.totalUsers || 0,      icon: <FaUsers />,        variant: 'green'  },
    { label: 'Total Orders',     value: data.totalOrders || 0,     icon: <FaShoppingCart />, variant: 'blue'   },
    { label: 'Revenue',          value: `₱${(data.totalRevenue || 0).toLocaleString()}`, icon: <FaShoppingCart />, variant: 'orange' },
    { label: 'Pending Bookings', value: data.pendingBookings || 0, icon: <FaCalendarAlt />, variant: 'red'    },
    { label: 'Total Farms',      value: data.totalFarms || 0,      icon: <FaTractor />,      variant: 'green'  },
    { label: 'Total Crops',      value: data.totalCrops || 0,      icon: <FaLeaf />,         variant: 'green'  },
    { label: 'Active Alerts',    value: data.alertsCount || 0,     icon: <FaBug />,          variant: 'red'    },
    { label: 'Approval Rate',    value: `${approvalRate}%`,        icon: <FaUsers />,        variant: 'blue'   },
  ];

  return (
    <>
      <div className="page-header">
        <h2>Analytics</h2>
        <p>Platform-wide performance metrics and trends.</p>
      </div>

      {/* KPI cards */}
      <Row className="g-3 mb-4">
        {kpis.map(k => (
          <Col xs={6} md={3} key={k.label}>
            <Card className="dashboard-card" style={{ border: 'none' }}>
              <Card.Body style={{ padding: '1.25rem' }}>
                <div className={`metric-icon ${k.variant}`}>{k.icon}</div>
                <div className="metric-value" style={{ fontSize: '1.6rem' }}>{k.value}</div>
                <div className="metric-label">{k.label}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Revenue chart + summary */}
      <Row className="g-3">
        <Col lg={8}>
          <Card className="dashboard-card" style={{ border: 'none' }}>
            <div className="card-header-clean">
              <h5>Monthly Revenue &amp; Orders</h5>
              {avgRevenue > 0 && (
                <span style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>
                  Avg revenue: <strong style={{ color: 'var(--primary)' }}>₱{avgRevenue.toLocaleString()}</strong>
                </span>
              )}
            </div>
            <Card.Body style={{ padding: '1.25rem 1.5rem 1.5rem' }}>
              {chartData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '.83rem' }}>
                  No order data available yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    {/* Gradient definitions */}
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="var(--primary)" stopOpacity={0.18} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#f4a261" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#f4a261" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />

                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="revenue"
                      orientation="left"
                      tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={v => `₱${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`}
                    />
                    <YAxis
                      yAxisId="orders"
                      orientation="right"
                      tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />

                    <Tooltip content={<RevenueTooltip />} />

                    <Legend
                      wrapperStyle={{ fontSize: 12, paddingTop: '1rem' }}
                      formatter={name => name === 'revenue' ? 'Revenue (₱)' : 'Orders'}
                    />

                    {/* Average revenue reference line */}
                    {avgRevenue > 0 && (
                      <ReferenceLine
                        yAxisId="revenue"
                        y={avgRevenue}
                        stroke="var(--primary)"
                        strokeDasharray="6 3"
                        strokeOpacity={0.4}
                        label={{
                          value: 'Avg',
                          position: 'insideTopRight',
                          fontSize: 10,
                          fill: 'var(--primary)',
                          opacity: 0.7
                        }}
                      />
                    )}

                    {/* Revenue area */}
                    <Area
                      yAxisId="revenue"
                      type="monotone"
                      dataKey="revenue"
                      stroke="var(--primary)"
                      strokeWidth={2.5}
                      fill="url(#revenueGrad)"
                      dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, fill: 'var(--primary)', stroke: '#fff', strokeWidth: 2 }}
                    />

                    {/* Orders line */}
                    <Area
                      yAxisId="orders"
                      type="monotone"
                      dataKey="orders"
                      stroke="#f4a261"
                      strokeWidth={2}
                      strokeDasharray="5 3"
                      fill="url(#ordersGrad)"
                      dot={{ r: 3, fill: '#f4a261', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 5, fill: '#f4a261', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Platform summary */}
        <Col lg={4}>
          <Card className="dashboard-card h-100" style={{ border: 'none' }}>
            <div className="card-header-clean"><h5>Platform Summary</h5></div>
            <Card.Body style={{ padding: '1.25rem' }}>
              {[
                { label: 'Approved Users',   value: data.approvedUsers || 0 },
                { label: 'Pending Approval', value: (data.totalUsers || 0) - (data.approvedUsers || 0) },
                { label: 'Total Bookings',   value: data.totalBookings || 0 },
                { label: 'Pending Bookings', value: data.pendingBookings || 0 },
                { label: 'Active Alerts',    value: data.alertsCount || 0 },
              ].map(item => (
                <div key={item.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '.65rem 0', borderBottom: '1px solid var(--border)'
                }}>
                  <span style={{ fontSize: '.82rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span style={{ fontWeight: 700, fontSize: '.9rem' }}>{item.value}</span>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default AdminAnalytics;
