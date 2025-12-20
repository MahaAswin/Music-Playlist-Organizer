import React, { useState } from 'react';
import { FaHeart, FaTrash, FaPlay, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import PlaylistModal from './PlaylistModal';

const SongCard = ({ song, onToggleFavorite, onDelete }) => {
  const navigate = useNavigate();
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  return (
    <div className="song-card">
      <div className="song-header">
        <div className="song-info">
          <h3 
            onClick={() => navigate(`/player/${song._id}`)}
            style={{ cursor: 'pointer', color: '#667eea' }}
          >
            {song.title}
          </h3>
          <p>by {song.singer}</p>
          <small>{new Date(song.uploadDate).toLocaleDateString()}</small>
        </div>
      </div>
      
      <div className="song-actions">
        <button 
          className={`action-btn play-btn`}
          onClick={() => navigate(`/player/${song._id}`)}
          title="Play"
        >
          <FaPlay />
        </button>
        
        <button 
          className={`action-btn favorite-btn ${song.isFavorite ? 'active' : ''}`}
          onClick={() => onToggleFavorite(song._id)}
          title={song.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <FaHeart />
        </button>
        
        <button 
          className="action-btn playlist-btn"
          onClick={() => setShowPlaylistModal(true)}
          title="Add to playlist"
        >
          <FaPlus />
        </button>
        
        <button 
          className="action-btn delete-btn"
          onClick={() => onDelete(song._id)}
          title="Delete song"
        >
          <FaTrash />
        </button>
      </div>
      
      <PlaylistModal 
        isOpen={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
        song={song}
        onAddToPlaylist={() => alert('Added to playlist!')}
      />
    </div>
  );
};

export default SongCard;