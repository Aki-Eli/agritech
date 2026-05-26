import React from 'react';
import { Card } from 'react-bootstrap';
import { FaSeedling, FaTint, FaBug, FaCut } from 'react-icons/fa';

const getIcon = (type) => {
  switch (type) {
    case 'planting': return <FaSeedling className="me-2" color="#4caf50" />;
    case 'fertilizing': return <FaTint className="me-2" color="#ff9800" />;
    case 'harvesting': return <FaCut className="me-2" color="#f44336" />;
    default: return <FaBug className="me-2" color="#795548" />;
  }
};

const ActivityFeed = ({ activities, title = "Recent Activities" }) => {
  return (
    <Card className="dashboard-card h-100">
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        {activities.length === 0 ? (
          <p className="text-muted">No activities logged yet.</p>
        ) : (
          <ul className="list-unstyled">
            {activities.map(act => (
              <li key={act._id} className="py-2 border-bottom d-flex align-items-center">
                {getIcon(act.type)}
                <div>
                  <strong>{act.type}</strong> – {act.cropType}<br />
                  <small className="text-muted">{new Date(act.date).toLocaleDateString()}</small>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card.Body>
    </Card>
  );
};

export default ActivityFeed;