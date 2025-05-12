import React from 'react';

const ExplorePageCard = ({ item, type, addStatus, handleAddItemToInventory, children }) => {
  return (
    <div key={item.mal_id} className="result-card">
      <a href={item.url} target="_blank" rel="noopener noreferrer">
        <img src={item.images?.jpg?.image_url} alt={item.title} />
        <h3>{item.title}</h3>
        {item.score && <p>Score: {item.score}</p>}
        {item.episodes && <p>Episodes: {item.episodes}</p>}
        {item.chapters && <p>Chapters: {item.chapters}</p>}
      </a>
      <button
        className={`add-inventory-button ${addStatus[item.mal_id]?.status || ''}`}
        onClick={() => handleAddItemToInventory(item, type)}
        disabled={addStatus[item.mal_id]?.status === 'adding' || addStatus[item.mal_id]?.status === 'added'}
      >
        {addStatus[item.mal_id]?.status === 'adding' ? `Adding ${type}...` :
         addStatus[item.mal_id]?.status === 'added' ? `${type.charAt(0).toUpperCase() + type.slice(1)} Added ✓` :
         addStatus[item.mal_id]?.status === 'error' ? 'Error' :
         `Add to ${type.charAt(0).toUpperCase() + type.slice(1)} Inventory`}
      </button>
      {addStatus[item.mal_id]?.status === 'error' && (
        <p className="add-error-message">{addStatus[item.mal_id]?.message}</p>
      )}
      {children}
    </div>
  );
};

export default ExplorePageCard;