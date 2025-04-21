import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { song1, song2 } = await request.json();
    console.log("Received songs:", song1, song2);
    if (!song1 || !song2) {
      return NextResponse.json(
        { error: "Both song1 and song2 are required." },
        { status: 400 }
      );
    }
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const response = await fetch(`${backendUrl}/search_two`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          song1: {
            officialSong: song1.officialSong || "",
            artist: song1.artist || "",
          },
          song2: {
            officialSong: song2.officialSong || "",
            artist: song2.artist || "",
          },
        }),
      });
    if (!response.ok)
        throw new Error("Failed to fetch video links from the backend");
    if (!response.body)
        throw new Error("No response body from backend");
    const responseData = await response.json();
    return NextResponse.json({
        link1: responseData.link1,
        link2: responseData.link2
    });
  } catch (error: unknown) {
    console.log((await request.json()));
    const msg =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
