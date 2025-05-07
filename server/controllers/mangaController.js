const Manga = require('../models/Manga');

// Create a new manga entry
exports.createManga = async (req, res) => {
    try {
        const { 
            title, 
            chaptersRead, 
            totalChapters, 
            status, 
            score, 
            notes,
            coverImage,
            synopsis
        } = req.body;

        // Create new manga
        const manga = new Manga({
            title,
            chaptersRead,
            totalChapters,
            status,
            score,
            notes,
            coverImage,
            synopsis
        });

        // Save to database
        await manga.save();

        res.status(201).json({
            success: true,
            message: 'Manga added successfully!',
            data: manga
        });
    } catch (error) {
        console.error('Error creating manga:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add manga',
            error: error.message
        });
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
        const manga = await Manga.findByIdAndUpdate(
            req.params.id,
            req.body,
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
