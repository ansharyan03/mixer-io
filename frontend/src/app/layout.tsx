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

  // Set background based on the route and authentication state.
  let backgroundClass = "";
  if (path === "/login") {
    backgroundClass = "bg-gradient-to-r from-pink-400/80 via-orange-400/80 to-orange-500/80 backdrop-blur-md";
  } else if (user) {
    backgroundClass = "bg-gradient-to-r from-pink-400 via-orange-400 to-orange-500";
  } else {
    backgroundClass = "bg-gradient-to-r from-pink-400 via-orange-300 to-orange-500";
  }

  return (
    <html lang="en">
      <head>
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Shrikhand&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${backgroundClass} transition-colors duration-300 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
