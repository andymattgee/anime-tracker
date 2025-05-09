const express = require('express');
const Anime = require('../models/Anime');
const { createAnime, getAllAnime, deleteAnime, updateAnime } = require('../controllers/animeController');

const router = express.Router();

// Route to create a new anime entry
router.post('/create', createAnime);

// Route to get all anime entries
router.get('/', getAllAnime);

// Route to update an anime entry
router.put('/:id', updateAnime);

// Route to delete an anime entry
router.delete('/:id', deleteAnime);

module.exports = router;