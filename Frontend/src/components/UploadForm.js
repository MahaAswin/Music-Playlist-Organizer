import React, { useState } from 'react';

const UploadForm = ({ onUpload }) => {
  const [title, setTitle] = useState('');
  const [singer, setSinger] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !singer || !file) {
      alert('Please fill all fields');
      return;
    }

    setUploading(true);
    await onUpload({ title, singer, file });
    
    setTitle('');
    setSinger('');
    setFile(null);
    setFileName('');
    setUploading(false);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  return (
    <div className="upload-section">
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
        Upload New Song
      </h2>
      
      <form className="upload-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Song Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter song title"
            required
          />
        </div>

        <div className="form-group">
          <label>Singer Name</label>
          <input
            type="text"
            value={singer}
            onChange={(e) => setSinger(e.target.value)}
            placeholder="Enter singer name"
            required
          />
        </div>

        <div className="form-group">
          <label>MP3 File</label>
          <div className="file-input">
            <input
              type="file"
              accept=".mp3,audio/mpeg"
              onChange={handleFileChange}
              id="file-upload"
              required
            />
            <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
              {fileName || '📁 Choose MP3 file'}
            </label>
          </div>
        </div>

        <button type="submit" className="upload-btn" disabled={uploading}>
          {uploading ? 'Uploading...' : '🎵 Upload Song'}
        </button>
      </form>
    </div>
  );
};

export default UploadForm;