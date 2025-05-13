const express = require('express');
const router = express.Router();
const { signupUser, loginUser, getMe } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { addToAnimeList, removeFromAnimeList, addToMangaList, removeFromMangaList } = require('../controllers/listController');

// @route   POST api/users/signup
// @desc    Register user
// @access  Public
router.post('/signup', signupUser);

// @route   POST api/users/login
// @desc    Authenticate user & get token (or just login)
// @access  Public
router.post('/login', loginUser);

// @route   GET api/users/me
// @desc    Get user profile
// @access  Private
router.get('/me', protect, getMe);

// @route   POST api/users/anime
// @desc    Add anime to user's list
// @access  Private
router.post('/anime', protect, addToAnimeList);

// @route   DELETE api/users/anime/:id
// @desc    Remove anime from user's list
// @access  Private
router.delete('/anime/:id', protect, removeFromAnimeList);

// @route   POST api/users/manga
// @desc    Add manga to user's list
// @access  Private
router.post('/manga', protect, addToMangaList);

// @route   DELETE api/users/manga/:id
// @desc    Remove manga from user's list
// @access  Private
router.delete('/manga/:id', protect, removeFromMangaList);

module.exports = router;