// components/album_cover.ts

export async function getAccessToken(
  clientId: string,
  clientSecret: string
): Promise<string> {
  const tokenUrl = "https://accounts.spotify.com/api/token";
  // Use Buffer to encode credentials (works in Node)
  const encodedCredentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${encodedCredentials}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`Failed to obtain token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

export async function getAlbumCover(
  song: string,
  clientId: string,
  clientSecret: string
): Promise<string> {
  const token = await getAccessToken(clientId, clientSecret);
  const query = encodeURIComponent(song);
  const url = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`;

  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Spotify API error: ${response.statusText}`);
  }

  const data = await response.json();
  const items = data.tracks?.items;
  if (items && items.length > 0) {
    const albumImages = items[0].album?.images;
    if (albumImages && albumImages.length > 0) {
      return albumImages[0].url;
    }
  }
  throw new Error(`No album cover found for "${song}"`);
}
