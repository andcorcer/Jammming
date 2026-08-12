const clientId = 'b2e80ce8c6f8420291523d0c6de022d7'; // Replace this string with your actual Client ID from the Spotify dashboard
const redirectUri = 'http://localhost:5173/'; // Matches your local Vite development URL
let accessToken;

const Spotify = {
  getAccessToken() {
    if (accessToken) {
      return accessToken;
    }

    // Check for access token match in the URL hash
    const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
    const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

    if (accessTokenMatch && expiresInMatch) {
      accessToken = accessTokenMatch[1];
      const expiresIn = Number(expiresInMatch[1]);
      
      // Clear parameters from the URL so the app doesn't attempt using expired tokens
      window.setTimeout(() => accessToken = '', expiresIn * 1000);
      window.history.pushState('Access Token', null, '/');
      return accessToken;
    } else {
      // Redirect the user to Spotify's authorization page
      const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${encodeURIComponent(redirectUri)}`;
      window.location.href = accessUrl;
    }
  },

  async search(term) {
    const token = this.getAccessToken();
    
    try {
      const response = await fetch(`https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(term)}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const jsonResponse = await response.json();
      
      if (!jsonResponse.tracks) {
        return [];
      }
      
      return jsonResponse.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        uri: track.uri
      }));
    } catch (error) {
      console.error('Error searching Spotify tracks:', error);
      return [];
    }
  },

  async savePlaylist(name, trackUris) {
    if (!name || !trackUris.length) {
      return;
    }

    const token = this.getAccessToken();
    const headers = { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    let userId;

    try {
      // Step 1: Fetch the current user's Spotify ID
      const userResponse = await fetch('https://api.spotify.com/v1/me', { headers: { Authorization: `Bearer ${token}` } });
      const userJsonResponse = await userResponse.json();
      userId = userJsonResponse.id;

      // Step 2: Create a new playlist under the user's account
      const createPlaylistResponse = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ name: name })
      });
      const playlistJsonResponse = await createPlaylistResponse.json();
      const playlistId = playlistJsonResponse.id;

      // Step 3: Add the selected tracks to the new playlist
      return await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ uris: trackUris })
      });
    } catch (error) {
      console.error('Error saving playlist to Spotify:', error);
    }
  }
};

export default Spotify;