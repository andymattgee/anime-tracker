// server/controllers/animeSearchController.js
const Anime = require('../models/Anime'); // Import the Anime model

// Controller function to add anime from search results
exports.addAnimeFromSearch = async (req, res) => {
  try {
    // Extract all relevant data sent from the frontend
    const {
      mal_id,
      title,
      totalEpisodes,
      coverImage,
      synopsis,
      apiStatus, // New field for airing status
      apiScore,  // New field for community score
      trailerUrl,// New field for trailer
      source,    // New field for source material
      genres,    // New field for genres
      airedFrom, // New field for aired from date
      airedTo    // New field for aired to date
    } = req.body;

    // Basic validation
    if (!title || !mal_id) {
      return res.status(400).json({ success: false, message: 'Missing required anime data (title, mal_id).' });
    }

    // Check if anime with this mal_id already exists for the user (if user association is implemented later)
    // For now, we'll just add it, duplicates might occur without user context.

    // Check if anime with this mal_id already exists (prevents duplicates)
    const existingAnime = await Anime.findOne({ mal_id: mal_id /*, user: req.user.id */ }); // Add user check later if needed
    if (existingAnime) {
      return res.status(409).json({ success: false, message: 'This anime is already in your inventory.' });
    }

    const newAnimeData = {
      // User-specific fields (defaults)
      userStatus: 'Plan to Watch', // Default user status
      episodesWatched: 0,
      userScore: null, // Default user score to null or 0
      userNotes: '',

      // Fields from Jikan API
      mal_id: mal_id,
      title: title,
      totalEpisodes: totalEpisodes || null,
      coverImage: coverImage || null,
      synopsis: synopsis || null,
      apiStatus: apiStatus || null,
      apiScore: apiScore || null,
      trailerUrl: trailerUrl || null,
      source: source || null,
      genres: genres || [],
      airedFrom: airedFrom ? new Date(airedFrom) : null, // Convert string date to Date object
      airedTo: airedTo ? new Date(airedTo) : null,       // Convert string date to Date object
      // user: req.user.id // TODO: Add user association if authentication is implemented
    };

    const anime = new Anime(newAnimeData);
    await anime.save();

    res.status(201).json({ success: true, message: 'Anime added to inventory successfully!', data: anime });

  } catch (error) {
    console.error('Error adding anime from search:', error);
    // Handle potential duplicate key errors (like mal_id if unique constraint is added)
    if (error.code === 11000) { // MongoDB duplicate key error code
       return res.status(409).json({ success: false, message: 'This anime is already in your inventory (duplicate ID).' });
    }
    res.status(500).json({ success: false, message: 'Failed to add anime to inventory.', error: error.message });
  }
};