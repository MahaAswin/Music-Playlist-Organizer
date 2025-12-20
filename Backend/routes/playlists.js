const express = require('express');
const Playlist = require('../models/Playlist');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user playlists
router.get('/', auth, async (req, res) => {
  try {
    const playlists = await Playlist.find({ userId: req.user._id }).populate('songs');
    res.json(playlists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create playlist
router.post('/', auth, async (req, res) => {
  try {
    const { name } = req.body;
    const playlist = new Playlist({
      name,
      userId: req.user._id,
      songs: []
    });
    await playlist.save();
    res.status(201).json(playlist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update playlist name
router.patch('/:id', auth, async (req, res) => {
  try {
    const { name } = req.body;
    const playlist = await Playlist.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { name },
      { new: true }
    );
    
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    res.json(playlist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add song to playlist
router.post('/:id/songs', auth, async (req, res) => {
  try {
    const { songId } = req.body;
    const playlist = await Playlist.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    
    if (!playlist.songs.includes(songId)) {
      playlist.songs.push(songId);
      await playlist.save();
    }
    
    await playlist.populate('songs');
    res.json(playlist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Remove song from playlist
router.delete('/:id/songs/:songId', auth, async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    
    playlist.songs = playlist.songs.filter(id => id.toString() !== req.params.songId);
    await playlist.save();
    
    await playlist.populate('songs');
    res.json(playlist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete playlist
router.delete('/:id', auth, async (req, res) => {
  try {
    await Playlist.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Playlist deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;