const express = require('express');
const router = express.Router();
const mangaController = require('../controllers/mangaController');
const { protect } = require('../middleware/authMiddleware');

// Create a manga
router.post('/create', protect, mangaController.createManga);

// Get all manga
router.get('/', protect, mangaController.getAllManga);

// Get a single manga
router.get('/:id', protect, mangaController.getMangaById);

// Update a manga
router.put('/:id', protect, mangaController.updateManga);

// Delete multiple manga entries
router.delete('/bulk-delete', protect, mangaController.deleteBulkManga);

// Delete a manga
router.delete('/:id', protect, mangaController.deleteManga);

module.exports = router;
