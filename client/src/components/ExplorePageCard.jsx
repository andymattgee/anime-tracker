import React from 'react';

// ExplorePageCard component receives item data, type (anime/manga),
// addStatus for inventory status, handleAddItemToInventory function, and children.
const ExplorePageCard = ({ item, type, addStatus, handleAddItemToInventory, onCardClick, children }) => {
  return (
    // Main container for each result card, using item.mal_id as key
    <div key={item.mal_id} className="result-card">
      <div onClick={() => onCardClick(item, type)} style={{ cursor: 'pointer' }}>
        {/* Display item image */}
        <img
          src={item.images?.jpg?.image_url}
          alt={
            // Alt text logic: prefer English title, fallback to original title
            item.title_english
              ? (item.title && item.title_english !== item.title ? `${item.title_english} (${item.title})` : item.title_english)
              : item.title
          }
        />
        {/* Display item title(s) */}
        <h3>
          {item.title_english || item.title}
          {/* Display original title if English title is different */}
          {item.title_english && item.title && item.title_english !== item.title && (
            <span style={{ display: 'block', fontSize: '0.8em', fontWeight: 'normal', marginTop: '0.2em' }}>
              ({item.title})
            </span>
          )}
        </h3>
        {/* Display score if available */}
        {item.score && <p>Score: {item.score}</p>}
        {/* Display episodes if available (for anime) */}
        {item.episodes && <p>Episodes: {item.episodes}</p>}
        {/* Display chapters if available (for manga) */}
        {item.chapters && <p>Chapters: {item.chapters}</p>}
      </div>
      {/* Button to add item to inventory */}
      <button
        className={`add-inventory-button ${addStatus[item.mal_id]?.status || ''}`}
        onClick={() => handleAddItemToInventory(item, type)}
        disabled={addStatus[item.mal_id]?.status === 'adding' || addStatus[item.mal_id]?.status === 'added'}
      >
        {/* Button text changes based on addStatus */}
        {addStatus[item.mal_id]?.status === 'adding' ? `Adding ${type}...` :
         addStatus[item.mal_id]?.status === 'added' ? `${type.charAt(0).toUpperCase() + type.slice(1)} Added ✓` :
         addStatus[item.mal_id]?.status === 'error' ? 'Error' :
         `Add to ${type.charAt(0).toUpperCase() + type.slice(1)} Inventory`}
      </button>
      {/* Display error message if addStatus is error */}
      {addStatus[item.mal_id]?.status === 'error' && (
        <p className="add-error-message">{addStatus[item.mal_id]?.message}</p>
      )}
      {/* Render children components */}
      {children}
    </div>
  );
};

// Export the component
export default ExplorePageCard;