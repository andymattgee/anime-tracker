import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserInfo = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="user-info">
      {user ? (
        <div>
          <p style={{ fontSize: '2em', fontWeight: 'bold', textAlign: 'center' }}>Welcome, {user.username}!</p>
          {/* Logout button removed */}
        </div>
      ) : (
        <p style={{ fontSize: '2em', fontWeight: 'bold', textAlign: 'center' }}>Not logged in</p>
      )}
    </div>
  );
};

export default UserInfo; 