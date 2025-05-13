const Anime = require('../models/Anime');
const User = require('../models/User'); // Import User model

// Create new anime entry
const createAnime = async (req, res) => {
    try {
        // Use authenticated user ID from middleware
        const userId = req.user.id;
        const { mal_id, title, title_english, totalEpisodes, coverImage, synopsis, apiStatus, apiScore, trailerUrl, source, genres, airedFrom, airedTo } = req.body;

        if (!title || !mal_id) {
            return res.status(400).json({ success: false, message: 'Missing required anime data (title, mal_id).' });
        }

        // First, check if the user already has this anime in their list
        const existingAnimeForUser = await Anime.findOne({ 
            mal_id: mal_id, 
            user: userId 
        });
        
        if (existingAnimeForUser) {
            return res.status(409).json({ success: false, message: 'This anime is already in your inventory.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Check if this anime exists in the database for any user
        let anime = await Anime.findOne({ mal_id: mal_id });
        
        if (anime) {
            // If anime exists, create a new entry with the same data but for this user
            const newAnimeData = {
                ...anime.toObject(),
                _id: undefined,  // Don't copy the _id
                user: userId,    // Set the new user
                userStatus: req.body.userStatus || 'Plan to Watch',
                episodesWatched: req.body.episodesWatched || 0,
                userScore: req.body.userScore || null,
                userNotes: req.body.userNotes || '',
                createdAt: Date.now()
            };
            
            const newAnime = new Anime(newAnimeData);
            anime = await newAnime.save();
        } else {
            // If anime doesn't exist, create a new one
            const newAnimeData = {
                user: userId, // Associate with the user
                // User-specific fields (defaults)
                userStatus: req.body.userStatus || 'Plan to Watch',
                episodesWatched: req.body.episodesWatched || 0,
                userScore: req.body.userScore || null,
                userNotes: req.body.userNotes || '',

                // Fields from Jikan API / frontend
                animeId: mal_id, // Map mal_id to animeId expected by schema
                mal_id: mal_id,  // Keep original for reference
                title: title,
                title_english: title_english || null,
                totalEpisodes: totalEpisodes || null,
                coverImage: coverImage || null,
                image: coverImage || null, // Map coverImage to image expected by schema
                synopsis: synopsis || null,
                apiStatus: apiStatus || null,
                apiScore: apiScore || null,
                trailerUrl: trailerUrl || null,
                source: source || null,
                genres: genres || [],
                airedFrom: airedFrom ? new Date(airedFrom) : null,
                airedTo: airedTo ? new Date(airedTo) : null,
            };

            const newAnime = new Anime(newAnimeData);
            anime = await newAnime.save();
        }

        // Add anime to user's list
        user.animeList.push(anime._id);
        await user.save();

        res.status(201).json({ success: true, message: 'Anime added to inventory successfully!', data: anime });

    } catch (error) {
        console.error('Error creating anime:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(' ') });
        }
        res.status(500).json({ success: false, message: 'Failed to add anime to inventory.', error: error.message });
    }
};

// Get all anime entries for the current user
const getAllAnime = async (req, res) => {
    try {
        // Check if user ID is provided (from authenticated middleware)
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
        }

        // First, get the user's list of anime IDs
        const user = await User.findById(req.user.id).populate('animeList');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            count: user.animeList.length,
            data: user.animeList
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch anime entries',
            error: error.message
        });
    }
};

// Delete anime entry
const deleteAnime = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if user ID is provided
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
        }
        
        // Find the anime
        const anime = await Anime.findById(id);
        
        if (!anime) {
            return res.status(404).json({
                success: false,
                message: 'Anime entry not found'
            });
        }
        
        // Find the user and remove the anime from their list
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Remove the anime ID from the user's animeList
        user.animeList = user.animeList.filter(animeId => animeId.toString() !== id);
        await user.save();
        
        // Delete the anime
        const deletedAnime = await Anime.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Anime entry successfully deleted',
            data: deletedAnime
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete anime entry',
            error: error.message
        });
    }
};

// Update anime entry
const updateAnime = async (req, res) => {
    try {
        const { id } = req.params;
        const { episodesWatched, userStatus, userScore, userNotes } = req.body;
        
        // Check if user ID is provided
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
        }
        
        // Only allow updating user-specific fields
        const updateData = {
            ...(episodesWatched !== undefined && { episodesWatched }),
            ...(userStatus !== undefined && { userStatus }),
            ...(userScore !== undefined && { userScore }),
            ...(userNotes !== undefined && { userNotes }),
        };

        const updatedAnime = await Anime.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedAnime) {
            return res.status(404).json({
                success: false,
                message: 'Anime entry not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Anime entry successfully updated',
            data: updatedAnime
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to update anime entry',
            error: error.message
        });
    }
};

// Delete multiple anime entries
const deleteBulkAnime = async (req, res) => {
    try {
        const { ids } = req.body; // Expect an array of IDs

        // Check if user ID is provided
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
        }

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: 'No anime IDs provided for deletion.' });
        }

        // Find the user and remove the anime IDs from their list
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Remove the anime IDs from the user's animeList
        user.animeList = user.animeList.filter(animeId => !ids.includes(animeId.toString()));
        await user.save();

        // Delete the anime entries
        const result = await Anime.deleteMany({ _id: { $in: ids } });

        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: 'No matching anime entries found for deletion.' });
        }

        res.status(200).json({
            success: true,
            message: `${result.deletedCount} anime entries successfully deleted.`,
            deletedCount: result.deletedCount
        });

    } catch (error) {
        console.error('Error bulk deleting anime:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to bulk delete anime entries.',
            error: error.message
        });
    }
};

module.exports = {
    createAnime,
    getAllAnime,
    deleteAnime,
    updateAnime,
    deleteBulkAnime
};
