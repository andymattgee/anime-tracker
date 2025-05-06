const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const animeRoutes = require('./routes/animeRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Test route for anime sample
app.use('/api/anime', animeRoutes);

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