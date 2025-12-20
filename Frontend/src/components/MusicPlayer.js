import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlay, FaPause, FaHeart, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';

const MusicPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const [song, setSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const fetchSong = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/songs/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSong(response.data);
      } catch (error) {
        console.error('Error fetching song:', error);
        navigate('/');
      }
    };
    
    fetchSong();
  }, [id, navigate]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const toggleFavorite = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/songs/${id}/favorite`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSong({...song, isFavorite: !song.isFavorite});
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!song) return <div className="loading">Loading...</div>;

  return (
    <div className="player-container">
      <div className="player-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <FaArrowLeft /> Back
        </button>
      </div>
      
      <div className="player-card">
        <div className="song-artwork">
          <div className="music-icon">🎵</div>
        </div>
        
        <div className="song-details">
          <h1>{song.title}</h1>
          <h2>by {song.singer}</h2>
          <p>Added on {new Date(song.uploadDate).toLocaleDateString()}</p>
        </div>

        <div className="player-controls">
          <button className="control-btn play-pause" onClick={togglePlay}>
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          
          <button 
            className={`control-btn favorite ${song.isFavorite ? 'active' : ''}`}
            onClick={toggleFavorite}
          >
            <FaHeart />
          </button>
        </div>

        <div className="progress-section">
          <span className="time">{formatTime(currentTime)}</span>
          <input
            type="range"
            className="progress-bar"
            min="0"
            max="100"
            value={duration ? (currentTime / duration) * 100 : 0}
            onChange={handleSeek}
          />
          <span className="time">{formatTime(duration)}</span>
        </div>

        <audio
          ref={audioRef}
          src={`/api/songs/play/${song.filename}`}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />
      </div>
    </div>
  );
};

export default MusicPlayer;