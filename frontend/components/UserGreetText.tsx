"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

const UserGreetText = () => {
  const [user, setUser] = useState<User | null>(null);
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

  if (!user) return null;

  const firstName =
    user.user_metadata?.first_name ||
    user.user_metadata?.full_name?.split(" ")[0] ||
    "user";

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <span className="inline-block">
      <strong>{capitalize(firstName)}, </strong>
    </span>
  );
};

export default UserGreetText;
