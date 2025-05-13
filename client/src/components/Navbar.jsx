import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    // Call the logout function from AuthContext
    logout();
    // Close the menu
    setIsMenuOpen(false);
    // Navigate to the landing page
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard" className="brand-text">ShonenTracker</Link>
      </div>
      
      <div className="navbar-links">
        <Link to="/my-anime" className="nav-link">My Anime</Link>
        <Link to="/my-manga" className="nav-link">My Manga</Link>
        <Link to="/explore" className="nav-link">Explore</Link>
      </div>

      <div className="navbar-menu">
        <button 
          className="menu-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="menu-icon">☰</span>
        </button>
        
        {isMenuOpen && (
          <div className="dropdown-menu">
            <Link to="/profile" className="dropdown-item">Profile</Link>
            <button onClick={handleLogout} className="dropdown-item">Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 