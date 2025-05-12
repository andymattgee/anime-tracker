const Manga = require('../models/Manga');

// Create a new manga entry
exports.createManga = async (req, res) => {
    try {
        const {
            mal_id,
            title,
            title_english,
            totalChapters,
            totalVolumes,
            coverImage,
            synopsis,
            apiStatus,
            apiScore,
            source,
            genres,
            publishedFrom,
            publishedTo
            // Note: user-specific fields like userStatus, chaptersRead, userScore, userNotes
            // will be set to defaults here.
        } = req.body;

        if (!title || !mal_id) {
            return res.status(400).json({ success: false, message: 'Missing required manga data (title, mal_id).' });
        }

        const existingManga = await Manga.findOne({ mal_id });
        if (existingManga) {
            return res.status(409).json({ success: false, message: 'This manga is already in your inventory.' });
        }

        const newMangaData = {
            // User-specific fields (defaults)
            userStatus: req.body.userStatus || 'Plan to Read',
            chaptersRead: req.body.chaptersRead || 0,
            userScore: req.body.userScore || null,
            userNotes: req.body.userNotes || '',

            // Fields from Jikan API / frontend
            mal_id: mal_id,
            title: title,
            title_english: title_english || null,
            totalChapters: totalChapters || null,
            totalVolumes: totalVolumes || null,
            coverImage: coverImage || null,
            synopsis: synopsis || null,
            apiStatus: apiStatus || null,
            apiScore: apiScore || null,
            source: source || null,
            genres: genres || [],
            publishedFrom: publishedFrom ? new Date(publishedFrom) : null,
            publishedTo: publishedTo ? new Date(publishedTo) : null,
        };

        const manga = new Manga(newMangaData);
        await manga.save();

        res.status(201).json({ success: true, message: 'Manga added to inventory successfully!', data: manga });

    } catch (error) {
        console.error('Error creating manga:', error);
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'This manga is already in your inventory (duplicate ID).' });
        }
        res.status(500).json({ success: false, message: 'Failed to add manga to inventory.', error: error.message });
    }
};

// Get all manga entries
exports.getAllManga = async (req, res) => {
    try {
        const manga = await Manga.find().sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: manga.length,
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

// Get a single manga by ID
exports.getMangaById = async (req, res) => {
    try {
        const manga = await Manga.findById(req.params.id);
        
        if (!manga) {
            return res.status(404).json({
                success: false,
                message: 'Manga not found'
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
exports.updateManga = async (req, res) => {
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

        const manga = await Manga.findByIdAndUpdate(
            req.params.id,
            updateFields, // Use the filtered updateFields object
            { new: true, runValidators: true }
        );
        
        if (!manga) {
            return res.status(404).json({
                success: false,
                message: 'Manga not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Manga updated successfully',
            data: manga
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
exports.deleteBulkManga = async (req, res) => {
    try {
        const { ids } = req.body; // Expect an array of IDs

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: 'No manga IDs provided for deletion.' });
        }

        const result = await Manga.deleteMany({ _id: { $in: ids } });

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
exports.deleteManga = async (req, res) => {
    try {
        const manga = await Manga.findByIdAndDelete(req.params.id);
        
        if (!manga) {
            return res.status(404).json({
                success: false,
                message: 'Manga not found'
            });
        }
        
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
