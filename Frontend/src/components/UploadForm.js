import React, { useState } from 'react';
import { FaCloudUploadAlt, FaMusic, FaUser } from 'react-icons/fa';

const UploadForm = ({ onUpload }) => {
  const [title, setTitle] = useState('');
  const [singer, setSinger] = useState('');
  const [file, setFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [imageName, setImageName] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !singer || !file) {
      alert('Please fill all fields');
      return;
    }
    setUploading(true);
    await onUpload({ title, singer, file, image: imageFile });
    setTitle('');
    setSinger('');
    setFile(null);
    setImageFile(null);
    setFileName('');
    setImageName('');
    setImagePreview(null);
    setUploading(false);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setImageFile(selectedFile);
      setImageName(selectedFile.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  return (
    <div className="upload-box">
      <h2 className="poppins" style={{ textAlign: 'center', marginBottom: '30px' }}>
        Add to Library
      </h2>
      
      <form className="upload-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label><FaMusic style={{ marginRight: '8px' }} /> Song Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Munbe vaa"
            required
          />
        </div>

        <div className="input-group">
          <label><FaUser style={{ marginRight: '8px' }} /> Artist Name</label>
          <input
            type="text"
            value={singer}
            onChange={(e) => setSinger(e.target.value)}
            placeholder="e.g. A.R.Rahman"
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="input-group">
            <label>Audio File (MP3)</label>
            <div className="file-input-compact">
              <input type="file" accept=".mp3" onChange={handleFileChange} id="audio-upload" required />
              <label htmlFor="audio-upload">
                <FaCloudUploadAlt />
                <span>{fileName || 'Choose MP3'}</span>
              </label>
            </div>
          </div>

          <div className="input-group">
            <label>Cover Image (Optional)</label>
            <div className="file-input-compact">
              <input type="file" accept="image/*" onChange={handleImageChange} id="image-upload" />
              <label htmlFor="image-upload" style={{ borderColor: imagePreview ? 'var(--primary)' : 'var(--glass-border)' }}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" style={{ width: '20px', height: '20px', borderRadius: '4px', objectFit: 'cover' }} />
                ) : <FaCloudUploadAlt />}
                <span>{imageName || 'Choose Image'}</span>
              </label>
            </div>
          </div>
        </div>

        <button type="submit" className="primary-btn" disabled={uploading} style={{ marginTop: '20px' }}>
          {uploading ? 'Processing...' : 'Upload to Musify'}
        </button>
      </form>
    </div>
  );
};


export default UploadForm;