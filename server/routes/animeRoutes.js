const express = require('express');
const Anime = require('../models/Anime');
const { createAnime, getAllAnime, deleteAnime, updateAnime, deleteBulkAnime } = require('../controllers/animeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Route to create a new anime entry
router.post('/create', protect, createAnime);

// Route to get all anime entries
router.get('/', protect, getAllAnime);

// Route to update an anime entry
router.put('/:id', protect, updateAnime);

// Route to delete multiple anime entries
router.delete('/bulk-delete', protect, deleteBulkAnime);

// Route to delete an anime entry
router.delete('/:id', protect, deleteAnime);

module.exports = router;