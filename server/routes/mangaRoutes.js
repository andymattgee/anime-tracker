const express = require('express');
const router = express.Router();
const mangaController = require('../controllers/mangaController');

// Create a manga
router.post('/create', mangaController.createManga);

// Get all manga
router.get('/', mangaController.getAllManga);

// Get a single manga
router.get('/:id', mangaController.getMangaById);

// Update a manga
router.put('/:id', mangaController.updateManga);

// Delete multiple manga entries
router.delete('/bulk-delete', mangaController.deleteBulkManga);

// Delete a manga
router.delete('/:id', mangaController.deleteManga);

module.exports = router;
