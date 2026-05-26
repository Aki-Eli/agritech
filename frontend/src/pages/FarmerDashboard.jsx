import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  FaTractor, FaLeaf, FaBug, FaShoppingCart,
  FaSeedling, FaTint, FaCut, FaCloudSun,
  FaArrowRight, FaHistory, FaUsers, FaFlask, FaMapMarkerAlt
} from 'react-icons/fa';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, LineChart, Line, CartesianGrid,
  PieChart, Pie, Legend
} from 'recharts';
import axios from 'axios';

/* ── Design tokens ── */
const STAGE_COLORS = {
  Germination: '#52b788',
  Vegetative:  '#2d6a4f',
  Flowering:   '#f4a261',
  Harvest:     '#e76f51',
};
const PIE_COLORS = ['#2d6a4f', '#52b788', '#f4a261', '#e76f51', '#0ea5e9'];

const statusClass = {
  Pending:   'status-pending',
  Shipped:   'status-shipped',
  Delivered: 'status-delivered',
  Cancelled: 'status-cancelled',
};

/* ── KPI card ── */
const StatCard = ({ value, label, icon, variant = 'green' }) => (
  <Card className="dashboard-card" style={{ border: 'none' }}>
    <Card.Body style={{ padding: '1.25rem 1.5rem' }}>
      <div className={`metric-icon ${variant}`}>{icon}</div>
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}</div>
    </Card.Body>
  </Card>
);

/* ── Shared tooltip ── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--border)',
      borderRadius: 10, padding: '.6rem .9rem',
      boxShadow: '0 4px 12px rgba(0,0,0,.08)', fontSize: 12,
    }}>
      <div style={{ fontWeight: 700, marginBottom: '.2rem', color: 'var(--text-primary)' }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: 'var(--text-secondary)' }}>
          {p.name}: <strong style={{ color: 'var(--text-primary)' }}>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

/* ── Section divider ── */
const SectionLabel = ({ children }) => (
  <div style={{
    fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '1px', color: 'var(--text-muted)',
    margin: '2rem 0 .75rem', paddingBottom: '.4rem',
    borderBottom: '1px solid var(--border)',
  }}>
    {children}
  </div>
);

/* ════════════════════════════════════════════════════════════ */
const FarmerDashboard = () => {
  const [farms, setFarms]               = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState('all'); // 'all' or a farm _id
  const [stats, setStats]               = useState({ crops: 0, activities: 0, alerts: 0, orders: 0 });
  const [weather, setWeather]           = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [stageSummary, setStageSummary] = useState([]);
  const [analytics, setAnalytics]       = useState(null);
  const [loading, setLoading]           = useState(true);

  // fetchAll is defined once and never changes — safe to omit from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchAll(); }, []);

  // Re-aggregate when farm selection changes (without re-fetching from server).
  // farms and aggregateFarmData are stable within a render cycle.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (farms.length > 0) aggregateFarmData(farms, selectedFarmId);
  }, [selectedFarmId]);

  /* ── Fetch everything once ── */
  const fetchAll = async () => {
    try {
      // All farms for this user
      const farmsRes = await axios.get('/api/farms');
      const allFarms = farmsRes.data;
      setFarms(allFarms);

      if (allFarms.length > 0) {
        await aggregateFarmData(allFarms, 'all');
      }

      // Weather (geolocation, independent of farm selection)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async pos => {
          try {
            const r = await axios.get(`/api/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
            setWeather(r.data);
          } catch { /* silent */ }
        });
      }

      // Analytics (always across all farms)
      const analyticsRes = await axios.get('/api/admin/farmer-analytics');
      setAnalytics(analyticsRes.data);

    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  /* ── Aggregate crops + activities for selected farm(s) ── */
  const aggregateFarmData = async (allFarms, farmFilter) => {
    const targetFarms = farmFilter === 'all'
      ? allFarms
      : allFarms.filter(f => f._id === farmFilter);

    try {
      // Fetch crops and activities for every target farm in parallel
      const [cropsResults, activitiesResults, alertsRes, ordersRes] = await Promise.all([
        Promise.all(targetFarms.map(f => axios.get(`/api/crops/farm/${f._id}`))),
        Promise.all(targetFarms.map(f => axios.get(`/api/farm-activities/${f._id}`))),
        axios.get('/api/alerts'),
        axios.get('/api/orders/me'),
      ]);

      const allCrops      = cropsResults.flatMap(r => r.data);
      const allActivities = activitiesResults.flatMap(r => r.data);

      setStats({
        crops:      allCrops.length,
        activities: allActivities.length,
        alerts:     alertsRes.data.filter(a => !a.implemented).length,
        orders:     ordersRes.data.length,
      });

      // Sort activities newest first, take top 5
      const sorted = [...allActivities].sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecentActivities(sorted.slice(0, 5));

      // Build stage summary across all selected farms
      const counts = { Germination: 0, Vegetative: 0, Flowering: 0, Harvest: 0 };
      allCrops.forEach(c => {
        if (counts[c.growthStage] !== undefined) counts[c.growthStage]++;
      });
      setStageSummary(Object.entries(counts).map(([stage, count]) => ({ stage, count })));

    } catch (err) {
      console.error('aggregateFarmData error:', err);
    }
  };

  const activityIcon = (type) => {
    const map = {
      planting:    { icon: <FaSeedling />, bg: '#dcfce7', color: '#15803d' },
      fertilizing: { icon: <FaTint />,     bg: '#fff3e0', color: '#e76f51' },
      harvesting:  { icon: <FaCut />,      bg: '#fee2e2', color: '#b91c1c' },
      irrigation:  { icon: <FaTint />,     bg: '#e0f2fe', color: '#0369a1' },
    };
    return map[type] || { icon: <FaTractor />, bg: '#f0f4f1', color: '#4a6358' };
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <Spinner animation="border" style={{ color: 'var(--primary)' }} />
      <span style={{ color: 'var(--text-muted)', fontSize: '.85rem' }}>Loading dashboard...</span>
    </div>
  );

  const activityData = analytics ? Object.entries(analytics.activityTypeCounts).map(([type, count]) => ({ type, count })) : [];

  const selectedFarmName = selectedFarmId === 'all'
    ? `All Farms (${farms.length})`
    : farms.find(f => f._id === selectedFarmId)?.name || 'Farm';

  return (
    <>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Dashboard</h2>
          <p>Overview and analytics for your farm operations.</p>
        </div>

        {/* Farm selector */}
        {farms.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
            <FaMapMarkerAlt style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <Form.Select
              size="sm"
              value={selectedFarmId}
              onChange={e => setSelectedFarmId(e.target.value)}
              style={{ minWidth: 200, borderRadius: 'var(--radius-md)', fontSize: '.82rem' }}
            >
              <option value="all">All Farms ({farms.length})</option>
              {farms.map(f => (
                <option key={f._id} value={f._id}>{f.name} — {f.location}</option>
              ))}
            </Form.Select>
          </div>
        )}
      </div>

      {/* Farm pills (visual indicator when multiple farms exist) */}
      {farms.length > 1 && (
        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <button
            onClick={() => setSelectedFarmId('all')}
            style={{
              padding: '.3rem .85rem', borderRadius: 'var(--radius-full)',
              border: '1.5px solid', cursor: 'pointer', fontSize: '.75rem', fontWeight: 600,
              borderColor: selectedFarmId === 'all' ? 'var(--primary)' : 'var(--border)',
              background: selectedFarmId === 'all' ? 'var(--primary)' : 'var(--surface)',
              color: selectedFarmId === 'all' ? '#fff' : 'var(--text-secondary)',
              transition: 'all .15s',
            }}
          >
            All Farms
          </button>
          {farms.map(f => (
            <button
              key={f._id}
              onClick={() => setSelectedFarmId(f._id)}
              style={{
                padding: '.3rem .85rem', borderRadius: 'var(--radius-full)',
                border: '1.5px solid', cursor: 'pointer', fontSize: '.75rem', fontWeight: 600,
                borderColor: selectedFarmId === f._id ? 'var(--primary)' : 'var(--border)',
                background: selectedFarmId === f._id ? 'var(--primary)' : 'var(--surface)',
                color: selectedFarmId === f._id ? '#fff' : 'var(--text-secondary)',
                transition: 'all .15s',
              }}
            >
              {f.name}
            </button>
          ))}
        </div>
      )}

      {/* ══ OVERVIEW KPIs ══ */}
      <Row className="g-3 mb-4">
        <Col xs={6} lg={3}><StatCard value={stats.crops}      label="Active Crops"    icon={<FaLeaf />}         variant="green"  /></Col>
        <Col xs={6} lg={3}><StatCard value={stats.activities} label="Farm Activities" icon={<FaTractor />}      variant="orange" /></Col>
        <Col xs={6} lg={3}><StatCard value={stats.alerts}     label="Pending Alerts"  icon={<FaBug />}          variant="red"    /></Col>
        <Col xs={6} lg={3}><StatCard value={stats.orders}     label="Orders Placed"   icon={<FaShoppingCart />} variant="blue"   /></Col>
      </Row>

      {/* ══ WEATHER + CROPS CHART ══ */}
      <Row className="g-3 mb-4">
        <Col lg={4}>
          <Card className="dashboard-card h-100" style={{ border: 'none' }}>
            <Card.Body style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1rem' }}>
                <FaCloudSun style={{ color: 'var(--primary)' }} />
                <span style={{ fontWeight: 600, fontSize: '.85rem' }}>Current Weather</span>
              </div>
              {weather ? (
                <>
                  <div style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                    {Math.round(weather.main.temp)}°C
                  </div>
                  <p style={{ textTransform: 'capitalize', color: 'var(--text-secondary)', margin: '.4rem 0 1rem', fontSize: '.85rem' }}>
                    {weather.weather[0].description}
                  </p>
                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <div>
                      <div style={{ fontSize: '.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Humidity</div>
                      <div style={{ fontWeight: 600, fontSize: '.85rem' }}>{weather.main.humidity}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Wind</div>
                      <div style={{ fontWeight: 600, fontSize: '.85rem' }}>{weather.wind.speed} m/s</div>
                    </div>
                  </div>
                </>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '.83rem' }}>Enable location access to see weather.</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="dashboard-card h-100" style={{ border: 'none' }}>
            <div className="card-header-clean">
              <h5>Crops by Growth Stage</h5>
              <span style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{selectedFarmName}</span>
            </div>
            <Card.Body style={{ padding: '1.25rem 1.5rem' }}>
              {stageSummary.every(s => s.count === 0) ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180, color: 'var(--text-muted)', fontSize: '.83rem' }}>
                  No active crops — add crops in Crop Management.
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={stageSummary} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="stage" width={90} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="count" radius={[0, 6, 6, 0]} name="Crops">
                        {stageSummary.map((s, i) => <Cell key={i} fill={STAGE_COLORS[s.stage] || 'var(--primary)'} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '.5rem' }}>
                    {stageSummary.map(s => (
                      <div key={s.stage} style={{ display: 'flex', alignItems: 'center', gap: '.35rem', fontSize: '.72rem', color: 'var(--text-secondary)' }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: STAGE_COLORS[s.stage], flexShrink: 0 }} />
                        {s.stage}: <strong>{s.count}</strong>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ══ RECENT ACTIVITIES + QUICK ACTIONS ══ */}
      <Row className="g-3 mb-2">
        <Col md={7}>
          <Card className="dashboard-card" style={{ border: 'none' }}>
            <div className="card-header-clean">
              <h5>Recent Activities <span style={{ fontSize: '.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>— {selectedFarmName}</span></h5>
              <Link to="/farm-setup" style={{ fontSize: '.78rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                View all <FaArrowRight style={{ fontSize: '.65rem' }} />
              </Link>
            </div>
            <Card.Body style={{ padding: '0 1.5rem' }}>
              {recentActivities.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '.83rem', padding: '1rem 0' }}>
                  No activities logged yet. Go to Farm Setup to get started.
                </p>
              ) : recentActivities.map(act => {
                const { icon, bg, color } = activityIcon(act.type);
                return (
                  <div key={act._id} className="activity-item">
                    <div className="activity-dot" style={{ background: bg, color }}>{icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '.83rem', textTransform: 'capitalize' }}>{act.type}</div>
                      <div style={{ fontSize: '.78rem', color: 'var(--text-secondary)' }}>{act.cropType}</div>
                    </div>
                    <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>
                      {new Date(act.date).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </Card.Body>
          </Card>
        </Col>

        <Col md={5}>
          <Card className="dashboard-card" style={{ border: 'none' }}>
            <div className="card-header-clean"><h5>Quick Actions</h5></div>
            <Card.Body style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              {[
                { to: '/crops',       icon: <FaLeaf />,        label: 'Manage Crops' },
                { to: '/farm-setup',  icon: <FaTractor />,     label: 'Log Farm Activity' },
                { to: '/marketplace', icon: <FaShoppingCart />,label: 'Buy Resources' },
                { to: '/forum',       icon: <FaUsers />,       label: 'Community Forum' },
              ].map(a => (
                <Link key={a.to} to={a.to} className="quick-action-btn">
                  <div className="qa-icon">{a.icon}</div>
                  <span>{a.label}</span>
                  <FaArrowRight style={{ marginLeft: 'auto', fontSize: '.7rem', color: 'var(--text-muted)' }} />
                </Link>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ══ ANALYTICS SECTION (always across all farms) ══ */}
      {analytics && (
        <>
          <SectionLabel>Analytics — All Farms</SectionLabel>

          <Row className="g-3 mb-4">
            <Col xs={6} md={3}><StatCard value={analytics.totalFarms}     label="Total Farms"     icon={<FaTractor />}      variant="green"  /></Col>
            <Col xs={6} md={3}><StatCard value={analytics.harvestedCrops} label="Harvested Crops" icon={<FaHistory />}      variant="orange" /></Col>
            <Col xs={6} md={3}><StatCard value={`₱${analytics.totalSpent.toFixed(2)}`} label="Total Spent" icon={<FaShoppingCart />} variant="blue" /></Col>
            <Col xs={6} md={3}><StatCard value={analytics.pendingAlerts}  label="Pending Alerts"  icon={<FaBug />}          variant="red"    /></Col>
          </Row>

          <Row className="g-3 mb-4">
            <Col lg={5}>
              <Card className="dashboard-card h-100" style={{ border: 'none' }}>
                <div className="card-header-clean"><h5>Activity Breakdown</h5></div>
                <Card.Body style={{ padding: '1.25rem 1.5rem' }}>
                  {activityData.length === 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--text-muted)', fontSize: '.83rem' }}>
                      No activities logged yet.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={activityData} dataKey="count" nameKey="type" cx="50%" cy="50%" innerRadius={45} outerRadius={78} paddingAngle={3}>
                          {activityData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 12 }} />
                        <Legend wrapperStyle={{ fontSize: 11 }} formatter={n => n.charAt(0).toUpperCase() + n.slice(1)} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col lg={7}>
              <Card className="dashboard-card h-100" style={{ border: 'none' }}>
                <div className="card-header-clean"><h5>Activity Trend — Last 6 Months</h5></div>
                <Card.Body style={{ padding: '1.25rem 1.5rem' }}>
                  {analytics.activityTrend.length === 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--text-muted)', fontSize: '.83rem' }}>
                      No activity data for the last 6 months.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={analytics.activityTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<ChartTooltip />} />
                        <Line type="monotone" dataKey="count" name="Activities" stroke="var(--primary)" strokeWidth={2.5}
                          dot={{ r: 4, fill: 'var(--primary)', stroke: '#fff', strokeWidth: 2 }}
                          activeDot={{ r: 6, fill: 'var(--primary)', stroke: '#fff', strokeWidth: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="dashboard-card mb-4" style={{ border: 'none' }}>
            <div className="card-header-clean">
              <h5>Recent Orders</h5>
              <Link to="/my-orders" style={{ fontSize: '.78rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                View all <FaArrowRight style={{ fontSize: '.65rem' }} />
              </Link>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="table-modern">
                <thead><tr><th>Date</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
                <tbody>
                  {analytics.recentOrders.map(order => (
                    <tr key={order._id}>
                      <td style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>{new Date(order.orderDate).toLocaleDateString()}</td>
                      <td style={{ fontSize: '.8rem' }}>{order.products?.length || 0} item(s)</td>
                      <td style={{ fontWeight: 700 }}>₱{order.totalAmount?.toFixed(2)}</td>
                      <td><span className={`badge ${statusClass[order.status] || 'badge-neutral'}`}>{order.status}</span></td>
                    </tr>
                  ))}
                  {analytics.recentOrders.length === 0 && (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>No orders yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="dashboard-card" style={{ border: 'none' }}>
            <div className="card-header-clean">
              <h5><FaFlask className="me-2" style={{ color: 'var(--primary)', fontSize: '.85rem' }} />Recent Soil Health Readings</h5>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="table-modern">
                <thead><tr><th>Date</th><th>Moisture (%)</th><th>pH</th><th>Nitrogen</th><th>Phosphorus</th><th>Potassium</th></tr></thead>
                <tbody>
                  {analytics.recentSoilRecords.map(s => (
                    <tr key={s._id}>
                      <td style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>{s.date ? new Date(s.date).toLocaleDateString() : '—'}</td>
                      <td>{s.moisture ?? '—'}</td>
                      <td>{s.ph ?? '—'}</td>
                      <td>{s.nitrogen ?? '—'}</td>
                      <td>{s.phosphorus ?? '—'}</td>
                      <td>{s.potassium ?? '—'}</td>
                    </tr>
                  ))}
                  {analytics.recentSoilRecords.length === 0 && (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>No soil readings recorded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </>
  );
};

export default FarmerDashboard;
