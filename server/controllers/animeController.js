const Anime = require('../models/Anime');

// Create new anime entry
const createAnime = async (req, res) => {
    try {
        const {
            mal_id,
            title,
            title_english,
            totalEpisodes,
            coverImage,
            synopsis,
            apiStatus,
            apiScore,
            trailerUrl,
            source,
            genres,
            airedFrom,
            airedTo
            // Note: user-specific fields like userStatus, episodesWatched, userScore, userNotes
            // will be set to defaults here, or could be optionally passed in req.body if adding
            // an already partially tracked item. For now, we assume adding a new, untracked item.
        } = req.body;

        if (!title || !mal_id) {
            return res.status(400).json({ success: false, message: 'Missing required anime data (title, mal_id).' });
        }

        const existingAnime = await Anime.findOne({ mal_id });
        if (existingAnime) {
            return res.status(409).json({ success: false, message: 'This anime is already in your inventory.' });
        }

        const newAnimeData = {
            // User-specific fields (defaults)
            userStatus: req.body.userStatus || 'Plan to Watch',
            episodesWatched: req.body.episodesWatched || 0,
            userScore: req.body.userScore || null,
            userNotes: req.body.userNotes || '',

            // Fields from Jikan API / frontend
            mal_id: mal_id,
            title: title,
            title_english: title_english || null,
            totalEpisodes: totalEpisodes || null,
            coverImage: coverImage || null,
            synopsis: synopsis || null,
            apiStatus: apiStatus || null,
            apiScore: apiScore || null,
            trailerUrl: trailerUrl || null,
            source: source || null,
            genres: genres || [],
            airedFrom: airedFrom ? new Date(airedFrom) : null,
            airedTo: airedTo ? new Date(airedTo) : null,
        };

        const anime = new Anime(newAnimeData);
        await anime.save();

        res.status(201).json({ success: true, message: 'Anime added to inventory successfully!', data: anime });

    } catch (error) {
        console.error('Error creating anime:', error);
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'This anime is already in your inventory (duplicate ID).' });
        }
        res.status(500).json({ success: false, message: 'Failed to add anime to inventory.', error: error.message });
    }
};

// Get all anime entries
const getAllAnime = async (req, res) => {
    try {
        const allAnime = await Anime.find();
        res.status(200).json({
            success: true,
            count: allAnime.length,
            data: allAnime
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
        const deletedAnime = await Anime.findByIdAndDelete(id);
        
        if (!deletedAnime) {
            return res.status(404).json({
                success: false,
                message: 'Anime entry not found'
            });
        }

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

module.exports = {
    createAnime,
    getAllAnime,
    deleteAnime,
    updateAnime
};
