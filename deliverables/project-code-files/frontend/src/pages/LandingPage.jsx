import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  FaTractor, FaLeaf, FaCloudSun, FaBug, FaShoppingCart,
  FaUsers, FaChartLine, FaUserMd, FaArrowRight,
  FaShieldAlt, FaBroadcastTower, FaFlask, FaHistory,
  FaMicrochip, FaGlobe, FaLock, FaRocket
} from 'react-icons/fa';
import AgriLogo from '../components/AgriLogo';

const features = [
  {
    icon: <FaTractor />,
    title: 'Farm Management',
    desc: 'Create detailed farm profiles, log daily operations, and monitor resource allocation across all your land in one unified dashboard.',
  },
  {
    icon: <FaLeaf />,
    title: 'Crop Intelligence',
    desc: 'Track growth cycles in real time, record soil composition data, and receive AI-driven recommendations tailored to your crops.',
  },
  {
    icon: <FaCloudSun />,
    title: 'Weather Forecasting',
    desc: 'Access live weather conditions with 5-day outlooks and context-aware farming advisories based on your location.',
  },
  {
    icon: <FaBug />,
    title: 'Pest & Disease Alerts',
    desc: 'Stay ahead of outbreaks with community-sourced alerts, preventive protocols, and targeted treatment recommendations.',
  },
  {
    icon: <FaShoppingCart />,
    title: 'Resource Marketplace',
    desc: 'Source seeds, fertilizers, pesticides, and equipment from verified suppliers — all within a single integrated storefront.',
  },
  {
    icon: <FaUserMd />,
    title: 'Expert Consultation',
    desc: 'Schedule one-on-one sessions with certified agronomists and receive personalized guidance for your specific challenges.',
  },
  {
    icon: <FaUsers />,
    title: 'Farmer Network',
    desc: 'Connect with a verified community of farmers — share field insights, ask questions, and learn from collective experience.',
  },
  {
    icon: <FaChartLine />,
    title: 'Analytics & Reports',
    desc: 'Visualize farm performance trends, track input costs, and benchmark crop yields across seasons with detailed reports.',
  },
];

const benefits = [
  { icon: <FaShieldAlt />, text: 'Admin-verified accounts for a trusted network' },
  { icon: <FaBroadcastTower />, text: 'Real-time pest broadcast alerts across all farms' },
  { icon: <FaFlask />, text: 'Soil health monitoring with nutrient analysis' },
  { icon: <FaHistory />, text: 'Full harvest history and yield benchmarking' },
];

const pillars = [
  {
    icon: <FaMicrochip />,
    title: 'Data-Driven Decisions',
    desc: 'Every feature is built around actionable data — from soil sensors to market trends — so you farm with precision, not guesswork.',
  },
  {
    icon: <FaGlobe />,
    title: 'Connected Ecosystem',
    desc: 'Weather, marketplace, experts, and community are all linked in one platform, eliminating the need to juggle multiple tools.',
  },
  {
    icon: <FaLock />,
    title: 'Trusted & Secure',
    desc: 'Every account is admin-reviewed before activation, ensuring a verified, spam-free environment for all platform members.',
  },
  {
    icon: <FaRocket />,
    title: 'Built to Scale',
    desc: 'Whether you manage a single plot or multiple farms, the platform adapts to your operation without added complexity.',
  },
];

const LandingPage = () => (
  <>
    {/* Hero */}
    <section className="hero-section">
      <div className="hero-grid-overlay" />
      <Container style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div className="hero-badge">
            <AgriLogo size={14} color="var(--neon-green)" /> Next-Generation Farming Platform
          </div>
          <h1 style={{ fontSize: 'clamp(2.1rem, 5vw, 3.2rem)', fontWeight: 800, lineHeight: 1.12, marginBottom: '1.1rem', letterSpacing: '-0.5px' }}>
            Precision Agriculture<br />
            <span className="hero-gradient-text">Powered by Technology</span>
          </h1>
          <p style={{ fontSize: '1rem', opacity: 0.78, marginBottom: '2.25rem', lineHeight: 1.75, maxWidth: 560, margin: '0 auto 2.25rem' }}>
            Agri-Tech unifies weather intelligence, soil diagnostics, pest surveillance,
            a verified marketplace, expert consultations, and a farmer network into one
            cohesive platform — built for the modern grower.
          </p>
          <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              as={Link} to="/register"
              className="hero-btn-primary"
            >
              Get Started Free <FaArrowRight />
            </Button>
            <Button
              as={Link} to="/login"
              className="hero-btn-ghost"
            >
              Sign In
            </Button>
          </div>
        </div>
      </Container>
    </section>

    {/* Benefits strip */}
    <div className="benefits-strip">
      <Container>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', justifyContent: 'center' }}>
          {benefits.map((b, i) => (
            <div key={i} className="benefit-item">
              <span className="benefit-icon">{b.icon}</span>
              {b.text}
            </div>
          ))}
        </div>
      </Container>
    </div>

    {/* Features */}
    <section className="features-section">
      <Container>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p className="section-eyebrow">Platform Capabilities</p>
          <h2 className="section-heading">Everything a Modern Farm Needs</h2>
          <p className="section-subheading">
            Eight integrated modules working together to give you complete visibility and control over your operation.
          </p>
        </div>
        <Row className="g-3">
          {features.map((f, i) => (
            <Col md={6} lg={3} key={i}>
              <div className="feature-card feature-card-futuristic">
                <div className="feature-icon feature-icon-futuristic">{f.icon}</div>
                <h5 className="feature-card-title">{f.title}</h5>
                <p className="feature-card-desc">{f.desc}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>

    {/* Why Agri-Tech */}
    <section className="pillars-section">
      <Container>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p className="section-eyebrow">Why Agri-Tech</p>
          <h2 className="section-heading">Built on Four Core Principles</h2>
        </div>
        <Row className="g-4">
          {pillars.map((p, i) => (
            <Col md={6} lg={3} key={i}>
              <div className="pillar-card">
                <div className="pillar-icon">{p.icon}</div>
                <h5 className="pillar-title">{p.title}</h5>
                <p className="pillar-desc">{p.desc}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>

    {/* CTA */}
    <section className="cta-section">
      <Container>
        <div className="cta-block">
          <div className="cta-glow" />
          <p className="section-eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Start Today</p>
          <h2 style={{ fontWeight: 800, marginBottom: '.75rem', fontSize: '1.9rem' }}>
            Ready to upgrade your operation?
          </h2>
          <p style={{ opacity: 0.72, marginBottom: '2rem', fontSize: '.95rem', maxWidth: 480, margin: '0 auto 2rem' }}>
            Join a growing network of farmers using Agri-Tech to make smarter decisions, reduce waste, and increase yields.
          </p>
          <Button
            as={Link} to="/register"
            className="cta-btn"
          >
            Create Free Account <FaArrowRight />
          </Button>
        </div>
      </Container>
    </section>

    {/* Footer */}
    <footer className="landing-footer">
      <Container>
        <div className="footer-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: '#fff', fontWeight: 700, fontSize: '.9rem' }}>
            <AgriLogo size={20} color="var(--neon-green)" /> Agri-Tech
          </div>
          <p style={{ margin: 0, fontSize: '.75rem' }}>
            Precision agriculture platform — empowering farmers with intelligent technology.
          </p>
          <p style={{ margin: 0, fontSize: '.72rem' }}>
            © {new Date().getFullYear()} Agri-Tech. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  </>
);

export default LandingPage;
