"use client";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { signout } from "@/lib/auth-actions";
import type { User } from "@supabase/supabase-js";

const LoginButton = () => {
  const [user, setUser] = useState<User | null>(null);
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
  }, [supabase]);

  // Shared classes: smaller on mobile, original size from sm+
  const btnClasses =
    "px-4 py-2 sm:px-8 sm:py-6 bg-gray-100 text-neutral-900 text-sm sm:text-xl font-bold rounded-xl border border-transparent hover:border-orange-500 hover:bg-white hover:text-orange-600 transition-all duration-200";

  if (user) {
    return (
      <Button className={btnClasses} onClick={() => { signout(); setUser(null); }}>
        Log out
      </Button>
    );
  }

  return (
    <Button asChild className={`group ${btnClasses}`}>
      <button onClick={() => router.push("/login")}>
       Log in
        <span className="transform transition-transform duration-300 font-bold group-hover:translate-x-1">
          →
        </span>
      </button>
    </Button>
  );
};

export default LoginButton;
