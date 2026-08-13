import React from 'react';
import './Playlist.css';
import TrackList from '../TrackList/TrackList';
import SaveToSpotifyButton from '../SaveToSpotifyButton/SaveToSpotifyButton';

function PlaylistContainer({ onNameChange, onRemove, onSave, playlistName, playlistTracks }) {
  const handleNameChange = ({ target }) => {
    onNameChange(target.value);
  };

  return (
    <div className="Playlist">
      <input 
        value={playlistName} 
        onChange={handleNameChange} 
      />
      <TrackList 
        tracks={playlistTracks} 
        onRemove={onRemove} 
        isRemoval={true} 
      />
      <SaveToSpotifyButton onSave={onSave}/>
    </div>
  );
}

export default PlaylistContainer;