import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import Register from './components/Register';
import UploadForm from './components/UploadForm';
import SongCard from './components/SongCard';
import MusicPlayer from './components/MusicPlayer';
import PlaylistView from './components/PlaylistView';

const Dashboard = () => {
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [user, setUser] = useState(null);
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

  const handleUpload = async ({ title, singer, file }) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', title);
      formData.append('singer', singer);
      formData.append('song', file);

      await axios.post('/api/songs/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      fetchSongs();
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
        {filteredSongs.map(song => (
          <SongCard
            key={song._id}
            song={song}
            onToggleFavorite={handleToggleFavorite}
            onDelete={handleDelete}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🎵 Musify</h1>
        <p>Welcome back, {user?.username}!</p>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <UploadForm onUpload={handleUpload} />

      <div className="filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Songs ({songs.length})
        </button>
        
        <button 
          className={`filter-btn ${filter === 'favorites' ? 'active' : ''}`}
          onClick={() => setFilter('favorites')}
        >
          Favorites ({songs.filter(s => s.isFavorite).length})
        </button>
        
        <button 
          className={`filter-btn ${filter === 'by-singer' ? 'active' : ''}`}
          onClick={() => setFilter('by-singer')}
        >
          By Singer
        </button>
        
        <button 
          className="filter-btn playlist-nav-btn"
          onClick={() => navigate('/playlists')}
        >
          My Playlists
        </button>
      </div>

      {filteredSongs.length === 0 ? (
        <div className="no-songs">
          {filter === 'favorites' ? 'No favorite songs yet' : 'No songs uploaded yet'}
        </div>
      ) : (
        renderSongs()
      )}
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

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
          user ? <Dashboard /> : <Navigate to="/login" />
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