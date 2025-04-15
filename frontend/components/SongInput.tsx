"use client";
import { useState, useRef, useEffect } from "react";
import WaveformPlayer from "./AudioPlayer"; // Adjust the path if needed

interface TwoSongsResponse {
  link1: string;
  link2: string;
}

interface SongDetail {
  officialSong: string;
  artist: string;
}
interface SongMashFormProps{
  setMashBuffer: (buffer:Uint8Array)=>void;
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

  // Helper function to read a ReadableStream into a Buffer.
  

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

  // Handle mash button action.
  // First posts to NEXT_PUBLIC_BACKEND_URL to get video links,
  // then uses those links to post to Tangle API. The Tangle API returns a stream,
  // which is read into a buffer (mashBuffer) and then passed to the WaveformPlayer.
  const handleMash = async () => {
    setError(null);
    setLoading(true);
    setMashSuccessful(false);
    try {
      // Step 1: Post to the backend to get video links.
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
            artist: songDetail1?.artist || ""
          },
          song2: {
            officialSong: songDetail2?.officialSong || "",
            artist: songDetail2?.artist || ""
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
      // Here, we assume that tangleResponse.body is a ReadableStream returning .wav data.
      if ("error" in tangleResponse.body){
        throw new Error("Failure to obtain body");
      }

      const arrayBuffer=await tangleResponse.arrayBuffer();

      const uint=new Uint8Array(arrayBuffer);

      console.log(uint);
      setMashBuffer(uint);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center px-4">
      {/* Responsive Form: Stack inputs on mobile, row on md+ */}
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
                       focus:border-gray-300 text-center placeholder-gray-300 ${
                         song1 ? "text-white" : "text-gray-300"
                       }`}
          />
        </div>

        {/* "View Song Details" button */}
        <button
          type="submit"
          className="px-6 py-2 border border-white text-2xl text-white rounded-full 
                     transition-colors hover:bg-white hover:text-pink-500 mt-4 md:mt-0"
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
                       focus:border-gray-300 text-center placeholder-gray-300 ${
                         song2 ? "text-white" : "text-gray-300"
                       }`}
          />
        </div>
      </form>

      {/* Album Covers & Mash Button Section (always side by side) */}
      {/* ... (existing album covers layout) ... */}
      {/* For brevity, this section is unchanged */}
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

      {/* Display success message with WaveformPlayer if mash is successful */}
      { mashBuffer && (
        <div className="mt-10 text-center">
          <WaveformPlayer audioBuffer={mashBuffer} />
        </div>
      )}

      {/* Display error message if available */}
      {error && <p className="mt-4 text-red-500">{error}</p>}
    </div>
  );
}
