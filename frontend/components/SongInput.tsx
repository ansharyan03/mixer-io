"use client";
import { useState, useRef, useEffect } from "react";
import WaveformPlayer from "./AudioPlayer"; // Adjust path if needed

interface TwoSongsResponse {
  link1: string;
  link2: string;
}

interface SongDetail {
  officialSong: string;
  artist: string;
}

export default function SongMashForm() {
  const [song1, setSong1] = useState("");
  const [song2, setSong2] = useState("");
  const [cover1, setCover1] = useState("");
  const [cover2, setCover2] = useState("");
  const [songDetail1, setSongDetail1] = useState<SongDetail | null>(null);
  const [songDetail2, setSongDetail2] = useState<SongDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mashSuccessful, setMashSuccessful] = useState(false);
  const [mashBuffer, setMashBuffer] = useState<Uint8Array | null>(null);

  // Refs for measuring text width (invisible spans)
  const measureRef1 = useRef<HTMLSpanElement>(null);
  const measureRef2 = useRef<HTMLSpanElement>(null);
  // Use one state value to store the max measured width
  const [maxInputWidth, setMaxInputWidth] = useState(150);

  // Whenever either song changes, recalc the maximum width.
  useEffect(() => {
    const width1 = measureRef1.current ? measureRef1.current.offsetWidth + 10 : 150;
    const width2 = measureRef2.current ? measureRef2.current.offsetWidth + 10 : 150;
    setMaxInputWidth(Math.max(width1, width2));
  }, [song1, song2]);

  // Handle form submission: fetch album covers and song details.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (song1.trim() && song2.trim()) {
      setError(null);
      try {
        const response = await fetch("/api/spotify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ song1, song2 }),
        });
        if (!response.ok) {
          throw new Error("Failed to fetch album covers and song details");
        }
        const data = await response.json();
        setCover1(data.cover1);
        setCover2(data.cover2);
        setSongDetail1({
          officialSong: data.officialSong1,
          artist: data.artist1,
        });
        setSongDetail2({
          officialSong: data.officialSong2,
          artist: data.artist2,
        });
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  // Helper function: converts a ReadableStream to a Uint8Array.
  async function arrayStreamToUint8Array(
    stream: ReadableStream<Uint8Array>
  ): Promise<Uint8Array> {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
      }
    }
    const totalLength = chunks.reduce((acc, curr) => acc + curr.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    return result;
  }

  // Handle mash button action.
  // 1. Post to backend (NEXT_PUBLIC_BACKEND_URL) to get video links.
  // 2. Then post those links to Tangle API (NEXT_PUBLIC_TANGLE_URL) to get a WAV stream.
  // 3. Convert the stream into a Uint8Array and update state.
  const handleMash = async () => {
    setError(null);
    setLoading(true);
    setMashSuccessful(false);
    try {
      // Step 1: Get video links from the backend.
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error("Backend URL not defined");
      }
      const backendResponse = await fetch(`${backendUrl}/search_two`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          song1: {
            officialSong: songDetail1?.officialSong || "",
            artist: songDetail1?.artist || "",
          },
          song2: {
            officialSong: songDetail2?.officialSong || "",
            artist: songDetail2?.artist || "",
          },
        }),
      });
      if (!backendResponse.ok) {
        throw new Error("Failed to fetch video links from the backend");
      }
      const backendData: TwoSongsResponse = await backendResponse.json();

      // Step 2: Post the links to Tangle API.
      const tangleUrl = process.env.NEXT_PUBLIC_TANGLE_URL;
      if (!tangleUrl) {
        throw new Error("Tangle URL not defined");
      }
      const tangleResponse = await fetch(`${tangleUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url1: backendData.link1,
          url2: backendData.link2,
        }),
      });
      if (!tangleResponse.ok) {
        throw new Error("Failed to post links to Tangle API");
      }
      if (!tangleResponse.body) {
        throw new Error("No response body from Tangle API");
      }
      const arrayBuffer = await tangleResponse.arrayBuffer();
      const uint = new Uint8Array(arrayBuffer);
      console.log("Mash Buffer:", uint);
      setMashBuffer(uint);
      setMashSuccessful(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center px-4">
      {/* Form Section: The inputs stack vertically on mobile and align side by side on desktop */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center mt-6 gap-4 w-full max-w-4xl"
      >
        {/* Input fields container */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-20 w-full">
          {/* Song 1 input */}
          <div className="relative flex justify-center flex-1">
            <span
              ref={measureRef1}
              className="absolute text-gray-300 invisible whitespace-pre text-5xl"
            >
              {song1 || "Song 1"}
            </span>
            <input
              type="text"
              value={song1}
              onChange={(e) => setSong1(e.target.value)}
              placeholder="Song 1"
              style={{ width: maxInputWidth, maxWidth: "100%" }}
              className={`w-full bg-transparent outline-none border-b-2 border-white text-5xl 
                         focus:border-gray-300 text-center placeholder-gray-300 ${
                           song1 ? "text-white" : "text-gray-300"
                         }`}
            />
          </div>
          {/* Song 2 input */}
          <div className="relative flex justify-center flex-1">
            <span
              ref={measureRef2}
              className="absolute text-gray-300 invisible whitespace-pre text-5xl"
            >
              {song2 || "Song 2"}
            </span>
            <input
              type="text"
              value={song2}
              onChange={(e) => setSong2(e.target.value)}
              placeholder="Song 2"
              style={{ width: maxInputWidth, maxWidth: "100%" }}
              className={`w-full bg-transparent outline-none border-b-2 border-white text-5xl 
                         focus:border-gray-300 text-center placeholder-gray-300 ${
                           song2 ? "text-white" : "text-gray-300"
                         }`}
            />
          </div>
        </div>
        {/* "View Song Details" button always appears below the inputs */}
        <button
          type="submit"
          className="px-6 py-2 border border-white text-2xl text-white rounded-full 
                     transition-colors hover:bg-white hover:text-pink-500 mt-4"
        >
          View Song Details
        </button>
      </form>

      {/* Album Covers & Mash Button Section */}
      {(cover1 || cover2) && (
        <div className="mt-10 mb-10 w-full max-w-4xl">
          <div className="flex flex-row items-center gap-4 md:gap-8 justify-center">
            {/* Song 1 Album Cover */}
            <div className="relative inline-block text-center">
              <div className="relative w-32 sm:w-56 h-32 sm:h-56 bg-white shadow-lg rounded-xl overflow-hidden">
                {cover1 ? (
                  <img
                    src={cover1}
                    alt="Album cover for Song 1"
                    className="w-full h-full object-cover blur-[2px] shadow-xl"
                  />
                ) : (
                  <p className="text-xl">No cover found for Song 1</p>
                )}
                {songDetail1 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-lg sm:text-2xl font-bold text-white drop-shadow-[2px_2px_4px_rgba(0,0,0,0.9)]">
                      {songDetail1.officialSong}
                    </p>
                    <p className="text-sm sm:text-xl text-white drop-shadow-[2px_2px_4px_rgba(0,0,0,0.9)]">
                      {songDetail1.artist}
                    </p>
                  </div>
                )}
              </div>
            </div>
            {/* Mash Button */}
            <div className="flex items-center justify-center">
              <button
                onClick={handleMash}
                className="flex items-center justify-center w-12 md:w-16 h-12 md:h-16 rounded-full bg-white transition-all hover:shadow-xl hover:scale-105"
              >
                {loading ? (
                  <img
                    src="/vinyl.png"
                    alt="Vinyl"
                    className="w-full h-full animate-spin object-contain"
                  />
                ) : (
                  <img
                    src="/shuffle.png"
                    alt="Shuffle"
                    className="w-6 md:w-8 h-6 md:h-8 object-contain"
                  />
                )}
              </button>
            </div>
            {/* Song 2 Album Cover */}
            <div className="relative inline-block text-center">
              <div className="relative w-32 sm:w-56 h-32 sm:h-56 bg-white shadow-lg rounded-xl overflow-hidden">
                {cover2 ? (
                  <img
                    src={cover2}
                    alt="Album cover for Song 2"
                    className="w-full h-full object-cover blur-[2px] shadow-xl"
                  />
                ) : (
                  <p className="text-xl">No cover found for Song 2</p>
                )}
                {songDetail2 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-lg sm:text-2xl font-bold text-white drop-shadow-[2px_2px_4px_rgba(0,0,0,0.9)]">
                      {songDetail2.officialSong}
                    </p>
                    <p className="text-sm sm:text-xl text-white drop-shadow-[2px_2px_4px_rgba(0,0,0,0.9)]">
                      {songDetail2.artist}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Render the WaveformPlayer if a mash has been created */}
      {mashSuccessful && mashBuffer && (
        <div className="mt-10 text-center">
          <WaveformPlayer audioBuffer={mashBuffer} />
        </div>
      )}

      {/* Display error message if available */}
      {error && <p className="mt-4 text-red-500">{error}</p>}
    </div>
  );
}
