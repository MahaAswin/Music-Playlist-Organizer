import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlay, FaPause, FaHeart, FaArrowLeft, FaMusic } from 'react-icons/fa';
import axios from 'axios';
import { motion } from 'framer-motion';

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
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickedValue = (x / rect.width) * duration;
    audioRef.current.currentTime = clickedValue;
    setCurrentTime(clickedValue);
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
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!song) return <div className="loading">Loading Immersive Player...</div>;

  return (
    <div className="player-container">
      <header className="player-header">
        <button className="back-btn glass" onClick={() => navigate('/')}>
          <FaArrowLeft /> Back to Library
        </button>
      </header>
      
      <motion.div 
        className="player-wrapper"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="immersive-artwork" style={{ position: 'relative', overflow: 'hidden' }}>
          {song.imageFilename ? (
            <img 
              src={`/api/songs/image/${song.imageFilename}`} 
              alt={song.title} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          ) : (
            <FaMusic />
          )}
          <div className="artwork-glow"></div>
        </div>
        
        <div className="player-info">
          <h1 className="poppins">{song.title}</h1>
          <p>{song.singer}</p>
        </div>

        <div className="controls-main">
          <div className="progress-container">
            <span className="time">{formatTime(currentTime)}</span>
            <div className="progress-bar-wrap" onClick={handleSeek}>
              <div 
                className="progress-fill" 
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              >
                <div className="progress-knob"></div>
              </div>
            </div>
            <span className="time">{formatTime(duration)}</span>
          </div>

          <div className="playback-btns">
            <button 
              className={`control-btn favorite glass ${song.isFavorite ? 'active' : ''}`}
              onClick={toggleFavorite}
              style={{ width: '50px', height: '50px' }}
            >
              <FaHeart />
            </button>

            <button className="play-pause-btn" onClick={togglePlay}>
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>

            <div style={{ width: '50px' }}></div> {/* Spacer */}
          </div>
        </div>

        <audio
          ref={audioRef}
          src={`/api/songs/play/${encodeURIComponent(song.filename)}`}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />
      </motion.div>
    </div>
  );
};

export default MusicPlayer;