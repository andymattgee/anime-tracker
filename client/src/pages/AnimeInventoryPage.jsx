import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MediaCard from '../components/MediaCard'; // Import MediaCard
import DetailsModal from '../components/DetailsModal'; // Import DetailsModal
import './InventoryPage.css'; // We can reuse the same CSS for now

const AnimeInventoryPage = () => {
  const navigate = useNavigate();
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [editingAnime, setEditingAnime] = useState(null); // No longer needed
  const [viewingDetailsId, setViewingDetailsId] = useState(null);
  const [selectedAnimeIds, setSelectedAnimeIds] = useState(new Set());
  const [isSelectModeActive, setIsSelectModeActive] = useState(false);
  // const [editForm, setEditForm] = useState({ // Form state will be managed by DetailsModal or passed directly
  //   episodesWatched: '',
  //   userStatus: '',
  //   userScore: '',
  //   userNotes: ''
  // });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:5001/api/anime');
      if (!response.ok) {
        throw new Error(`Failed to fetch anime data: ${response.statusText}`);
      }
      const result = await response.json();

      if (result.success) {
        const formattedAnime = result.data.map(anime => ({
          id: anime._id,
          title: anime.title,
          title_english: anime.title_english,
          userStatus: anime.userStatus,
          progress: `Episode ${anime.episodesWatched}/${anime.totalEpisodes || '?'}`,
          userScore: anime.userScore,
          episodesWatched: anime.episodesWatched,
          totalEpisodes: anime.totalEpisodes,
          userNotes: anime.userNotes,
          coverImage: anime.coverImage,
          synopsis: anime.synopsis,
          apiStatus: anime.apiStatus,
          apiScore: anime.apiScore,
          trailerUrl: anime.trailerUrl,
          source: anime.source,
          genres: anime.genres,
          airedFrom: anime.airedFrom,
          airedTo: anime.airedTo,
          mal_id: anime.mal_id
        }));
        setAnimeList(formattedAnime);
      } else {
        throw new Error(result.message || 'Failed to fetch anime data');
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching anime data:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDeleteAnime = async (id) => {
    if (window.confirm('Are you sure you want to delete this anime entry?')) {
      try {
        const response = await fetch(`http://localhost:5001/api/anime/${id}`, {
          method: 'DELETE',
        });
        const result = await response.json();
        if (result.success) {
          setAnimeList(animeList.filter(anime => anime.id !== id));
        } else {
          throw new Error(result.message || 'Failed to delete anime');
        }
      } catch (err) {
        console.error('Error deleting anime:', err);
        setError(err.message);
      }
    }
  };

  const handleToggleSelectAnime = (animeId) => {
    setSelectedAnimeIds(prevSelectedIds => {
      const newSelectedIds = new Set(prevSelectedIds);
      if (newSelectedIds.has(animeId)) {
        newSelectedIds.delete(animeId);
      } else {
        newSelectedIds.add(animeId);
      }
      return newSelectedIds;
    });
  };

  const toggleSelectMode = () => {
    setIsSelectModeActive(prevMode => {
      if (prevMode) { // If turning off select mode
        setSelectedAnimeIds(new Set()); // Clear selections
      }
      return !prevMode;
    });
  };

  const handleBulkDeleteAnime = async () => {
    if (selectedAnimeIds.size === 0) {
      alert("No anime selected for deletion.");
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${selectedAnimeIds.size} selected anime entries?`)) {
      try {
        const idsToDelete = Array.from(selectedAnimeIds);
        const response = await fetch(`http://localhost:5001/api/anime/bulk-delete`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ids: idsToDelete }),
        });
        const result = await response.json();
        if (result.success) {
          setAnimeList(prevList => prevList.filter(anime => !idsToDelete.includes(anime.id)));
          setSelectedAnimeIds(new Set()); // Clear selection
          setIsSelectModeActive(false); // Exit select mode after deletion
          alert(`${result.deletedCount} anime entries deleted successfully.`);
        } else {
          throw new Error(result.message || 'Failed to bulk delete anime');
        }
      } catch (err) {
        console.error('Error bulk deleting anime:', err);
        setError(err.message);
      }
    }
  };

  // handleEditAnime is no longer needed here as DetailsModal handles its edit state.
  // The onEdit prop for DetailsModal can be removed if not used to trigger an external state change.
  // For now, DetailsModal has an internal "Edit" button.

  const handleSaveChanges = async (animeId, updatedData) => {
    try {
      const response = await fetch(`http://localhost:5001/api/anime/${animeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData), // Send data from DetailsModal's form
      });

      const result = await response.json();

      if (result.success) {
        const updatedAnime = result.data;
        setAnimeList(prevList => prevList.map(anime =>
          anime.id === updatedAnime._id
            ? { // Merge existing data with updated data
                ...anime, // Keep fields like coverImage, synopsis etc.
                userStatus: updatedAnime.userStatus,
                progress: `Episode ${updatedAnime.episodesWatched}/${updatedAnime.totalEpisodes || anime.totalEpisodes || '?'}`, // Ensure totalEpisodes is available
                userScore: updatedAnime.userScore,
                episodesWatched: updatedAnime.episodesWatched,
                userNotes: updatedAnime.userNotes,
                // Potentially update other fields if the backend returns them
                totalEpisodes: updatedAnime.totalEpisodes || anime.totalEpisodes, // Persist totalEpisodes
              }
            : anime
        ));
        // Optionally close the modal or DetailsModal handles its state
        // setViewingDetailsId(null); // If you want to close modal on save
      } else {
        throw new Error(result.message || 'Failed to update anime');
      }
    } catch (err) {
      console.error('Error updating anime:', err);
      setError(err.message); // Display error to user
    }
  };

  // renderEditAnimeModal and handleEditAnimeChange are no longer needed.

  const renderContent = () => {
    if (loading) {
      return <div className="loading">Loading...</div>;
    }

    if (error) {
      return <div className="error">Error: {error}</div>;
    }

    if (animeList.length === 0) {
      return (
        <div className="no-data">
          <p>No anime entries found.</p>
        </div>
      );
    }

    return (
      <>
        <div className="inventory-controls" style={{ marginBottom: '20px', textAlign: 'right' }}>
          <button onClick={toggleSelectMode} className={`btn ${isSelectModeActive ? 'btn-warning' : 'btn-primary'}`}>
            {isSelectModeActive ? 'Cancel Selection' : 'Select Items to Delete'}
          </button>
          {isSelectModeActive && selectedAnimeIds.size > 0 && (
            <button onClick={handleBulkDeleteAnime} className="btn btn-danger" style={{ marginLeft: '10px' }}>
              Delete Selected ({selectedAnimeIds.size})
            </button>
          )}
        </div>
        <div className="results-grid">
          {animeList.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              onClick={() => {
                if (isSelectModeActive) {
                  handleToggleSelectAnime(item.id);
                } else {
                  setViewingDetailsId(item.id);
                }
              }}
              isSelected={selectedAnimeIds.has(item.id)}
              onSelectToggle={isSelectModeActive ? handleToggleSelectAnime : undefined} // Pass toggle only in select mode
            />
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="inventory-page"> {/* Consider renaming class if specific styling is needed */}
      <Navbar />
      <div className="inventory-container">
        <h1>My Anime</h1>
        {renderContent()}
        <DetailsModal
          isOpen={!!viewingDetailsId}
          onClose={() => setViewingDetailsId(null)}
          item={animeList.find(a => a.id === viewingDetailsId)}
          // onEdit is handled internally by DetailsModal now by its own "Edit" button
          onSave={handleSaveChanges} // Pass the save handler
          onDelete={handleDeleteAnime}
          mediaType="anime"
        />
        {/* renderEditAnimeModal is removed */}
      </div>
    </div>
  );
};

export default AnimeInventoryPage;