// Import React library to use JSX
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import AnimeInventoryPage from './pages/AnimeInventoryPage';
import MangaInventoryPage from './pages/MangaInventoryPage';
import ExplorePage from './pages/ExplorePage'; // Import the new Explore page
import GenrePage from './pages/GenrePage'; // Import GenrePage
import ProfilePage from './pages/ProfilePage'; // Import the new Profile page
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Main App component that serves as the root of our React component tree
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/my-anime" 
              element={
                <PrivateRoute>
                  <AnimeInventoryPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/my-manga" 
              element={
                <PrivateRoute>
                  <MangaInventoryPage />
                </PrivateRoute>
              } 
            />
            <Route path="/explore" element={<ExplorePage />} /> {/* Add route for Explore page */}
            <Route path="/genre/:genreName/:genreId" element={<GenrePage />} /> {/* Add route for Genre page */}
            <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              } 
            /> {/* Add route for Profile page */}
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

// Export the App component so it can be imported in index.jsx
export default App;