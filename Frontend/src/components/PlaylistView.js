import React, { useState, useEffect } from 'react';
import { FaTrash, FaMusic, FaArrowLeft, FaEdit, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PlaylistView = () => {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [editName, setEditName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlaylists();
  }, []);

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
      setShowCreateForm(false);
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
      await axios.delete(`/api/playlists/${playlistId}/songs/${songId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPlaylists();
      const updated = playlists.find(p => p._id === playlistId);
      setSelectedPlaylist(updated);
    } catch (error) {
      console.error('Error removing song:', error);
    }
  };

  return (
    <div className="playlist-container">
      <div className="playlist-header-bar">
        <button className="back-btn" onClick={() => navigate('/')}>
          <FaArrowLeft /> Back to Music
        </button>
        <h2>My Playlists</h2>
        <button 
          className="create-playlist-btn"
          onClick={() => setShowCreateForm(true)}
        >
          <FaPlus /> New Playlist
        </button>
      </div>

      {showCreateForm && (
        <div className="create-playlist-form">
          <form onSubmit={createPlaylist}>
            <input
              type="text"
              placeholder="Playlist name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              required
              autoFocus
            />
            <div className="form-buttons">
              <button type="submit">Create</button>
              <button type="button" onClick={() => setShowCreateForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="playlist-sidebar">
        <div className="playlist-list">
          {playlists.map(playlist => (
            <div 
              key={playlist._id}
              className={`playlist-item ${selectedPlaylist?._id === playlist._id ? 'active' : ''}`}
              onClick={() => setSelectedPlaylist(playlist)}
            >
              <div className="playlist-info">
                {editingPlaylist === playlist._id ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => updatePlaylist(playlist._id)}
                    onKeyPress={(e) => e.key === 'Enter' && updatePlaylist(playlist._id)}
                    autoFocus
                  />
                ) : (
                  <>
                    <span className="playlist-name">{playlist.name}</span>
                    <small>{playlist.songs.length} songs</small>
                  </>
                )}
              </div>
              <div className="playlist-actions">
                <button 
                  className="edit-playlist-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingPlaylist(playlist._id);
                    setEditName(playlist.name);
                  }}
                >
                  <FaEdit />
                </button>
                <button 
                  className="delete-playlist-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePlaylist(playlist._id);
                  }}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="playlist-main">
      <div className="playlist-content">
        {selectedPlaylist ? (
          <>
            <div className="playlist-header">
              <h2>{selectedPlaylist.name}</h2>
              <p>{selectedPlaylist.songs.length} songs</p>
            </div>
            
            <div className="playlist-songs">
              {selectedPlaylist.songs.map(song => (
                <div key={song._id} className="playlist-song">
                  <div className="song-info">
                    <h4 
                      onClick={() => navigate(`/player/${song._id}`)}
                      style={{ cursor: 'pointer', color: '#667eea' }}
                    >
                      {song.title}
                    </h4>
                    <p>by {song.singer}</p>
                  </div>
                  <button 
                    className="remove-song-btn"
                    onClick={() => removeSongFromPlaylist(selectedPlaylist._id, song._id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
              
              {selectedPlaylist.songs.length === 0 && (
                <div className="empty-playlist">
                  <FaMusic />
                  <p>No songs in this playlist yet</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="no-playlist-selected">
            <FaMusic />
            <p>Select a playlist to view songs</p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default PlaylistView;