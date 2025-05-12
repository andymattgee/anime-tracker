import React, { useState, useEffect } from 'react';

const DetailsModal = ({ isOpen, onClose, item, onSave, onDelete, mediaType }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (item) {
      const initialUserScore = item.userScore !== null && item.userScore !== undefined 
        ? item.userScore 
        : (item.rating !== null && item.rating !== undefined ? item.rating : '');

      setEditForm({
        episodesWatched: item.episodesWatched || '',
        chaptersRead: item.chaptersRead || '',
        userStatus: item.userStatus || item.status || '',
        userScore: initialUserScore,
        userNotes: item.userNotes || item.notes || ''
      });
      if (!isOpen) {
        setIsEditing(false); 
      }
    } else {
        setIsEditing(false); 
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault(); 
    const saveData = {
      userStatus: editForm.userStatus,
      userScore: editForm.userScore === '' ? null : Number(editForm.userScore),
      userNotes: editForm.userNotes,
    };
    if (mediaType === 'anime') {
      saveData.episodesWatched = Number(editForm.episodesWatched);
    } else {
      saveData.chaptersRead = Number(editForm.chaptersRead);
    }
    onSave(item.id, saveData);
    setIsEditing(false); 
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (item) {
        const originalUserScore = item.userScore !== null && item.userScore !== undefined 
        ? item.userScore 
        : (item.rating !== null && item.rating !== undefined ? item.rating : '');
      setEditForm({
        episodesWatched: item.episodesWatched || '',
        chaptersRead: item.chaptersRead || '',
        userStatus: item.userStatus || item.status || '',
        userScore: originalUserScore,
        userNotes: item.userNotes || item.notes || ''
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const progressKey = mediaType === 'anime' ? 'episodesWatched' : 'chaptersRead';
  const progressLabel = mediaType === 'anime' ? 'Episodes Watched' : 'Chapters Read';
  const statusLabelApi = mediaType === 'anime' ? 'Airing Status' : 'Publishing Status';
  const airedLabel = mediaType === 'anime' ? 'Aired' : 'Published';
  
  const statusOptions = mediaType === 'anime' 
    ? ["Watching", "Completed", "Plan to Watch", "Dropped"]
    : ["Reading", "Completed", "Plan to Read", "Dropped"];

  const displayUserStatus = item.userStatus || item.status;
  const displayUserScore = item.userScore !== null && item.userScore !== undefined ? item.userScore : item.rating;
  const displayUserNotes = item.userNotes || item.notes;

  const linkStyle = {
    cursor: 'pointer',
    color: 'blue',
    textDecoration: 'underline',
    marginLeft: '10px',
    fontSize: '0.9em'
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content details-modal" onClick={(e) => e.stopPropagation()}>
        <h2>
          {item.title_english || item.title}
          {item.title_english && item.title && item.title_english !== item.title && (
            <span style={{ display: 'block', fontSize: '0.8em', fontWeight: 'normal', marginTop: '0.2em' }}>
              ({item.title})
            </span>
          )}
           - Details
        </h2>
        
        <div className="details-content">
          {item.coverImage && <img
            src={item.coverImage}
            alt={
              item.title_english
                ? (item.title && item.title_english !== item.title ? `${item.title_english} (${item.title}) cover` : `${item.title_english} cover`)
                : `${item.title} cover`
            }
            className="details-modal-image"
          />}
          <div className="details-text">
            <p><strong>Synopsis:</strong> {item.synopsis || 'N/A'}</p>
            <hr />
            <h4>Your Tracking: 
              {!isEditing &&
                <span
                  style={linkStyle}
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </span>
              }
            </h4>
            {isEditing ? (
              <div> {/* Changed form to div to avoid nested forms if handleSave is called directly */}
                <div className="form-group">
                  <label>Status:</label>
                  <select name="userStatus" value={editForm.userStatus} onChange={handleInputChange} required>
                    {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>{progressLabel}:</label>
                  <input type="number" name={progressKey} value={editForm[progressKey]} onChange={handleInputChange} required min="0" />
                </div>
                <div className="form-group">
                  <label>Your Score (0-10):</label>
                  <input type="number" name="userScore" value={editForm.userScore} onChange={handleInputChange} min="0" max="10" step="0.1" />
                </div>
                <div className="form-group">
                  <label>Notes:</label>
                  <textarea name="userNotes" value={editForm.userNotes} onChange={handleInputChange} />
                </div>
                <div style={{ marginTop: '10px' }}>
                  <span style={linkStyle} onClick={handleSave}>
                    Save Changes
                  </span>
                  <span style={{...linkStyle, marginLeft: '15px', color: 'gray' }} onClick={handleCancelEdit}>
                    Cancel
                  </span>
                </div>
              </div>
            ) : (
              <>
                <p><strong>Status:</strong> {displayUserStatus}</p>
                <p><strong>Progress:</strong> {item.progress}</p>
                <p><strong>Your Score:</strong> {displayUserScore !== null && displayUserScore !== undefined ? `${displayUserScore}/10` : 'N/A'}</p>
                <p><strong>Notes:</strong> {displayUserNotes || 'None'}</p>
              </>
            )}
            <hr />
            <h4>General Information:</h4>
            <p><strong>MAL ID:</strong> {item.mal_id || 'N/A'}</p>
            <p><strong>{statusLabelApi}:</strong> {item.apiStatus || 'N/A'}</p>
            <p><strong>Community Score:</strong> {item.apiScore || 'N/A'}</p>
            <p><strong>Source:</strong> {item.source || 'N/A'}</p>
            <p><strong>Genres:</strong> {item.genres?.join(', ') || 'N/A'}</p>
            <p><strong>{airedLabel}:</strong> {formatDate(item.airedFrom)} to {formatDate(item.airedTo)}</p>
            {mediaType === 'anime' && item.trailerUrl && <p><strong>Trailer:</strong> <a href={item.trailerUrl} target="_blank" rel="noopener noreferrer">Watch Here</a></p>}
          </div>
        </div>
        
        <div className="modal-actions">
          {!isEditing && onDelete &&
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                onClose(); 
                onDelete(item.id);
              }}
            >
              Delete
            </button>
          }
          {!isEditing &&
            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
          }
          {/* Save/Cancel for editing are now inline */}
        </div>
      </div>
    </div>
  );
};

export default DetailsModal;