"use client";
import LoginButton from "@/components/LoginLogoutButton";
import SongMashForm from "../../components/SongInput";
import UserGreetText from "@/components/UserGreetText";
import HelpModal from "@/components/HelpModal";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3">
        <Link href="/">
        <div className="transform text-orange-600 font-bold skew-x-[-10deg] text-3xl md:text-4xl">
          Tangle
        </div>
        </Link>
        
        <div className="flex items-center space-x-4">
          <LoginButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-white px-4">
        {/* Album covers (unchanged) */}
        <img
          src="/1989.png"
          alt="1989 Album Cover"
          className="absolute hidden sm:block top-50 left-50 w-80 h-80 opacity-30 pointer-events-none -z-10"
        />
        <img
          src="/abbey_road.jpeg"
          alt="abbey-road"
          className="absolute hidden sm:block bottom-40 right-50 w-100 h-100 opacity-30 pointer-events-none -z-10"
        />
        <img
          src="/pink_floyd.jpg"
          alt="pink_floyd"
          className="absolute hidden sm:block top-20 right-150 w-100 h-100 opacity-30 pointer-events-none -z-10"
        />
        <img
          src="/tyler.jpg"
          alt="pink_floyd"
          className="absolute hidden sm:block bottom-20 left-150 w-70 h-70 opacity-30 pointer-events-none -z-10"
        />
        <img
                  src="/abbey_road.jpeg"

          alt="1989 Album Cover"
          className="absolute top-30 sm:hidden left-10 w-50 h-50 opacity-30 pointer-events-none -z-10"
        />
        <img
          src="/1989.png"
          alt="abbey-road"
          className="absolute sm:hidden bottom-20 right-10 w-50 h-50 opacity-30 pointer-events-none -z-10"
        />

        {/* Heading with letter-by-letter “one click” animation */}
        <h1 className="text-6xl sm:text-8xl md:text-9xl mb-10 font-inter font-bold font-anton text-center">
          <UserGreetText /> Mix two songs with <br />
          <span className="inline-block">
            {"one click".split("").map((char, idx) => (
              <span
                key={idx}
                className="inline-block one-click-letter"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </span>
        </h1>

        {/* Button (more padding-y, less padding-x on mobile) */}
        <div className="!text-orange-600 !font-bold">
          <Button
            asChild
            className="px-6 py-6 sm:px-10 sm:py-8 group bg-orange-600 text-neutral-900 text-2xl sm:text-3xl font-bold rounded-2xl border-2 border-orange-600 hover:bg-transparent hover:text-orange-600 transition-all duration-300"
          >
            <button onClick={() => router.push("/signup")}>
              <span className="inline-flex items-center gap-2">
                Get started for free
                <span className="transform transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </span>
            </button>
          </Button>
        </div>

        {/* Letter-by-letter color animation */}
        <style jsx>{`
          .one-click-letter {
            color: white;
            animation: toOrange 0.3s forwards;
          }
          @keyframes toOrange {
            to {
              color: #ea580c
;
            }
          }
        `}</style>
      </main>
    </div>
  );
}
