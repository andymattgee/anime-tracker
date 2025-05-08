// server/routes/animeSearchRoutes.js
const express = require('express');
const router = express.Router();
const animeSearchController = require('../controllers/animeSearchController');

// Define the POST route for adding anime from search
// The path '/add' is relative to the base path defined in server.js for these routes
router.post('/add', animeSearchController.addAnimeFromSearch);

// You might add other search-related routes here later if needed

module.exports = router;