const User = require('../models/User');
const Anime = require('../models/Anime');
const Manga = require('../models/Manga');

// @desc    Add anime to user's list
// @route   POST /api/users/anime
// @access  Private
const addToAnimeList = async (req, res) => {
  try {
    const { animeId, title, image, status } = req.body;

    // Check if anime already exists in DB
    let anime = await Anime.findOne({ animeId });

    // If not, create new anime entry
    if (!anime) {
      anime = new Anime({
        animeId,
        title,
        image,
      });
      await anime.save();
    }

    // Find user and check if anime is already in list
    const user = await User.findById(req.user.id);
    
    if (user.animeList.includes(anime._id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Anime already in your list' 
      });
    }

    // Add anime to user's list
    user.animeList.push(anime._id);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Anime added to your list',
      anime
    });
  } catch (error) {
    console.error('Add anime error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while adding anime to list' 
    });
  }
};

// @desc    Remove anime from user's list
// @route   DELETE /api/users/anime/:id
// @access  Private
const removeFromAnimeList = async (req, res) => {
  try {
    const animeId = req.params.id;
    
    // Find the anime in DB
    const anime = await Anime.findById(animeId);
    if (!anime) {
      return res.status(404).json({ 
        success: false, 
        message: 'Anime not found' 
      });
    }

    // Find user and remove anime from list
    const user = await User.findById(req.user.id);
    
    if (!user.animeList.includes(animeId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Anime not in your list' 
      });
    }

    // Filter out the anime from user's list
    user.animeList = user.animeList.filter(
      (id) => id.toString() !== animeId
    );
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Anime removed from your list'
    });
  } catch (error) {
    console.error('Remove anime error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while removing anime from list' 
    });
  }
};

// @desc    Add manga to user's list
// @route   POST /api/users/manga
// @access  Private
const addToMangaList = async (req, res) => {
  try {
    const { mangaId, title, image, status } = req.body;

    // Check if manga already exists in DB
    let manga = await Manga.findOne({ mangaId });

    // If not, create new manga entry
    if (!manga) {
      manga = new Manga({
        mangaId,
        title,
        image,
      });
      await manga.save();
    }

    // Find user and check if manga is already in list
    const user = await User.findById(req.user.id);
    
    if (user.mangaList.includes(manga._id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Manga already in your list' 
      });
    }

    // Add manga to user's list
    user.mangaList.push(manga._id);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Manga added to your list',
      manga
    });
  } catch (error) {
    console.error('Add manga error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while adding manga to list' 
    });
  }
};

// @desc    Remove manga from user's list
// @route   DELETE /api/users/manga/:id
// @access  Private
const removeFromMangaList = async (req, res) => {
  try {
    const mangaId = req.params.id;
    
    // Find the manga in DB
    const manga = await Manga.findById(mangaId);
    if (!manga) {
      return res.status(404).json({ 
        success: false, 
        message: 'Manga not found' 
      });
    }

    // Find user and remove manga from list
    const user = await User.findById(req.user.id);
    
    if (!user.mangaList.includes(mangaId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Manga not in your list' 
      });
    }

    // Filter out the manga from user's list
    user.mangaList = user.mangaList.filter(
      (id) => id.toString() !== mangaId
    );
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Manga removed from your list'
    });
  } catch (error) {
    console.error('Remove manga error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while removing manga from list' 
    });
  }
};

module.exports = {
  addToAnimeList,
  removeFromAnimeList,
  addToMangaList,
  removeFromMangaList
}; 