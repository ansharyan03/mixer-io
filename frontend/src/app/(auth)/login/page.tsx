import Link from "next/link"
import LoginButton from "@/components/LoginLogoutButton"
import { LoginForm } from "./components/LoginForm"
export default function Page() {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3">
        <Link href="/">
        <div className="transform text-orange-600 font-bold skew-x-[-10deg] text-3xl md:text-4xl">
          Tangle
        </div>
        </Link>
        <img
          src="/1989.png"
          alt="1989 Album Cover"
          className="absolute hidden sm:block top-50 left-50 w-80 h-80 opacity-20 pointer-events-none -z-10"
        />
        <img
          src="/abbey_road.jpeg"
          alt="abbey-road"
          className="absolute hidden sm:block bottom-40 right-50 w-100 h-100 opacity-20 pointer-events-none -z-10"
        />
        <img
          src="/pink_floyd.jpg"
          alt="pink_floyd"
          className="absolute hidden sm:block top-20 right-150 w-100 h-100 opacity-20 pointer-events-none -z-10"
        />
        <img
          src="/tyler.jpg"
          alt="pink_floyd"
          className="absolute hidden sm:block bottom-20 left-150 w-70 h-70 opacity-20 pointer-events-none -z-10"
        />
        

        <div className="flex items-center space-x-4">
          <LoginButton />
        </div>
      </header>

      <div className="w-full flex mx-auto mt-15 items-center justify-center max-w-sm">     
        <LoginForm/>
      </div>
    </div>
  )
}
