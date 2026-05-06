import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import Register from './components/Register';
import UploadForm from './components/UploadForm';
import SongCard from './components/SongCard';
import MusicPlayer from './components/MusicPlayer';
import PlaylistView from './components/PlaylistView';

import { FaHome, FaHeart, FaUser, FaPlus, FaSignOutAlt, FaMusic, FaSun, FaMoon } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = ({ theme, toggleTheme }) => {
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [user, setUser] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
      fetchSongs();
    }
  }, []);

  useEffect(() => {
    filterSongs();
  }, [songs, filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSongs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/songs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSongs(response.data);
    } catch (error) {
      console.error('Error fetching songs:', error);
    }
  };

  const filterSongs = () => {
    let filtered = [...songs];
    if (filter === 'favorites') {
      filtered = songs.filter(song => song.isFavorite);
    }
    setFilteredSongs(filtered);
  };

  const handleUpload = async ({ title, singer, file, image }) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', title);
      formData.append('singer', singer);
      formData.append('song', file);
      if (image) formData.append('image', image);

      await axios.post('/api/songs/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      fetchSongs();
      setShowUploadModal(false);
      alert('Song uploaded successfully!');
    } catch (error) {
      console.error('Error uploading song:', error);
      alert('Error uploading song');
    }
  };

  const handleToggleFavorite = async (songId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/songs/${songId}/favorite`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSongs();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleDelete = async (songId) => {
    if (window.confirm('Are you sure you want to delete this song?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/songs/${songId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchSongs();
      } catch (error) {
        console.error('Error deleting song:', error);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  const groupSongsBySinger = (songs) => {
    return songs.reduce((groups, song) => {
      const singer = song.singer;
      if (!groups[singer]) {
        groups[singer] = [];
      }
      groups[singer].push(song);
      return groups;
    }, {});
  };

  const renderSongs = () => {
    if (filter === 'by-singer') {
      const groupedSongs = groupSongsBySinger(filteredSongs);
      
      return Object.entries(groupedSongs).map(([singer, singerSongs]) => (
        <div key={singer} className="singer-section">
          <h2 className="singer-title">{singer}</h2>
          <div className="songs-grid">
            {singerSongs.map(song => (
              <SongCard
                key={song._id}
                theme={theme}
                song={song}
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      ));
    }

    return (
      <div className="songs-grid">
        <AnimatePresence>
          {filteredSongs.map((song, index) => (
            <motion.div
              key={song._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <SongCard
                theme={theme}
                song={song}
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDelete}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar glass">
        <div className="logo poppins">
          <span>🎵 Musify</span>
        </div>
        
        <nav className="nav-links">
          <div 
            className={`nav-item ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            <FaHome /> <span className="nav-text">Discover</span>
          </div>
          <div 
            className={`nav-item ${filter === 'favorites' ? 'active' : ''}`}
            onClick={() => setFilter('favorites')}
          >
            <FaHeart /> <span className="nav-text">Favorites</span>
          </div>
          <div 
            className={`nav-item ${filter === 'by-singer' ? 'active' : ''}`}
            onClick={() => setFilter('by-singer')}
          >
            <FaUser /> <span className="nav-text">Artists</span>
          </div>
          <div 
            className="nav-item"
            onClick={() => navigate('/playlists')}
          >
            <FaMusic /> <span className="nav-text">Playlists</span>
          </div>
        </nav>

        <div className="nav-links" style={{ marginTop: 'auto' }}>
          <div className="nav-item" onClick={() => setShowUploadModal(true)}>
            <FaPlus /> <span className="nav-text">Upload Song</span>
          </div>
          <div className="nav-item" onClick={toggleTheme}>
            {theme === 'dark' ? <FaSun /> : <FaMoon />} 
            <span className="nav-text">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </div>
          <div className="nav-item" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
            <FaSignOutAlt /> <span className="nav-text">Logout</span>
          </div>

        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="section-header">
          <div>
            <h2 className="poppins">Welcome, {user?.username}</h2>
            <p style={{ color: 'var(--text-dim)' }}>Explore your music collection</p>
          </div>
          <button className="primary-btn" style={{ width: 'auto', padding: '12px 25px' }} onClick={() => setShowUploadModal(true)}>
            <FaPlus /> Add New Song
          </button>
        </header>

        <section>
          {filteredSongs.length === 0 ? (
            <div className="no-songs glass" style={{ padding: '60px', borderRadius: '24px' }}>
              <FaMusic style={{ fontSize: '3rem', marginBottom: '20px', opacity: 0.3 }} />
              <p>{filter === 'favorites' ? 'No favorite songs yet' : 'Your library is empty'}</p>
            </div>
          ) : (
            renderSongs()
          )}
        </section>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
            <div className="modal-card glass" onClick={e => e.stopPropagation()}>
              <button className="close-modal" onClick={() => setShowUploadModal(false)}>&times;</button>
              <UploadForm onUpload={handleUpload} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};


const App = () => {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };


  const handleLogin = async (formData) => {
    try {
      const response = await axios.post('/api/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
    } catch (error) {
      alert(error.response?.data?.message || 'Login failed');
    }
  };

  const handleRegister = async (formData) => {
    try {
      const response = await axios.post('/api/auth/register', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />
        } />
        <Route path="/register" element={
          user ? <Navigate to="/" /> : <Register onRegister={handleRegister} />
        } />
        <Route path="/" element={
          user ? <Dashboard theme={theme} toggleTheme={toggleTheme} /> : <Navigate to="/login" />
        } />
        <Route path="/player/:id" element={
          user ? <MusicPlayer /> : <Navigate to="/login" />
        } />
        <Route path="/playlists" element={
          user ? <PlaylistView /> : <Navigate to="/login" />
        } />
      </Routes>
    </Router>
  );
};

export default App;