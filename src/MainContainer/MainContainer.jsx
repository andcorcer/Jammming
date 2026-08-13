import React from "react";
import PlaylistContainer from "../PlaylistContainer/PlaylistContainer";
import SearchResultsContainer from "../SearchResultsContainer/SearchResultsContainer";

function MainContainer({ searchResults, onAdd, onRemove, onNameChange, onSave, playlistName, playlistTracks}) {
  return (
    <div className="Main_Container">
      <SearchResultsContainer
        searchResults={searchResults}
        onAdd={onAdd}
      />
      <PlaylistContainer
        onNameChange={onNameChange}
        playlistName={playlistName}
        playlistTracks={playlistTracks}
        onRemove={onRemove}
        onSave={onSave}
      />
    </div>
  );
}

export default MainContainer;
