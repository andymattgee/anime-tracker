import React from 'react';
import Navbar from '../components/Navbar';
import UserInfo from '../components/UserInfo';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <Navbar />
      <div className="dashboard-content">
        <div className="dashboard-card">
          <div className="user-welcome">
            <UserInfo />
          </div>
          <section className="app-description-section">
            <p className="description-text">
              This is a lightweight app using the Jikan API to pull anime and manga data, allowing users to create lists and track shows and mangas they are currently enjoying. This project serves as a practical exercise to reinforce MERN stack knowledge and to gain experience working with a third-party API in depth.
            </p>
            <p className="description-text">
              To add anime or manga to your list, search for the show or manga in the Explore page and click the "Add to List" button.
            </p>
          </section>
          <section className="stats-section">
            <h2 className="section-title">My Stats</h2>
            <div className="construction-badge">
              <span className="construction-icon">🚧</span> Under Construction
            </div>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Watching</h3>
                <p className="stat-number">0</p>
              </div>
              <div className="stat-card">
                <h3>Completed</h3>
                <p className="stat-number">0</p>
              </div>
              <div className="stat-card">
                <h3>Plan to Watch</h3>
                <p className="stat-number">0</p>
              </div>
            </div>
          </section>

          <section className="recent-activity">
            <h2 className="section-title">Recent Activity</h2>
            <div className="construction-badge">
              <span className="construction-icon">🚧</span> Under Construction
            </div>
            <p className="empty-state">No recent activity to show.</p>
          </section>
        </div>
      </div>

      <style jsx>{`
        .dashboard-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #ff416c, #8a2387);
          font-family: 'Arial', sans-serif;
          padding-bottom: 40px;
        }
        
        .dashboard-content {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .dashboard-card {
          background-color: rgba(255, 255, 255, 0.9);
          border-radius: 10px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
          padding: 30px;
          margin-top: 20px;
        }
        
        .user-welcome {
          width: 100%;
          margin-bottom: 2rem;
        }
        
        .app-description-section {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background-color: rgba(233, 236, 239, 0.7);
          border-radius: 8px;
          border-left: 4px solid #8a2387;
        }
        
        .description-text {
          font-size: 0.95rem;
          color: #495057;
          line-height: 1.6;
          margin-bottom: 1rem;
        }
        
        .section-title {
          color: #8a2387;
          font-size: 24px;
          margin-bottom: 20px;
          position: relative;
          padding-bottom: 10px;
        }
        
        .section-title:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 50px;
          height: 3px;
          background: linear-gradient(to right, #ff416c, #8a2387);
          border-radius: 3px;
        }
        
        .construction-badge {
          display: inline-block;
          background-color: #ffeeba;
          color: #856404;
          padding: 8px 15px;
          border-radius: 20px;
          margin-bottom: 20px;
          font-weight: bold;
          font-size: 14px;
          border: 1px dashed #856404;
        }
        
        .construction-icon {
          margin-right: 6px;
          font-size: 16px;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 2rem;
        }
        
        .stat-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }
        
        .stat-card h3 {
          color: #495057;
          margin-bottom: 10px;
          font-size: 18px;
        }
        
        .stat-number {
          font-size: 28px;
          font-weight: bold;
          color: #8a2387;
        }
        
        .recent-activity {
          margin-top: 2rem;
        }
        
        .empty-state {
          color: #6c757d;
          font-style: italic;
          text-align: center;
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 8px;
        }
        
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .dashboard-card {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;