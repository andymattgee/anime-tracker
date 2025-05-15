import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="landing-container">
      <div className="landing-card">
        <h1 className="landing-title">Welcome to Anime & Manga Tracker</h1>
        <div className="landing-content">
          <p className="landing-description">Your ultimate companion for tracking and managing your anime and manga collection.</p>
          <div className="features">
            <h2>Features:</h2>
            <ul>
              <li>Track your watched anime and read manga</li>
              <li>Create custom lists and categories</li>
              <li>Rate and review your favorite series</li>
              <li>Discover new recommendations</li>
            </ul>
          </div>
          <div className="cta-buttons">
            <Link to="/login" className="btn-primary">Login</Link>
            <Link to="/signup" className="btn-secondary">Sign Up</Link>
          </div>
        </div>
      </div>
      <style jsx>{`
        .landing-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 20px;
          background: linear-gradient(135deg, #ff416c, #8a2387);
          font-family: 'Arial', sans-serif;
        }
        
        .landing-card {
          background-color: rgba(255, 255, 255, 0.9);
          border-radius: 10px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
          padding: 40px;
          width: 100%;
          max-width: 800px;
        }
        
        .landing-title {
          color: #8a2387;
          font-size: 32px;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .landing-description {
          font-size: 18px;
          color: #333;
          text-align: center;
          margin-bottom: 30px;
        }
        
        .features {
          margin-bottom: 30px;
        }
        
        .features h2 {
          color: #8a2387;
          font-size: 24px;
          margin-bottom: 15px;
        }
        
        .features ul {
          list-style-type: none;
          padding: 0;
        }
        
        .features li {
          padding: 10px 0;
          position: relative;
          padding-left: 30px;
          color: #444;
        }
        
        .features li:before {
          content: "✓";
          color: #ff416c;
          font-weight: bold;
          position: absolute;
          left: 0;
        }
        
        .cta-buttons {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 30px;
        }
        
        .btn-primary, .btn-secondary {
          padding: 12px 30px;
          border-radius: 5px;
          font-size: 16px;
          font-weight: bold;
          text-decoration: none;
          transition: transform 0.2s, opacity 0.2s;
        }
        
        .btn-primary {
          background: linear-gradient(to right, #ff416c, #8a2387);
          color: white;
          border: none;
        }
        
        .btn-secondary {
          background: transparent;
          color: #8a2387;
          border: 2px solid #8a2387;
        }
        
        .btn-primary:hover, .btn-secondary:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default LandingPage; 