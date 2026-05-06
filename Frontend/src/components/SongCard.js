import React, { useState } from 'react';
import { FaHeart, FaTrash, FaPlay, FaPlus, FaEllipsisV, FaMusic } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import PlaylistModal from './PlaylistModal';
import { motion } from 'framer-motion';

const SongCard = ({ song, onToggleFavorite, onDelete, theme }) => {
  const navigate = useNavigate();
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  // Dynamic colorful gradients for songs without images
  const darkGradients = [
    'linear-gradient(135deg, #FF6B6B, #FFD93D)',
    'linear-gradient(135deg, #6BCB77, #4D96FF)',
    'linear-gradient(135deg, #7c4dff, #00d4ff)',
    'linear-gradient(135deg, #FF9A8B, #FF6A88)',
    'linear-gradient(135deg, #A18CD1, #FBC2EB)',
    'linear-gradient(135deg, #84FAB0, #8FD3F4)',
    'linear-gradient(135deg, #F6D365, #FDA085)',
    'linear-gradient(135deg, #FA709A, #FEE140)'
  ];

  const lightGradients = [
    'linear-gradient(135deg, #FF9E9E, #FFEB99)',
    'linear-gradient(135deg, #A7F3D0, #A5B4FC)',
    'linear-gradient(135deg, #C4B5FD, #A5F3FC)',
    'linear-gradient(135deg, #FED7AA, #FDA4AF)',
    'linear-gradient(135deg, #DDD6FE, #F5D0FE)',
    'linear-gradient(135deg, #D1FAE5, #DBEAFE)',
    'linear-gradient(135deg, #FEF3C7, #FFEDD5)',
    'linear-gradient(135deg, #FCE7F3, #FEF3C7)'
  ];

  // Pick a stable gradient based on the song ID and current theme
  const getGradient = (id) => {
    const list = theme === 'light' ? lightGradients : darkGradients;
    const index = parseInt(id.slice(-2), 16) % list.length;
    return list[index];
  };


  return (
    <motion.div 
      className="song-card glass"
      whileHover={{ y: -5 }}
    >
      <div 
        className="song-artwork"
        style={{ 
          background: song.imageFilename ? 'transparent' : getGradient(song._id),
          opacity: 0.9
        }}
      >
        {song.imageFilename ? (
          <img 
            src={`/api/songs/image/${song.imageFilename}`} 
            alt={song.title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '15px' }} 
          />
        ) : (
          <FaMusic style={{ color: 'white', filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.2))' }} />
        )}

        <div className="play-overlay">
          <button 
            className="play-icon-btn"
            onClick={() => navigate(`/player/${song._id}`)}
          >
            <FaPlay />
          </button>
        </div>
      </div>
      
      <div className="song-info">
        <h3 className="poppins" onClick={() => navigate(`/player/${song._id}`)} style={{ cursor: 'pointer' }}>
          {song.title}
        </h3>
        <p>{song.singer}</p>
      </div>

      <div className="song-actions-modern">
        <button 
          className={`modern-action-btn favorite ${song.isFavorite ? 'active' : ''}`}
          onClick={() => onToggleFavorite(song._id)}
          title="Favorite"
        >
          <FaHeart />
        </button>
        
        <button 
          className="modern-action-btn add"
          onClick={() => setShowPlaylistModal(true)}
          title="Add to Playlist"
        >
          <FaPlus />
        </button>
        
        <button 
          className="modern-action-btn delete"
          onClick={() => onDelete(song._id)}
          title="Delete"
        >
          <FaTrash />
        </button>
      </div>

      
      <PlaylistModal 
        isOpen={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
        song={song}
        onAddToPlaylist={() => {}}
      />
    </motion.div>
  );
};

export default SongCard;