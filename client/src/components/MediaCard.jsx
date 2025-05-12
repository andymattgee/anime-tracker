import React from 'react';

const MediaCard = ({ item, onClick, children }) => {
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
    <div key={item.id || item.mal_id} className="result-card">
      <div className="card-content" onClick={onClick}>
        {item.coverImage && (
          <img
            src={item.coverImage}
            alt={`${item.title} cover`}
          />
        )}
        <h3>{item.title}</h3>
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