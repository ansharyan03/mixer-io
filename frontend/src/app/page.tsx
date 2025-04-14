"use client";
import PlaybackWidget from "@/components/playback";
import SongMashForm from "../../components/song_input";


export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 ">
      <div className="mt-3 ml-5 font-mono text-white text-3xl">
        SongMash
      </div>

      <div className="flex-1 flex flex-col items-center text-white justify-center ">
        <h1 className="text-7xl mb-10 font-mono">Mash any two songs with one click.</h1>
        <h1 className="text-4xl font-mono mb-10">Enter two songs and let AI create a real mashup for you</h1>

        <div className="flex items-center justify-center gap-8">
          <SongMashForm />
        </div>
        <div className="flex items-center justify-center gap-8">
          <PlaybackWidget/>
        </div>
      </div>
    </div>
  );
}
