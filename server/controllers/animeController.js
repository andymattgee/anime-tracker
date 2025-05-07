const Anime = require('../models/Anime');

// Create new anime entry
const createAnime = async (req, res) => {
    try {
        const animeData = req.body;
        const anime = new Anime(animeData);
        const savedAnime = await anime.save();
        res.status(201).json({ 
            success: true, 
            message: 'Anime successfully added!',
            data: savedAnime 
        });
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            message: 'Failed to add anime',
            error: error.message 
        });
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
        const updateData = req.body;

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
