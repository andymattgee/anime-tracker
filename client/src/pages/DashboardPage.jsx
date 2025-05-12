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
        <section className="app-description-section" style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
          <p style={{ fontSize: '0.9rem', color: '#495057', lineHeight: '1.6' }}>
            This is a lightweight app using the Jikan API to pull anime and manga data, allowing users to create lists and track shows and mangas they are currently enjoying. This project serves as a practical exercise to reinforce MERN stack knowledge and to gain experience working with a third-party API in depth.
          </p>
          <br />
          <p>
            To add anime or manga to your list, search for the show or manga in the Explore page and click the "Add to List" button.
          </p>
        </section>
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

        
      </div>
    </div>
  );
};

export default DashboardPage;