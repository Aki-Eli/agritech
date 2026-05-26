import React from 'react';
import { Card } from 'react-bootstrap';

const MetricCard = ({ title, value, icon: Icon, color = '#7a5a4b' }) => {
  return (
    <Card className="dashboard-card metric-card h-100">
      <Card.Body>
        <div className="metric-value">{value}</div>
        <div className="metric-label">{title}</div>
        {Icon && <Icon className="float-end" size={28} color={color} style={{ marginTop: '-35px', opacity: 0.8 }} />}
      </Card.Body>
    </Card>
  );
};

export default MetricCard;