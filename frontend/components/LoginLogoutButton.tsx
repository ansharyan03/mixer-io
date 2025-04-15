"use client";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { signout } from "@/lib/auth-actions";

const LoginButton = () => {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  if (user) {
    return (
      <Button
    className="px-8 py-3 bg-transparent text-white text-xl font-semibold rounded-full border border-2 border-white hover:bg-white hover:text-pink-600 transition-colors duration-200 shadow-lg"
        onClick={() => {
          signout();
          setUser(null);
        }}
      >
        Log out
      </Button>
    );
  }

  return (
    <Button
    className="px-8 py-3 bg-transparent text-white text-xl font-semibold rounded-full border border-2 border-white hover:bg-white hover:text-pink-600 transition-colors duration-200 shadow-lg"
    onClick={() => router.push("/login")}
  >
    Login
  </Button>
  
  );
};

export default LoginButton;
