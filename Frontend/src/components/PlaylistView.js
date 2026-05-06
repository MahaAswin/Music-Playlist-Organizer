import React, { useState, useEffect } from 'react';
import { FaTrash, FaMusic, FaArrowLeft, FaEdit, FaPlus, FaHome, FaHeart, FaUser, FaSun, FaMoon } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const PlaylistView = () => {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [editName, setEditName] = useState('');
  const navigate = useNavigate();

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    fetchPlaylists();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };


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
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/playlists', 
        { name: newPlaylistName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewPlaylistName('');
      setShowCreateModal(false);
      fetchPlaylists();
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };

  const updatePlaylist = async (playlistId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/playlists/${playlistId}`, 
        { name: editName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingPlaylist(null);
      setEditName('');
      fetchPlaylists();
    } catch (error) {
      console.error('Error updating playlist:', error);
    }
  };

  const deletePlaylist = async (playlistId) => {
    if (window.confirm('Delete this playlist?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/playlists/${playlistId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchPlaylists();
        setSelectedPlaylist(null);
      } catch (error) {
        console.error('Error deleting playlist:', error);
      }
    }
  };

  const removeSongFromPlaylist = async (playlistId, songId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`/api/playlists/${playlistId}/songs/${songId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const updatedPlaylist = response.data;
      setPlaylists(playlists.map(p => p._id === playlistId ? updatedPlaylist : p));
      setSelectedPlaylist(updatedPlaylist);
    } catch (error) {
      console.error('Error removing song:', error);
    }
  };

  return (
    <div className="app-layout">
      {/* Reusing Dashboard Sidebar style */}
      <aside className="sidebar glass">
        <div className="logo poppins">
          <span>🎵 Musify</span>
        </div>
        
        <nav className="nav-links">
          <div className="nav-item" onClick={() => navigate('/')}>
            <FaArrowLeft /> <span className="nav-text">Back to Home</span>
          </div>
          <div className="nav-item active">
            <FaMusic /> <span className="nav-text">My Playlists</span>
          </div>
        </nav>

        <div className="nav-links" style={{ marginTop: 'auto' }}>
          <div className="nav-item" onClick={toggleTheme}>
            {theme === 'dark' ? <FaSun /> : <FaMoon />} 
            <span className="nav-text">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </div>
          <div className="nav-item" onClick={() => setShowCreateModal(true)}>
            <FaPlus /> <span className="nav-text">New Playlist</span>
          </div>
        </div>

      </aside>

      <main className="main-content">
        <header className="section-header">
          <div>
            <h2 className="poppins">Your Playlists</h2>
            <p style={{ color: 'var(--text-dim)' }}>Manage your custom collections</p>
          </div>
          <button className="primary-btn" style={{ width: 'auto', padding: '12px 25px' }} onClick={() => setShowCreateModal(true)}>
            <FaPlus /> Create New
          </button>
        </header>

        <div className="playlist-grid-layout" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '30px' }}>
          {/* Internal Sidebar for Playlist Selection */}
          <div className="playlist-selector glass" style={{ borderRadius: '20px', padding: '15px', height: 'fit-content' }}>
            {playlists.map(playlist => (
              <div 
                key={playlist._id}
                className={`nav-item ${selectedPlaylist?._id === playlist._id ? 'active' : ''}`}
                onClick={() => setSelectedPlaylist(playlist)}
                style={{ marginBottom: '5px' }}
              >
                {editingPlaylist === playlist._id ? (
                  <input
                    type="text"
                    className="glass"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => updatePlaylist(playlist._id)}
                    onKeyPress={(e) => e.key === 'Enter' && updatePlaylist(playlist._id)}
                    autoFocus
                    style={{ width: '100%', padding: '5px', borderRadius: '5px' }}
                  />
                ) : (
                  <>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500' }}>{playlist.name}</div>
                      <small style={{ color: 'var(--text-muted)' }}>{playlist.songs.length} songs</small>
                    </div>
                    <div className="playlist-actions-mini" style={{ display: 'flex', gap: '8px' }}>
                      <FaEdit 
                        style={{ cursor: 'pointer', fontSize: '0.8rem' }} 
                        onClick={(e) => { e.stopPropagation(); setEditingPlaylist(playlist._id); setEditName(playlist.name); }} 
                      />
                      <FaTrash 
                        style={{ cursor: 'pointer', fontSize: '0.8rem', color: 'var(--danger)' }} 
                        onClick={(e) => { e.stopPropagation(); deletePlaylist(playlist._id); }} 
                      />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Playlist Content */}
          <div className="playlist-content-view">
            <AnimatePresence mode="wait">
              {selectedPlaylist ? (
                <motion.div
                  key={selectedPlaylist._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass"
                  style={{ borderRadius: '24px', padding: '30px' }}
                >
                  <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="poppins" style={{ fontSize: '2rem' }}>{selectedPlaylist.name}</h2>
                    <button className="delete-playlist-btn glass" onClick={() => deletePlaylist(selectedPlaylist._id)} style={{ color: 'var(--danger)', padding: '10px' }}>
                      <FaTrash /> Delete Playlist
                    </button>
                  </div>

                  <div className="song-list-modern">
                    {selectedPlaylist.songs.map((song, index) => (
                      <motion.div 
                        key={song._id} 
                        className="song-item-row glass"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          padding: '15px 20px', 
                          borderRadius: '15px', 
                          marginBottom: '10px',
                          gap: '20px'
                        }}
                      >
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FaMusic style={{ opacity: 0.5 }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 
                            className="poppins" 
                            style={{ cursor: 'pointer', color: 'var(--text-main)' }}
                            onClick={() => navigate(`/player/${song._id}`)}
                          >
                            {song.title}
                          </h4>
                          <small style={{ color: 'var(--text-dim)' }}>{song.singer}</small>
                        </div>
                        <button 
                          className="remove-btn" 
                          onClick={() => removeSongFromPlaylist(selectedPlaylist._id, song._id)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                          <FaTrash />
                        </button>
                      </motion.div>
                    ))}

                    {selectedPlaylist.songs.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '60px', opacity: 0.5 }}>
                        <FaMusic style={{ fontSize: '3rem', marginBottom: '20px' }} />
                        <p>No songs in this playlist yet</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="glass" style={{ borderRadius: '24px', padding: '60px', textAlign: 'center', opacity: 0.5 }}>
                  <FaMusic style={{ fontSize: '4rem', marginBottom: '20px' }} />
                  <h3 className="poppins">Select a playlist</h3>
                  <p>Choose a collection from the left to start listening</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-card glass" onClick={e => e.stopPropagation()}>
              <h2 className="poppins" style={{ marginBottom: '25px' }}>New Playlist</h2>
              <form onSubmit={createPlaylist}>
                <div className="input-group">
                  <label>Playlist Name</label>
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="e.g. Chill Vibes"
                    required
                    autoFocus
                  />
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <button type="submit" className="primary-btn">Create Playlist</button>
                  <button type="button" className="glass" style={{ padding: '14px', borderRadius: '14px', color: 'white' }} onClick={() => setShowCreateModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PlaylistView;