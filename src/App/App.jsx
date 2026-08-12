import Spotify from "../utilities/spotify";
import Header from "../Header/Header";
import SearchBar from "../SearchBar/SearchBar";
import MainContainer from "../MainContainer/MainContainer";

import { useState } from "react";

function App() {
  const [searchResults, setSearchResults] = useState('');
  const [playlistName, setPlaylistName] = useState('NewPlaylist');
  const [playListTracks, setPlaylistTracks] = useState([]);

  // Function Handlers 
  const addTrack = (track) => {
    if (playListTracks.some(t => t.id === track.id)) {
      return;
    }
    setPlaylistTracks(prev => [track, ...prev]);
  }

  const deleteTrack = (trackId) => {
    setPlaylistTracks(prev => prev.filter(track => track.id !== trackId));
  }

  const updatePlaylistName = (name) => {
    setPlaylistName(name);
  }

  const savePlaylist = () => {
    const trackUris = playListTracks.map(track => track.uri);
    Spotify.savePlaylist(playlistName, trackUris).then(() => {
      setPlaylistName('New Playlist');
      setPlaylistTracks([]);
    });
  }

  return (
    <>
    </>
  );

}

export default App;