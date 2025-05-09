// Import core React library
import React from 'react';
// Import ReactDOM for rendering React components in the browser
import ReactDOM from 'react-dom/client';
// Import our main App component
import App from './App';
// Import global styles
import './styles/main.css';

// Create a root container for our React app using the 'root' div from index.html
const root = ReactDOM.createRoot(document.getElementById('root'));
// Render our App component into the root container
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);