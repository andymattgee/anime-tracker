import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MangaForm from '../components/MangaForm';
import './AddAnimePage.css'; // Reuse the same CSS

const AddMangaPage = () => {
    const navigate = useNavigate();

    return (
        <div className="add-anime-page">
            <Navbar />
            <div className="add-anime-container">
                <div className="page-header">
                    <h1>Add New Manga</h1>
                    <button 
                        className="btn btn-secondary"
                        onClick={() => navigate('/inventory')}
                    >
                        Back to Inventory
                    </button>
                </div>
                <MangaForm />
            </div>
        </div>
    );
};

export default AddMangaPage; 