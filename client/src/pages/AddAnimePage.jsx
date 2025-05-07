import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AnimeForm from '../components/AnimeForm';
import './AddAnimePage.css';

const AddAnimePage = () => {
    const navigate = useNavigate();

    return (
        <div className="add-anime-page">
            <Navbar />
            <div className="add-anime-container">
                <div className="page-header">
                    <h1>Add New Anime</h1>
                    <button 
                        className="btn btn-secondary"
                        onClick={() => navigate('/inventory')}
                    >
                        Back to Inventory
                    </button>
                </div>
                <AnimeForm />
            </div>
        </div>
    );
};

export default AddAnimePage; 