'use client';
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoginButton from "@/components/LoginLogoutButton";
import SongMashForm from "@/components/song_input";

const LogoutPage =  () => {
    const router = useRouter();
    useEffect(() => {
        setTimeout(()=> router.push("/"), 2000);
    }, []);
  return <div className="flex flex-col h-screen ">
  <div className="flex mt-3 justify-between">
  <div className="ml-5 font-mono text-white text-3xl">
    SongMash
  </div>
  <div className="mr-5">
  <LoginButton/>

  </div>
  </div>


  <div className="flex-1 flex flex-col items-center text-white justify-center ">
    <h1 className="text-7xl mb-10 font-mono">Mash any two songs with one click.</h1>
    <h1 className="text-4xl font-mono mb-10">Enter two songs and let AI create a real mashup for you</h1>

    <div className="flex items-center justify-center gap-8">
      <SongMashForm />


    </div>
  </div>
</div>
};

export default LogoutPage;