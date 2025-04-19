import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { song1, song2 } = await request.json();

    if (!song1 || !song2) {
      return NextResponse.json(
        { error: "Both song1 and song2 are required." },
        { status: 400 }
      );
    }
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const response = await (await fetch(`${backendUrl}/search_two`, {
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
      })).json();

    return NextResponse.json({
        link1: response.link1,
        link2: response.link2
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
