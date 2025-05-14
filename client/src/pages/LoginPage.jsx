import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [initialMount, setInitialMount] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Only perform logout on the initial mount
    if (initialMount) {
      logout();
      setInitialMount(false);
    }
    
    // Display message from signup if exists
    if (location.state?.message) {
      // Display this message to the user
      setError(location.state.message);
      // Clear the message from location state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [initialMount, logout, location, navigate]);

  // Handle redirection after successful login
  useEffect(() => {
    if (isAuthenticated && !loading && !initialMount) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, initialMount, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await login({
      email: formData.email,
      password: formData.password,
    });
    
    if (result.success) {
      // The useEffect above will handle navigation once isAuthenticated is true
    } else {
      setError(result.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Login</h1>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Logging In...' : 'Login'}
          </button>
        </form>
        <div className="login-options">
          <p>
            Don't have an account? <Link to="/signup" className="signup-link">Sign up here</Link>
          </p>
        </div>
      </div>
      <style jsx>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 20px;
          background: linear-gradient(135deg, #ff416c, #8a2387);
          font-family: 'Arial', sans-serif;
        }
        
        .login-card {
          background-color: rgba(255, 255, 255, 0.9);
          border-radius: 10px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
          padding: 40px;
          width: 100%;
          max-width: 400px;
        }
        
        .login-title {
          color: #8a2387;
          font-size: 28px;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .error-message {
          background-color: rgba(255, 0, 0, 0.1);
          color: #d32f2f;
          padding: 10px;
          border-radius: 5px;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        label {
          display: block;
          margin-bottom: 8px;
          color: #333;
          font-weight: bold;
        }
        
        input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 16px;
          transition: border-color 0.3s;
        }
        
        input:focus {
          border-color: #8a2387;
          outline: none;
          box-shadow: 0 0 0 2px rgba(138, 35, 135, 0.2);
        }
        
        .btn-login {
          width: 100%;
          padding: 12px;
          background: linear-gradient(to right, #ff416c, #8a2387);
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: transform 0.2s, opacity 0.2s;
        }
        
        .btn-login:hover {
          transform: translateY(-2px);
        }
        
        .btn-login:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .login-options {
          margin-top: 25px;
          text-align: center;
        }
        
        .signup-link {
          color: #8a2387;
          text-decoration: none;
          font-weight: bold;
        }
        
        .signup-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default LoginPage; 