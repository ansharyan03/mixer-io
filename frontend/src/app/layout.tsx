"use client";
import "./globals.css";
import React, { useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const supabase = useMemo(() => createClient(), []);
  const path = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.subscription?.unsubscribe();
    };
  }, [supabase]);

  let backgroundClass = "";
  if (path === "/login") {
    backgroundClass =
      "bg-gradient-to-r from-pink-400 via-orange-400 to-orange-500 backdrop-blur-md";
  } else if (user) {
    backgroundClass =
      "bg-gradient-to-r from-pink-400 via-orange-400 to-orange-500";
  } else {
    backgroundClass =
      "bg-gradient-to-r from-pink-400 via-orange-400 to-orange-500";
  }

  return (
    <html lang="en">
      <head>
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Oswald&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${backgroundClass} transition-colors duration-300 min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
