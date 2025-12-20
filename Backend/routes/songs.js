const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Song = require('../models/Song');
const auth = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/mp3') {
      cb(null, true);
    } else {
      cb(new Error('Only MP3 files are allowed'), false);
    }
  }
});

// Get all songs for user
router.get('/', auth, async (req, res) => {
  try {
    const songs = await Song.find({ userId: req.user._id }).sort({ uploadDate: -1 });
    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get songs by singer
router.get('/singer/:singer', auth, async (req, res) => {
  try {
    const songs = await Song.find({ userId: req.user._id, singer: req.params.singer });
    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get favorite songs
router.get('/favorites', auth, async (req, res) => {
  try {
    const songs = await Song.find({ userId: req.user._id, isFavorite: true });
    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload song
router.post('/upload', auth, upload.single('song'), async (req, res) => {
  try {
    const { title, singer } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const song = new Song({
      title,
      singer,
      userId: req.user._id,
      filename: req.file.filename,
      filePath: req.file.path
    });

    await song.save();
    res.status(201).json(song);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Toggle favorite
router.patch('/:id/favorite', auth, async (req, res) => {
  try {
    const song = await Song.findOne({ _id: req.params.id, userId: req.user._id });
    if (!song) return res.status(404).json({ message: 'Song not found' });
    
    song.isFavorite = !song.isFavorite;
    await song.save();
    res.json(song);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete song
router.delete('/:id', auth, async (req, res) => {
  try {
    const song = await Song.findOne({ _id: req.params.id, userId: req.user._id });
    if (!song) return res.status(404).json({ message: 'Song not found' });
    
    // Delete file from filesystem
    if (fs.existsSync(song.filePath)) {
      fs.unlinkSync(song.filePath);
    }
    
    await Song.findByIdAndDelete(req.params.id);
    res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get song by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const song = await Song.findOne({ _id: req.params.id, userId: req.user._id });
    if (!song) return res.status(404).json({ message: 'Song not found' });
    res.json(song);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Serve audio files
router.get('/play/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../uploads', filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(path.resolve(filePath));
  } else {
    res.status(404).json({ message: 'File not found' });
  }
});

module.exports = router;