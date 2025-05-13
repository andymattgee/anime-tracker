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

  const handleSkipLogin = () => {
    navigate('/dashboard');
  };

  return (
    <div className="login-page">
      <h1>Login</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Logging In...' : 'Login'}
        </button>
      </form>
      <div className="login-options">
        <p>
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </p>
        <button onClick={handleSkipLogin} className="btn btn-secondary">Skip Login</button>
      </div>
    </div>
  );
};

export default LoginPage; 