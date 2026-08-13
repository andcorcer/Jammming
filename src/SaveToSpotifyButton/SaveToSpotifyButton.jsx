import React from "react";

function SaveToSpotifyButton({ onSave }) {
    return (
        <button className="Playlist-save" onClick={onSave}>
            SAVE TO SPOTIFY
        </button>
    );
} 

export default SaveToSpotifyButton;