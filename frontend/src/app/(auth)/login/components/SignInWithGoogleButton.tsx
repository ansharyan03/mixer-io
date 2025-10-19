"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/lib/auth-actions";
import Image from "next/image";

const SignInWithGoogleButton: React.FC = () => {
  return (
    <Button
      type="button"
      className="w-full flex items-center justify-center px-6 py-4 bg-transparent border-2 border-orange-600 text-orange-600 rounded-md hover:bg-white hover:text-black hover:border-black transition-all duration-200 space-x-2"
      onClick={signInWithGoogle}
    >
      {/* Google logo */}
      <Image
        src="/google.svg"
        alt="Google logo"
        width={18}
        height={18}
        className="object-contain"
      />
      <span>Login with Google</span>
    </Button>
  );
};

export default SignInWithGoogleButton;
