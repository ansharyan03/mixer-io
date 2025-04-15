"use client";
import { useState, useRef, useEffect } from "react";
import { Readable } from "stream";

interface TwoSongsResponse {
  link1: string;
  link2: string;
}

interface SongMashFormProps {
  setAudioBuffer: (buffer: Uint8Array) => void;
  setDisplayTitle: (title: string) => void;
}

export default function SongMashForm({ setAudioBuffer, setDisplayTitle }: SongMashFormProps) {
  const [step, setStep] = useState(1);
  const [song1, setSong1] = useState("");
  const [song2, setSong2] = useState("");
  const [cover1, setCover1] = useState("");
  const [cover2, setCover2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TwoSongsResponse | null>(null);

  const defaultWidth = 150;
  const measureRef1 = useRef<HTMLSpanElement>(null);
  const measureRef2 = useRef<HTMLSpanElement>(null);
  const [inputWidth1, setInputWidth1] = useState(defaultWidth);
  const [inputWidth2, setInputWidth2] = useState(defaultWidth);

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

  async function arrayStreamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));
  }

  const handleSong1Submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (song1.trim()) {
      setStep(2);
    }
  };

  const handleSong2Submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (song2.trim()) {
      setStep(3);
      setError(null);
      try {
        const response = await fetch("/api/spotify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ song1, song2 }),
        });
        if (!response.ok) throw new Error("Failed to fetch album covers");
        const data = await response.json();
        setCover1(data.cover1);
        setCover2(data.cover2);
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

    const handleMash = async () => {
      setError(null);
      setLoading(true);
      try {
      
        const res = await fetch("/piano.wav");
        const arrayBuffer = await res.arrayBuffer();
        const mockBuffer = new Uint8Array(arrayBuffer);
    
      
        setAudioBuffer(mockBuffer);
        setDisplayTitle(`${song1} x ${song2}`);
      } catch (err: any) {
        setError("Failed to load test audio file");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    


  return (
    <div className="flex flex-col items-center">
      {step === 1 && (
        <form onSubmit={handleSong1Submit} className="flex flex-col gap-4 mt-8 items-center">
          <span ref={measureRef1} className="absolute invisible whitespace-pre text-5xl">
            {song1 || "Song 1"}
          </span>
          <input
            type="text"
            value={song1}
            onChange={(e) => setSong1(e.target.value)}
            placeholder="Song 1"
            style={{ width: inputWidth1 }}
            className="bg-transparent outline-none border-b-2 border-gray-300 text-5xl focus:border-gray-700 placeholder-white"
          />
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleSong2Submit} className="flex flex-col gap-4 mt-8 items-center">
          <span ref={measureRef2} className="absolute invisible whitespace-pre text-5xl">
            {song2 || "Song 2"}
          </span>
          <input
            type="text"
            value={song2}
            onChange={(e) => setSong2(e.target.value)}
            placeholder="Song 2"
            style={{ width: inputWidth2 }}
            className="bg-transparent outline-none border-b-2 border-gray-300 text-5xl focus:border-gray-700 placeholder-white"
          />
        </form>
      )}

      {step === 3 && (
        <>
          <div className="mt-8 text-center font-mono flex gap-8">
            <div className="flex flex-col">
              <p className="text-5xl mb-4">{song1}</p>
              {cover1 ? (
                <img src={cover1} alt="Album cover for Song 1" className="mt-2 rounded-4xl w-74 h-74 object-cover mx-auto" />
              ) : (
                <p className="text-xl">No cover found for Song 1</p>
              )}
            </div>
            <div className="flex self-center items-center">
              <button
                onClick={handleMash}
                className="mt-4 px-4 py-2 bg-white mr-7 ml-7 h-20 w-35 text-purple-400 text-3xl rounded-full transition-colors"
              >
                {loading ? "Mashing" : "Mash!"}
              </button>
            </div>
            <div className="flex flex-col">
              <p className="text-5xl mb-4">{song2}</p>
              {cover2 ? (
                <img src={cover2} alt="Album cover for Song 2" className="mt-2 w-74 h-74 rounded-4xl object-cover mx-auto" />
              ) : (
                <p className="text-xl">No cover found for Song 2</p>
              )}
            </div>
          </div>
        </>
      )}

      {error && <p className="mt-4 text-red-500">{error}</p>}
    </div>
  );
}
