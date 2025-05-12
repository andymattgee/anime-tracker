import React from 'react';

const DetailsModal = ({ isOpen, onClose, item, onEdit, onDelete, mediaType }) => {
  if (!isOpen || !item) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const progressLabel = mediaType === 'anime' ? 'Episodes Watched' : 'Chapters Read';
  const statusLabel = mediaType === 'anime' ? 'Airing Status' : 'Publishing Status';
  const airedLabel = mediaType === 'anime' ? 'Aired' : 'Published';

  // Use item.userStatus for anime, item.status for manga (which is an alias for userStatus in MangaInventoryPage)
  const itemUserStatus = mediaType === 'anime' ? item.userStatus : item.status;
  // Use item.userScore for anime, item.rating for manga (which is an alias for userScore)
  const itemUserScore = mediaType === 'anime' ? item.userScore : item.rating;
  // Use item.userNotes for anime, item.notes for manga (alias for userNotes)
  const itemUserNotes = mediaType === 'anime' ? item.userNotes : item.notes;


  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content details-modal" onClick={(e) => e.stopPropagation()}>
        <h2>{item.title} - Details</h2>
        <div className="details-content">
          {item.coverImage && <img src={item.coverImage} alt={`${item.title} cover`} className="details-modal-image" />}
          <div className="details-text">
            <p><strong>Synopsis:</strong> {item.synopsis || 'N/A'}</p>
            <hr />
            <h4>Your Tracking: 
              {onEdit && 
                <span
                  style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline', marginLeft: '10px' }}
                  onClick={() => onEdit(item)}
                >
                  Edit
                </span>
              }
            </h4>
            <p><strong>Status:</strong> {itemUserStatus}</p>
            <p><strong>Progress:</strong> {item.progress}</p>
            <p><strong>Your Score:</strong> {itemUserScore !== null && itemUserScore !== undefined ? `${itemUserScore}/10` : 'N/A'}</p>
            <p><strong>Notes:</strong> {itemUserNotes || 'None'}</p>
            <hr />
            <h4>General Information:</h4>
            <p><strong>MAL ID:</strong> {item.mal_id || 'N/A'}</p>
            <p><strong>{statusLabel}:</strong> {item.apiStatus || 'N/A'}</p>
            <p><strong>Community Score:</strong> {item.apiScore || 'N/A'}</p>
            <p><strong>Source:</strong> {item.source || 'N/A'}</p>
            <p><strong>Genres:</strong> {item.genres?.join(', ') || 'N/A'}</p>
            <p><strong>{airedLabel}:</strong> {formatDate(item.airedFrom)} to {formatDate(item.airedTo)}</p>
            {mediaType === 'anime' && item.trailerUrl && <p><strong>Trailer:</strong> <a href={item.trailerUrl} target="_blank" rel="noopener noreferrer">Watch Here</a></p>}
          </div>
        </div>
        <div className="modal-actions">
          {onDelete &&
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                onClose(); // Close modal first
                onDelete(item.id);
              }}
            >
              Delete
            </button>
          }
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailsModal;