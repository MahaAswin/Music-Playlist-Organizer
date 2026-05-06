import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaMusic, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const PlaylistModal = ({ isOpen, onClose, song }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPlaylists();
    }
  }, [isOpen]);

  const fetchPlaylists = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/playlists', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlaylists(response.data);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  };

  const addToPlaylist = async (playlistId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/playlists/${playlistId}/songs`, 
        { songId: song._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Added ${song.title} to playlist!`);
      onClose();
    } catch (error) {
      console.error('Error adding to playlist:', error);
      alert('Song already in playlist');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div 
        className="modal-card glass"
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <button className="close-modal" onClick={onClose}><FaTimes /></button>
        <h2 className="poppins">Add to Playlist</h2>
        <p style={{ color: 'var(--text-dim)', marginBottom: '20px' }}>
          Select a collection for <strong>{song.title}</strong>
        </p>

        <div className="playlist-selection-list">
          {playlists.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p>No playlists found.</p>
            </div>
          ) : (
            playlists.map(playlist => (
              <div 
                key={playlist._id} 
                className="nav-item glass" 
                onClick={() => !loading && addToPlaylist(playlist._id)}
                style={{ marginBottom: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '12px 15px', borderRadius: '12px' }}
              >
                <FaMusic style={{ marginRight: '15px', opacity: 0.5 }} />
                <span>{playlist.name}</span>
                <FaPlus style={{ marginLeft: 'auto', fontSize: '0.8rem', opacity: 0.5 }} />
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PlaylistModal;