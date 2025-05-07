import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AnimeForm.css'; // Reuse the same CSS file

const MangaForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        chaptersRead: 0,
        totalChapters: 0,
        status: 'Reading',
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
            const response = await axios.post('http://localhost:5001/api/manga/create', formData);
            if (response.data.success) {
                setMessage(response.data.message);
                setError('');
                // Reset form
                setFormData({
                    title: '',
                    chaptersRead: 0,
                    totalChapters: 0,
                    status: 'Reading',
                    score: 0,
                    notes: '',
                    coverImage: '',
                    synopsis: ''
                });
                
                // Navigate back to inventory page after a short delay
                setTimeout(() => {
                    navigate('/inventory');
                }, 1500);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred');
            setMessage('');
        }
    };

    return (
        <div className="anime-form-container">
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
                        <label htmlFor="chaptersRead">Chapters Read</label>
                        <input
                            type="number"
                            id="chaptersRead"
                            name="chaptersRead"
                            value={formData.chaptersRead}
                            onChange={handleChange}
                            min="0"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="totalChapters">Total Chapters</label>
                        <input
                            type="number"
                            id="totalChapters"
                            name="totalChapters"
                            value={formData.totalChapters}
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
                            <option value="Reading">Reading</option>
                            <option value="Completed">Completed</option>
                            <option value="Dropped">Dropped</option>
                            <option value="Plan to Read">Plan to Read</option>
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

                <div className="form-actions">
                    <button type="submit" className="submit-button">Add Manga</button>
                    <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => navigate('/inventory')}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MangaForm; 