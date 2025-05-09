import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const DashboardPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: Implement logout logic
    navigate('/');
  };

  return (
    <div className="dashboard-page">
      <Navbar />
      <div className="dashboard-content">
        <section className="stats-section">
          <h2>My Stats</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Watching</h3>
              <p>0</p>
            </div>
            <div className="stat-card">
              <h3>Completed</h3>
              <p>0</p>
            </div>
            <div className="stat-card">
              <h3>Plan to Watch</h3>
              <p>0</p>
            </div>
          </div>
        </section>

        <section className="recent-activity">
          <h2>Recent Activity</h2>
          <p>No recent activity to show.</p>
        </section>

        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage; 