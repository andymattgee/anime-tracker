import React from 'react';

const MediaCard = ({ item, onClick, children, isSelected, onSelectToggle }) => {
  // Determine if the item is anime or manga to display relevant info
  // This assumes 'userStatus' and 'apiScore' are common or adaptable.
  // If manga uses 'status' and 'rating' as in MangaInventoryPage,
  // we might need to pass a 'type' prop or normalize data before passing to MediaCard.
  // For now, let's assume 'userStatus' and 'apiScore' are available on the item.
  // If item.status is for manga and item.userStatus for anime, we'll need to adjust.
  // Let's try to use item.userStatus for status and item.apiScore for community score.
  // MangaInventoryPage maps these as item.status and item.rating, but the original fields are userStatus and userScore.
  // We should aim to use the direct fields from the item object if possible.

  const displayStatus = item.userStatus || item.status; // Handles both anime (userStatus) and manga (status alias)
  const displayCommunityScore = item.apiScore;

  return (
    <div
      key={item.id || item.mal_id}
      className={`result-card ${isSelected ? 'selected' : ''}`}
      style={isSelected ? { border: '2px solid #007bff', boxShadow: '0 0 10px rgba(0,123,255,0.5)' } : {}}
    >
      {onSelectToggle && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation(); // Prevent card click when toggling checkbox
            onSelectToggle(item.id);
          }}
          style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1 }}
        />
      )}
      <div className="card-content" onClick={onClick}>
        {item.coverImage && (
          <img
            src={item.coverImage}
            alt={
              item.title_english
                ? (item.title && item.title_english !== item.title ? `${item.title_english} (${item.title}) cover` : `${item.title_english} cover`)
                : `${item.title} cover`
            }
          />
        )}
        <h3>
          {item.title_english || item.title}
          {item.title_english && item.title && item.title_english !== item.title && (
            <span style={{ display: 'block', fontSize: '0.8em', fontWeight: 'normal', marginTop: '0.2em' }}>
              ({item.title})
            </span>
          )}
        </h3>
        <div className="inventory-details">
          {displayStatus && <p><strong>Status:</strong> {displayStatus}</p>}
          {displayCommunityScore !== undefined && displayCommunityScore !== null && (
            <p><strong>Community Score:</strong> {displayCommunityScore || 'N/A'}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
};

export default MediaCard;