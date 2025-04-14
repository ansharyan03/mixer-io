"use client";
import { useState, useRef, useEffect } from "react";

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
  const [result, setResult] = useState<TwoSongsResponse | null>(null);

  // Default width for auto-sizing inputs (in pixels)
  const defaultWidth = 150;
  // Refs for measuring text width
  const measureRef1 = useRef<HTMLSpanElement>(null);
  const measureRef2 = useRef<HTMLSpanElement>(null);
  // State for dynamic widths
  const [inputWidth1, setInputWidth1] = useState(defaultWidth);
  const [inputWidth2, setInputWidth2] = useState(defaultWidth);

  // Auto-resize inputs based on content.
  useEffect(() => {
    if (measureRef1.current) {
      setInputWidth1(measureRef1.current.offsetWidth + 10);
    }
  }, [song1]);

  useEffect(() => {
    if (measureRef2.current) {
      setInputWidth2(measureRef2.current.offsetWidth + 10);
    }
  }, [song2]);

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
        // These details will be shown if returned by your API.
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

  // Handle mash button action.
  const handleMash = async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/search_two", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ song1, song2 }),
      });
      const data: TwoSongsResponse = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center px-4">
      {/* Responsive Form: column on mobile, row on md+ */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row items-center mt-6 gap-4 md:gap-20 w-full max-w-4xl"
      >
        {/* Song 1 input */}
        <div className="relative flex-1">
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
            style={{ width: inputWidth1 }}
            className={`w-full bg-transparent outline-none border-b-2 border-white text-5xl 
                       focus:border-gray-300 text-center placeholder-gray-300 
                       ${song1 ? "text-white" : "text-gray-300"}`}
          />
        </div>

        {/* "View Song Details" button */}
        <button
          type="submit"
          className="px-6 py-2 border border-white text-2xl text-white rounded-full 
                     transition-colors hover:bg-white hover:text-pink-500"
        >
          View Song Details
        </button>

        {/* Song 2 input */}
        <div className="relative flex-1">
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
            style={{ width: inputWidth2 }}
            className={`w-full bg-transparent outline-none border-b-2 border-white text-5xl 
                       focus:border-gray-300 text-center placeholder-gray-300 
                       ${song2 ? "text-white" : "text-gray-300"}`}
          />
        </div>
      </form>

      {/* Album Covers & Mash Button Section (always side by side) */}
      {(cover1 || cover2) && (
        <div className="mt-10 mb-10 w-full max-w-4xl">
          <div className="flex flex-row items-center gap-4 md:gap-8 justify-center">
            {/* Song 1 Album Cover Container */}
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

            {/* Mash Button with Hover Effect */}
            <button
  onClick={handleMash}
  className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-white transition-all hover:shadow-xl hover:scale-105"
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
      className="w-6 h-6 object-contain"
    />
  )}
</button>

            {/* Song 2 Album Cover Container */}
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

      {/* Display mash result links if available */}
      {result && (
        <div className="mt-10 text-center">
          <p className="mb-2">
            <a
              href={result.link1}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 underline"
            >
              Song 1 Result
            </a>
          </p>
          <p>
            <a
              href={result.link2}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 underline"
            >
              Song 2 Result
            </a>
          </p>
        </div>
      )}

      {/* Error message display */}
      {error && <p className="mt-4 text-red-500">{error}</p>}
    </div>
  );
}
