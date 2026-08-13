import Spotify from "../utilities/spotify";
import Header from "../Header/Header";
import SearchBar from "../SearchBar/SearchBar";
import MainContainer from "../MainContainer/MainContainer";

import { useState } from "react";

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [playlistName, setPlaylistName] = useState("NewPlaylist");
  const [playlistTracks, setPlaylistTracks] = useState([]);

  // Function Handlers
  const handleSearch = async (term) => {
    const tracksReturned = await Spotify.search(term);
    setSearchResults(tracksReturned);
  }

  const handleAddTrack = (track) => {
    if (playlistTracks.some((t) => t.id === track.id)) {
      return;
    }
    setPlaylistTracks((prev) => [track, ...prev]);
  };

  const handleDeleteTrack = (trackToDeleteId) => {
    setPlaylistTracks((prev) =>
      prev.filter((track) => track.id !== trackToDeleteId),
    );
  };

  const handleUpdatePlaylistName = (name) => {
    setPlaylistName(name);
  };

  const handleSavePlaylist = () => {
    const trackUris = playlistTracks.map((track) => track.uri);
    Spotify.savePlaylist(playlistName, trackUris).then(() => {
      setPlaylistName("New Playlist");
      setPlaylistTracks([]);
    });
  };

  return (
    <>
      <Header />
      <SearchBar onSearch={handleSearch} />
      <MainContainer
        searchResults={searchResults}
        onAdd={handleAddTrack}
        onRemove={handleDeleteTrack}
        onNameChange={handleUpdatePlaylistName}
        onSave={handleSavePlaylist}
        playlistName={playlistName}
        playlistTracks={playListTracks}
      />
    </>
  );
}

export default App;
