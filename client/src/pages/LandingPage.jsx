import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <h1>Welcome to Anime & Manga Tracker</h1>
      <div className="landing-content">
        <p>Your ultimate companion for tracking and managing your anime and manga collection.</p>
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
          <Link to="/login" className="btn btn-primary">Login</Link>
          <Link to="/signup" className="btn btn-secondary">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 