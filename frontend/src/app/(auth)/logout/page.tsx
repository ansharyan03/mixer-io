'use client';
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoginButton from "@/components/LoginLogoutButton";
import SongMashForm from "@/components/SongInput";
import HelpModal from "@/components/HelpModal";
import UserGreetText from "@/components/UserGreetText";
const LogoutPage =  () => {
    const router = useRouter();
    useEffect(() => {
        setTimeout(()=> router.push("/"), 2000);
    }, []);
  return <div className="flex flex-col h-screen ">
  <div className="flex mt-3 justify-between">
  <div className="ml-5  text-white text-3xl">
    Tangle
  </div>
  <div className="mr-5 flex">
    <div className="mr-5 mt-1">
    <HelpModal/>

    </div>
  <LoginButton/>

  </div>
  </div>


  <div className="flex-1 flex flex-col items-center text-white justify-center ">
    
    <h1 className="text-7xl font-inter mb-10 font-bold font-anton drop-shadow-[0_10px_8px_rgba(0,0,0,0.3)]"><UserGreetText/> Mix Any Two Songs!</h1>
    <div className="flex items-center justify-center gap-8">
      <SongMashForm />


    </div>
  </div>
</div>
};

export default LogoutPage;