const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const animeRoutes = require('./routes/animeRoutes');
const mangaRoutes = require('./routes/mangaRoutes');
const animeSearchRoutes = require('./routes/animeSearchRoutes'); // Import search routes

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/anime', animeRoutes);
app.use('/api/manga', mangaRoutes);
app.use('/api/search', animeSearchRoutes); // Use search routes

// Test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// MongoDB connection
//replace uri with unique URI from database or env variable
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));