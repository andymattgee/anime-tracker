const Manga = require('../models/Manga');
const User = require('../models/User'); // Import User model

// Create new manga entry
const createManga = async (req, res) => {
    try {
        // Use authenticated user ID from middleware
        const userId = req.user.id;
        
        const { mal_id, title, title_english, totalChapters, totalVolumes, coverImage, synopsis, apiStatus, apiScore, source, genres, publishedFrom, publishedTo } = req.body;

        if (!title || !mal_id) {
            return res.status(400).json({ success: false, message: 'Missing required manga data (title, mal_id).' });
        }

        // First, check if the user already has this manga in their list
        const existingMangaForUser = await Manga.findOne({ 
            mal_id: mal_id, 
            user: userId 
        });
        
        if (existingMangaForUser) {
            return res.status(409).json({ success: false, message: 'This manga is already in your inventory.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Check if this manga exists in the database for any user
        let manga = await Manga.findOne({ mal_id: mal_id });
        
        if (manga) {
            // If manga exists, create a new entry with the same data but for this user
            const newMangaData = {
                ...manga.toObject(),
                _id: undefined,  // Don't copy the _id
                user: userId,    // Set the new user
                userStatus: req.body.userStatus || 'Plan to Read',
                chaptersRead: req.body.chaptersRead || 0,
                userScore: req.body.userScore || null,
                userNotes: req.body.userNotes || '',
                createdAt: Date.now()
            };
            
            const newManga = new Manga(newMangaData);
            manga = await newManga.save();
        } else {
            // If manga doesn't exist, create a new one
            const newMangaData = {
                user: userId, // Associate with the user
                // User-specific fields (defaults)
                userStatus: req.body.userStatus || 'Plan to Read',
                chaptersRead: req.body.chaptersRead || 0,
                userScore: req.body.userScore || null,
                userNotes: req.body.userNotes || '',

                // Fields from Jikan API / frontend
                mangaId: mal_id, // Map mal_id to mangaId expected by schema
                mal_id: mal_id,  // Keep original for reference
                title: title,
                title_english: title_english || null,
                totalChapters: totalChapters || null,
                totalVolumes: totalVolumes || null,
                coverImage: coverImage || null,
                image: coverImage || null, // Map coverImage to image expected by schema
                synopsis: synopsis || null,
                apiStatus: apiStatus || null,
                apiScore: apiScore || null,
                source: source || null,
                genres: genres || [],
                publishedFrom: publishedFrom ? new Date(publishedFrom) : null,
                publishedTo: publishedTo ? new Date(publishedTo) : null,
            };

            const newManga = new Manga(newMangaData);
            manga = await newManga.save();
        }

        // Add manga to user's list
        user.mangaList.push(manga._id);
        await user.save();

        res.status(201).json({ success: true, message: 'Manga added to inventory successfully!', data: manga });

    } catch (error) {
        console.error('Error creating manga:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(' ') });
        }
        res.status(500).json({ success: false, message: 'Failed to add manga to inventory.', error: error.message });
    }
};

// Get all manga entries for the current user
const getAllManga = async (req, res) => {
    try {
        // Check if user ID is provided (from authenticated middleware)
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
        }

        // First, get the user's list of manga IDs
        const user = await User.findById(req.user.id).populate('mangaList');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            count: user.mangaList.length,
            data: user.mangaList
        });
    } catch (error) {
        console.error('Error fetching manga:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch manga',
            error: error.message
        });
    }
};

// Get a single manga by ID
const getMangaById = async (req, res) => {
    try {
        const manga = await Manga.findById(req.params.id);
        
        if (!manga) {
            return res.status(404).json({
                success: false,
                message: 'Manga not found'
            });
        }
        
        // Verify manga belongs to the current user
        if (manga.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this manga'
            });
        }
        
        res.status(200).json({
            success: true,
            data: manga
        });
    } catch (error) {
        console.error('Error fetching manga:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch manga',
            error: error.message
        });
    }
};

// Update a manga
const updateManga = async (req, res) => {
    try {
        const { chaptersRead, userStatus, userScore, userNotes } = req.body;

        // Construct an object with only the allowed fields to update
        const updateFields = {};
        if (chaptersRead !== undefined) updateFields.chaptersRead = chaptersRead;
        if (userStatus !== undefined) updateFields.userStatus = userStatus;
        if (userScore !== undefined) updateFields.userScore = userScore; // Allow null for score
        if (userNotes !== undefined) updateFields.userNotes = userNotes;

        // Check if there's anything to update
        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields provided for update.'
            });
        }

        // First, find the manga to check ownership
        const manga = await Manga.findById(req.params.id);
        
        if (!manga) {
            return res.status(404).json({
                success: false,
                message: 'Manga not found'
            });
        }
        
        // Verify manga belongs to the current user
        if (manga.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this manga'
            });
        }

        // Now update the manga
        const updatedManga = await Manga.findByIdAndUpdate(
            req.params.id,
            updateFields,
            { new: true, runValidators: true }
        );
        
        res.status(200).json({
            success: true,
            message: 'Manga updated successfully',
            data: updatedManga
        });
    } catch (error) {
        console.error('Error updating manga:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update manga',
            error: error.message
        });
    }
};

// Delete multiple manga entries
const deleteBulkManga = async (req, res) => {
    try {
        const { ids } = req.body; // Expect an array of IDs

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: 'No manga IDs provided for deletion.' });
        }

        // Find the user and remove the manga IDs from their list
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Remove the manga IDs from the user's mangaList
        user.mangaList = user.mangaList.filter(mangaId => !ids.includes(mangaId.toString()));
        await user.save();

        // Delete manga entries that belong to this user
        const result = await Manga.deleteMany({ 
            _id: { $in: ids },
            user: req.user.id // Only delete manga that belongs to this user
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: 'No matching manga entries found for deletion.' });
        }

        res.status(200).json({
            success: true,
            message: `${result.deletedCount} manga entries successfully deleted.`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Error bulk deleting manga:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to bulk delete manga entries.',
            error: error.message
        });
    }
};

// Delete a manga
const deleteManga = async (req, res) => {
    try {
        // First, find the manga to check ownership
        const manga = await Manga.findById(req.params.id);
        
        if (!manga) {
            return res.status(404).json({
                success: false,
                message: 'Manga not found'
            });
        }
        
        // Verify manga belongs to the current user
        if (manga.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this manga'
            });
        }

        // Find the user and remove the manga from their list
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Remove the manga ID from the user's mangaList
        user.mangaList = user.mangaList.filter(mangaId => mangaId.toString() !== req.params.id);
        await user.save();
        
        // Delete the manga
        await Manga.findByIdAndDelete(req.params.id);
        
        res.status(200).json({
            success: true,
            message: 'Manga deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting manga:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete manga',
            error: error.message
        });
    }
};

// Export controllers
module.exports = {
    createManga,
    getAllManga,
    getMangaById,
    updateManga,
    deleteBulkManga,
    deleteManga
};
