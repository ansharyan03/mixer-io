"use client";
import React, { useState } from "react";
import PlaybackWidget from "@/components/playback";
import SongMashForm from "../../components/song_input";

export default function Home() {
  const [audioBuffer, setAudioBuffer] = useState<Uint8Array | null>(null);
  const [displayTitle, setDisplayTitle] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
      <div className="mt-3 ml-5 font-mono text-white text-3xl">SongMash</div>

      <div className="flex-1 flex flex-col items-center text-white justify-center">
        <h1 className="text-7xl mb-10 font-mono">Mash any two songs with one click.</h1>
        <h1 className="text-4xl font-mono mb-10">Enter two songs and let AI create a real mashup for you</h1>

        <div className="flex items-center justify-center gap-8">
          <SongMashForm setAudioBuffer={setAudioBuffer} setDisplayTitle={setDisplayTitle} />
        </div>

        {audioBuffer && (
          <div className="flex flex-col items-center justify-center gap-4 mt-10">
            <h2 className="text-4xl font-mono underline">{displayTitle}</h2>
            <PlaybackWidget audioBuffer={audioBuffer} />
          </div>
        )}
      </div>
    </div>
  );
}
