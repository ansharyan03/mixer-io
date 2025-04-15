// app/api/spotify/route.ts
import { NextResponse } from "next/server";
import { getAlbumCover } from "@/components/album_cover";

export async function POST(request: Request) {
  try {
    // Parse the incoming JSON
    const { song1, song2 } = await request.json();

    // Validate inputs
    if (!song1 || !song2) {
      return NextResponse.json(
        { error: "Both song1 and song2 are required." },
        { status: 400 }
      );
    }

    // Retrieve environment variables
    const client = process.env.SPOTIFY_CLIENT;
    const secret = process.env.SPOTIFY_SECRET;
    if (!client || !secret) {
      return NextResponse.json(
        { error: "Spotify credentials are not set." },
        { status: 500 }
      );
    }

    // Get album cover details for each song
    const album1 = await getAlbumCover(song1, client, secret);
    const album2 = await getAlbumCover(song2, client, secret);

    // Return all details to the client
    return NextResponse.json({
      cover1: album1.cover,
      officialSong1: album1.officialSong,
      artist1: album1.artist,
      cover2: album2.cover,
      officialSong2: album2.officialSong,
      artist2: album2.artist,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
