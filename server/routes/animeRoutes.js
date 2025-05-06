const express = require('express');
const Anime = require('../models/Anime');
const { createAnime } = require('../controllers/animeController');

const router = express.Router();

// Route to create a new anime entry
router.post('/create', createAnime);

// Test route to add a sample anime
router.get('/test-add', async (req, res) => {
  try {
    const sampleAnime = new Anime({
      title: 'Fullmetal Alchemist: Brotherhood',
      episodesWatched: 64,
      totalEpisodes: 64,
      status: 'Completed',
      score: 10,
      notes: 'One of the best anime ever.',
      coverImage: 'https://example.com/image.jpg',
      synopsis: 'Two brothers search for the Philosopher\'s Stone.'
    });

    const savedAnime = await sampleAnime.save();
    res.json(savedAnime);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add sample anime' });
  }
});

module.exports = router;