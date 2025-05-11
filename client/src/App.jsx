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

// Main App component that serves as the root of our React component tree
const App = () => {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/my-anime" element={<AnimeInventoryPage />} />
          <Route path="/my-manga" element={<MangaInventoryPage />} />
          <Route path="/explore" element={<ExplorePage />} /> {/* Add route for Explore page */}
        </Routes>
      </div>
    </Router>
  );
};

// Export the App component so it can be imported in index.jsx
export default App;