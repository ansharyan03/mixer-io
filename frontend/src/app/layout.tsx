"use client";
import "./globals.css";
import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  // Create a stable client instance.
  const supabase = useMemo(() => createClient(), []);
  // Grab the current route.
  const path = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();

    // Subscribe to auth state changes.
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`Auth event: ${event}`, session);
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription?.unsubscribe();
    };
  }, [supabase]);

  // Tie the background based on both the route and the authentication state.
  let backgroundClass = "";
  if (path === "/login") {
    backgroundClass = "bg-gradient-to-r from-blue-500/80 via-purple-500/80 to-pink-500/80 backdrop-blur-md"; // Login route gets a white background.
  } else if (user) {
    backgroundClass = "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"; // Authenticated gradient.
  } else {
    backgroundClass = "bg-gradient-to-r from-pink-300 via-orange-300 to-orange-400"; // Unauthenticated gradient.
  }

  return (
    <html lang="en">
      <body className={`${backgroundClass} min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
