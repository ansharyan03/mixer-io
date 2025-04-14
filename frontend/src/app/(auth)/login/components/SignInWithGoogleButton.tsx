"use client";
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/lib/auth-actions";
import React from "react";

const SignInWithGoogleButton = () => {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full flex items-center justify-center space-x-2 border border-gray-300 hover:bg-gray-100 transition-colors"
      onClick={() => {
        signInWithGoogle();
      }}
    >
      {/* Small inline Google SVG logo */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 48 48"
        className="fill-current"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M44.5 20H24v8.5h11.9c-1.9 5.5-7.3 9.5-11.9 9.5-7 0-12.6-5.7-12.6-12.6S17 12.8 24 12.8c3.2 0 6.1 1.2 8.3 3.2l6-6C35.4 7.7 30.1 5 24 5 12 5 3 14 3 26s9 21 21 21 21-9 21-21c0-1.4-.1-2.8-.5-4z" />
      </svg>
      <span>Login with Google</span>
    </Button>
  );
};

export default SignInWithGoogleButton;
