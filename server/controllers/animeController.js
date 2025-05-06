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

module.exports = {
    createAnime
};
