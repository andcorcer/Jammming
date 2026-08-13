const clientId = "b2e80ce8c6f8420291523d0c6de022d7";
const redirectUri = "http://127.0.0.1:5173/";
const scope = "playlist-modify-public";
let accessToken;

// --- PKCE Cryptographic Helpers ---
const generateRandomString = (length) => {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

const sha256 = async (plain) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest("SHA-256", data);
};

const base64encode = (input) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};

const Spotify = {
  async getAccessToken() {
    // 1. Check in-memory token
    if (accessToken) {
      return accessToken;
    }

    // 2. Check localStorage for unexpired cached token
    const localAccessToken = localStorage.getItem("access_token");
    const localExpireTime = localStorage.getItem("expiration_time");

    if (
      localAccessToken &&
      localExpireTime &&
      Date.now() < Number(localExpireTime)
    ) {
      accessToken = localAccessToken;
      return accessToken;
    }

    // 3. Check for authorization code in URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      const codeVerifier = localStorage.getItem("code_verifier");

      try {
        // Exchange authorization code + code_verifier for access token
        const response = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_id: clientId,
            grant_type: "authorization_code",
            code: code,
            redirect_uri: redirectUri,
            code_verifier: codeVerifier,
          }),
        });

        const jsonResponse = await response.json();

        if (jsonResponse.access_token) {
          accessToken = jsonResponse.access_token;
          const expiresIn = jsonResponse.expires_in || 3600;

          // Save token & expiration timestamp
          localStorage.setItem("access_token", accessToken);
          localStorage.setItem("expiration_time", Date.now() + expiresIn * 1000);

          // Clean up stored verifier and remove 'code' parameter from URL
          localStorage.removeItem("code_verifier");
          window.history.pushState("Access Token", null, "/");

          return accessToken;
        } else {
          console.error("Token exchange failed:", jsonResponse);
        }
      } catch (error) {
        console.error("Error exchanging code for token:", error);
      }
    } else {
      // 4. Initiate PKCE authorization redirect
      const codeVerifier = generateRandomString(64);
      const hashed = await sha256(codeVerifier);
      const codeChallenge = base64encode(hashed);

      // Save verifier in localStorage to verify when Spotify redirects back
      localStorage.setItem("code_verifier", codeVerifier);

      const params = new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        scope: scope,
        code_challenge_method: "S256",
        code_challenge: codeChallenge,
        redirect_uri: redirectUri,
      });

      window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
    }
  },

  async search(term) {
    const token = await this.getAccessToken();
    if (!token) return [];

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(term)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const jsonResponse = await response.json();

      if (!jsonResponse.tracks) {
        return [];
      }

      return jsonResponse.tracks.items.map((track) => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        uri: track.uri,
      }));
    } catch (error) {
      console.error("Error searching Spotify tracks:", error);
      return [];
    }
  },

  async savePlaylist(name, trackUris) {
    if (!name || !trackUris.length) {
      return;
    }

    const token = await this.getAccessToken();
    if (!token) return;

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    try {
      const userResponse = await fetch("https://api.spotify.com/v1/me", {
        headers: headers,
      });
      const userJsonResponse = await userResponse.json();
      const userId = userJsonResponse.id;

      const createPlaylistResponse = await fetch(
        `https://api.spotify.com/v1/users/${userId}/playlists`,
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify({ name: name }),
        }
      );
      const playlistJsonResponse = await createPlaylistResponse.json();
      const playlistId = playlistJsonResponse.id;

      return await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify({ uris: trackUris }),
        }
      );
    } catch (error) {
      console.error("Error saving playlist to Spotify:", error);
    }
  },
};

export default Spotify;