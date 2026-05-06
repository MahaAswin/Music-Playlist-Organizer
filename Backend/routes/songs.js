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
    if (file.fieldname === 'song') {
      if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/mp3') {
        cb(null, true);
      } else {
        cb(new Error('Only MP3 files are allowed'), false);
      }
    } else if (file.fieldname === 'image') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'), false);
      }
    } else {
      cb(null, true);
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

// Get favorite songs
router.get('/favorites', auth, async (req, res) => {
  try {
    const songs = await Song.find({ userId: req.user._id, isFavorite: true });
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


// Upload song
router.post('/upload', auth, upload.fields([{ name: 'song', maxCount: 1 }, { name: 'image', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, singer } = req.body;
    
    if (!req.files || !req.files['song']) {
      return res.status(400).json({ message: 'Audio file is required' });
    }

    const audioFile = req.files['song'][0];
    const imageFile = req.files['image'] ? req.files['image'][0] : null;

    const songData = {
      title,
      singer,
      userId: req.user._id,
      filename: audioFile.filename,
      filePath: audioFile.path
    };

    if (imageFile) {
      songData.imageFilename = imageFile.filename;
      songData.imagePath = imageFile.path;
    }

    const song = new Song(songData);
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
    
    // Delete files from filesystem
    if (fs.existsSync(song.filePath)) {
      fs.unlinkSync(song.filePath);
    }
    if (song.imagePath && fs.existsSync(song.imagePath)) {
      fs.unlinkSync(song.imagePath);
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

// Serve image files
router.get('/image/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../uploads', filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(path.resolve(filePath));
  } else {
    res.status(404).json({ message: 'Image not found' });
  }
});

module.exports = router;