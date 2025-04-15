"use client";
import LoginButton from "@/components/LoginLogoutButton";
import SongMashForm from "../../components/song_input";
import UserGreetText from "@/components/UserGreetText";
import HelpModal from "@/components/HelpModal";

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3">
        <div className="text-white transform skew-x-[-10deg] text-3xl md:text-4xl">
          Tangle
        </div>
        <div className="flex items-center space-x-4">
          <HelpModal />
          <LoginButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-white px-4">
        {/* Responsive Heading: 4xl on mobile, scaling to 7xl on medium+ screens */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-inter mb-10 font-bold font-anton text-center">
          <UserGreetText /> Mix Any Two Songs!
        </h1>

        {/* SongMashForm: Stack vertically on mobile, row on md+ */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 w-full max-w-4xl">
          <SongMashForm />
        </div>
      </main>
    </div>
  );
}
