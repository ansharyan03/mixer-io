"use client";
import { useState } from "react";

interface SongInfo {
  albumCover: string;
  officialName: string;
}

interface TwoSongsResponse {
  link1: string;
  link2: string;
}

export default function SongMashForm() {
  // Input states
  const [song1, setSong1] = useState("");
  const [song2, setSong2] = useState("");

  // Song info states
  const [song1Info, setSong1Info] = useState<SongInfo | null>(null);
  const [song2Info, setSong2Info] = useState<SongInfo | null>(null);

  // Loading states for viewing and mashing
  const [loadingView1, setLoadingView1] = useState(false);
  const [loadingView2, setLoadingView2] = useState(false);
  const [loadingMash, setLoadingMash] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TwoSongsResponse | null>(null);

  // Handler to view song info (calls secure API route)
  const viewSongInfo = async (song: string, setter: (info: SongInfo | null) => void, setLoading: (b: boolean) => void) => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/spotify/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ song }),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch song info");
      }
      const data = await response.json();
      setter({ albumCover: data.albumCover, officialName: data.officialName });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handler for mash operation (calls FastAPI endpoint)
  const handleMash = async () => {
    setError(null);
    setLoadingMash(true);
    try {
      const response = await fetch("http://localhost:8000/search_two", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ song1, song2 }),
      });
      if (!response.ok) {
        throw new Error("Failed to mash songs");
      }
      const data: TwoSongsResponse = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingMash(false);
    }
  };

  return (
    <div className="font-mono flex flex-col items-center space-y-8">
      <div className="flex flex-col md:flex-row items-center gap-8 mt-8">
        {/* Song 1 Input */}
        <div className="flex flex-col items-center">
          <input
            type="text"
            value={song1}
            onChange={(e) => { setSong1(e.target.value); setSong1Info(null); setResult(null); }}
            placeholder="Song 1"
            className="bg-transparent outline-none border-b-2 border-gray-300 text-5xl focus:border-gray-700 placeholder-white"
          />
          <button
            onClick={() => viewSongInfo(song1, setSong1Info, setLoadingView1)}
            className="mt-2 px-4 py-2 bg-white text-purple-400 text-xl rounded-full transition-colors hover:bg-purple-400 hover:text-white"
          >
            {loadingView1 ? "Loading..." : "View"}
          </button>
          {song1Info && (
            <div className="mt-4 text-center">
              <img
                src={song1Info.albumCover}
                alt="Album cover for Song 1"
                className="rounded-4xl w-[74px] h-[74px] object-cover mx-auto"
              />
              <p className="mt-2 text-3xl">{song1Info.officialName}</p>
            </div>
          )}
        </div>

        {/* Song 2 Input */}
        <div className="flex flex-col items-center">
          <input
            type="text"
            value={song2}
            onChange={(e) => { setSong2(e.target.value); setSong2Info(null); setResult(null); }}
            placeholder="Song 2"
            className="bg-transparent outline-none border-b-2 border-gray-300 text-5xl focus:border-gray-700 placeholder-white"
          />
          <button
            onClick={() => viewSongInfo(song2, setSong2Info, setLoadingView2)}
            className="mt-2 px-4 py-2 bg-white text-purple-400 text-xl rounded-full transition-colors hover:bg-purple-400 hover:text-white"
          >
            {loadingView2 ? "Loading..." : "View"}
          </button>
          {song2Info && (
            <div className="mt-4 text-center">
              <img
                src={song2Info.albumCover}
                alt="Album cover for Song 2"
                className="rounded-4xl w-[74px] h-[74px] object-cover mx-auto"
              />
              <p className="mt-2 text-3xl">{song2Info.officialName}</p>
            </div>
          )}
        </div>
      </div>

      {/* Mash Button */}
      {song1Info && song2Info && (
        <div className="mt-8">
          <button
            onClick={handleMash}
            className="px-4 py-2 bg-white text-purple-400 text-3xl rounded-full transition-colors hover:bg-purple-400 hover:text-white shadow-lg"
          >
            {loadingMash ? "Mashing..." : "Mash!"}
          </button>
        </div>
      )}

      {/* FastAPI Result Links */}
      {result && (
        <div className="mt-8 text-center">
          <p>
            <a href={result.link1} target="_blank" rel="noopener noreferrer" className="text-indigo-600">
              Song 1 Result
            </a>
          </p>
          <p>
            <a href={result.link2} target="_blank" rel="noopener noreferrer" className="text-indigo-600">
              Song 2 Result
            </a>
          </p>
        </div>
      )}

      {error && <p className="mt-4 text-red-500">{error}</p>}
    </div>
  );
}
