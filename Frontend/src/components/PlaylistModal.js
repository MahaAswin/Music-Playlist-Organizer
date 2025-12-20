import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus } from 'react-icons/fa';
import axios from 'axios';

const PlaylistModal = ({ isOpen, onClose, song, onAddToPlaylist }) => {
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
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

  const createPlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/playlists', 
        { name: newPlaylistName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Add song to the newly created playlist
      await addToPlaylist(response.data._id);
      
      setNewPlaylistName('');
      setShowCreateForm(false);
      fetchPlaylists();
    } catch (error) {
      console.error('Error creating playlist:', error);
      alert('Error creating playlist');
    }
    setLoading(false);
  };

  const addToPlaylist = async (playlistId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/playlists/${playlistId}/songs`,
        { songId: song._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Added "${song.title}" to playlist!`);
      onAddToPlaylist();
      onClose();
    } catch (error) {
      console.error('Error adding to playlist:', error);
      alert('Error adding to playlist');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add "{song?.title}" to Playlist</h3>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          {!showCreateForm ? (
            <>
              <button 
                className="create-playlist-btn"
                onClick={() => setShowCreateForm(true)}
              >
                <FaPlus /> Create New Playlist
              </button>

              <div className="playlist-list">
                {playlists.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                    No playlists yet. Create your first playlist!
                  </p>
                ) : (
                  playlists.map(playlist => (
                    <div 
                      key={playlist._id} 
                      className="playlist-item"
                      onClick={() => !loading && addToPlaylist(playlist._id)}
                      style={{ opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                    >
                      <span>{playlist.name}</span>
                      <small>{playlist.songs.length} songs</small>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <form onSubmit={createPlaylist} className="create-form">
              <input
                type="text"
                placeholder="Playlist name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                required
                autoFocus
              />
              <div className="form-buttons">
                <button type="submit" disabled={loading || !newPlaylistName.trim()}>
                  {loading ? 'Creating...' : 'Create & Add Song'}
                </button>
                <button type="button" onClick={() => setShowCreateForm(false)} disabled={loading}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistModal;