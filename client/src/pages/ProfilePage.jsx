import React from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="profile-container">
      <Navbar />
      <div className="profile-content">
        <div className="profile-card">
          <h1 className="profile-title">User Profile</h1>
          
          <div className="construction-banner">
            <span className="construction-icon">🚧</span>
            <h2>Page Under Construction</h2>
            <p>We're currently building this page. Check back soon for updates!</p>
          </div>
          
          {user && (
            <div className="profile-info">
              <div className="profile-section">
                <h2 className="section-title">Profile Information</h2>
                <div className="info-item">
                  <label>Username:</label>
                  <span>{user.username || 'Not set'}</span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{user.email || 'Not available'}</span>
                </div>
                <div className="info-item">
                  <label>Account Created:</label>
                  <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}</span>
                </div>
              </div>
              
              <div className="profile-section">
                <h2 className="section-title">Account Settings</h2>
                <p className="coming-soon">Account settings will be available soon.</p>
                <button className="btn-disabled" disabled>Edit Profile</button>
              </div>
              
              <div className="profile-section">
                <h2 className="section-title">Preferences</h2>
                <p className="coming-soon">User preferences will be available in a future update.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .profile-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #ff416c, #8a2387);
          font-family: 'Arial', sans-serif;
          padding-bottom: 40px;
        }
        
        .profile-content {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .profile-card {
          background-color: rgba(255, 255, 255, 0.9);
          border-radius: 10px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
          padding: 30px;
          margin-top: 20px;
        }
        
        .profile-title {
          color: #8a2387;
          font-size: 28px;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .construction-banner {
          background-color: #ffeeba;
          border: 2px dashed #856404;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 30px;
          text-align: center;
          color: #856404;
        }
        
        .construction-icon {
          font-size: 40px;
          display: block;
          margin-bottom: 10px;
        }
        
        .construction-banner h2 {
          margin-bottom: 10px;
          font-size: 22px;
        }
        
        .construction-banner p {
          margin: 0;
          font-size: 16px;
        }
        
        .profile-section {
          margin-bottom: 30px;
          background-color: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .section-title {
          color: #8a2387;
          font-size: 20px;
          margin-bottom: 15px;
          position: relative;
          padding-bottom: 10px;
        }
        
        .section-title:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 40px;
          height: 3px;
          background: linear-gradient(to right, #ff416c, #8a2387);
          border-radius: 3px;
        }
        
        .info-item {
          display: flex;
          margin-bottom: 15px;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }
        
        .info-item:last-child {
          border-bottom: none;
        }
        
        .info-item label {
          font-weight: bold;
          width: 150px;
          color: #495057;
        }
        
        .info-item span {
          flex: 1;
          color: #212529;
        }
        
        .coming-soon {
          color: #6c757d;
          font-style: italic;
          margin-bottom: 15px;
        }
        
        .btn-disabled {
          background-color: #e9ecef;
          color: #6c757d;
          border: none;
          padding: 8px 16px;
          border-radius: 5px;
          cursor: not-allowed;
          font-size: 14px;
        }
        
        @media (max-width: 576px) {
          .info-item {
            flex-direction: column;
          }
          
          .info-item label {
            width: 100%;
            margin-bottom: 5px;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfilePage; 