# Musify - Music Management Application

A full-stack MERN application for managing your music collection with features like uploading MP3 files, organizing by singer, favorites, and more.

## Features

- 🎵 Upload MP3 files with song title and singer name
- ❤️ Mark songs as favorites
- 🎤 Organize songs by singer
- 🗑️ Delete songs
- 🎧 Play songs directly in browser
- 📱 Responsive design

## Tech Stack

- **Frontend**: React, CSS3, React Icons
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **File Upload**: Multer

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)

### Backend Setup
1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start MongoDB service

4. Start the backend server:
   ```bash
   npm run dev
   ```
   Server will run on http://localhost:5000

### Frontend Setup
1. Navigate to frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React app:
   ```bash
   npm start
   ```
   App will run on http://localhost:3000

## Usage

1. **Upload Songs**: Use the upload form to add MP3 files with title and singer information
2. **View All Songs**: See all uploaded songs in a grid layout
3. **Filter by Favorites**: View only your favorite songs
4. **Organize by Singer**: Group songs by singer name
5. **Play Songs**: Click the play button to listen to songs
6. **Manage Songs**: Toggle favorites or delete songs as needed

## API Endpoints

- `GET /api/songs` - Get all songs
- `POST /api/songs/upload` - Upload new song
- `GET /api/songs/favorites` - Get favorite songs
- `GET /api/songs/singer/:singer` - Get songs by singer
- `PATCH /api/songs/:id/favorite` - Toggle favorite status
- `DELETE /api/songs/:id` - Delete song
- `GET /api/songs/play/:filename` - Stream audio file