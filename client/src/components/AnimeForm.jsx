import React, { useState } from 'react';
import axios from 'axios';
import './AnimeForm.css';

const AnimeForm = () => {
    const [formData, setFormData] = useState({
        title: '',
        episodesWatched: 0,
        totalEpisodes: 0,
        status: 'Watching',
        score: 0,
        notes: '',
        coverImage: '',
        synopsis: ''
    });

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5001/api/anime/create', formData);
            if (response.data.success) {
                setMessage(response.data.message);
                setError('');
                // Reset form
                setFormData({
                    title: '',
                    episodesWatched: 0,
                    totalEpisodes: 0,
                    status: 'Watching',
                    score: 0,
                    notes: '',
                    coverImage: '',
                    synopsis: ''
                });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred');
            setMessage('');
        }
    };

    return (
        <div className="anime-form-container">
            <h2>Add New Anime</h2>
            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit} className="anime-form">
                <div className="form-group">
                    <label htmlFor="title">Title*</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                        <label htmlFor="episodesWatched">Episodes Watched</label>
                        <input
                            type="number"
                            id="episodesWatched"
                            name="episodesWatched"
                            value={formData.episodesWatched}
                            onChange={handleChange}
                            min="0"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="totalEpisodes">Total Episodes</label>
                        <input
                            type="number"
                            id="totalEpisodes"
                            name="totalEpisodes"
                            value={formData.totalEpisodes}
                            onChange={handleChange}
                            min="0"
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                        <label htmlFor="status">Status</label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option value="Watching">Watching</option>
                            <option value="Completed">Completed</option>
                            <option value="Dropped">Dropped</option>
                            <option value="Plan to Watch">Plan to Watch</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="score">Score</label>
                        <input
                            type="number"
                            id="score"
                            name="score"
                            value={formData.score}
                            onChange={handleChange}
                            min="0"
                            max="10"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="coverImage">Cover Image URL</label>
                    <input
                        type="url"
                        id="coverImage"
                        name="coverImage"
                        value={formData.coverImage}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group-row">
                    <div className="form-group">
                        <label htmlFor="synopsis">Synopsis</label>
                        <textarea
                            id="synopsis"
                            name="synopsis"
                            value={formData.synopsis}
                            onChange={handleChange}
                            rows="3"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="notes">Notes</label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="3"
                        />
                    </div>
                </div>

                <button type="submit" className="submit-button">Add Anime</button>
            </form>
        </div>
    );
};

export default AnimeForm; 