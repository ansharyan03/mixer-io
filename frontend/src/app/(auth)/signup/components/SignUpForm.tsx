"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SignInWithGoogleButton from "../../login/components/SignInWithGoogleButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Using react-icons for password toggle icons
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { signup } from "@/lib/auth-actions";

export function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Card className="mx-auto bg-neutral-900 mb-6 border border-orange-600 max-w-lg p-8 rounded-lg">
      <CardHeader>
        <CardTitle className="text-white text-3xl">Create an Account</CardTitle>
        <CardDescription className="text-neutral-400 text-lg mt-1">
          Get free beta access now
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form action="">
          <div className="grid gap-6">
            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name" className="text-neutral-300">
                  First name
                </Label>
                <Input
                  id="first-name"
                  name="first-name"
                  placeholder="Max"
                  required
                  className="bg-neutral-800 text-white placeholder-neutral-600 rounded-md p-3"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name" className="text-neutral-300">
                  Last name
                </Label>
                <Input
                  id="last-name"
                  name="last-name"
                  placeholder="Robinson"
                  required
                  className="bg-neutral-800 text-white placeholder-neutral-600 rounded-md p-3"
                />
              </div>
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-neutral-300">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@gmail.com"
                required
                className="bg-neutral-800 text-white placeholder-neutral-600 rounded-md p-3"
              />
            </div>

            {/* Password with visibility toggle */}
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-neutral-300">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="bg-neutral-800 text-white placeholder-neutral-600 rounded-md p-3 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-neutral-400"
                >
                  {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              formAction={signup}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-md transition"
            >
              Submit
            </Button>
          </div>
        </form>

        <CardDescription className="text-neutral-500 text-center mt-4">
          Look for a confirmation email
        </CardDescription>

        <div className="mt-4 mb-1 text-center text-neutral-300">
          Already have an account?{' '}
          <Link href="/login" className="text-orange-600 hover:underline">
            Sign in
          </Link>
        </div>
        <div className="flex mb-4 items-center">
        <hr className="flex-grow border-t border-neutral-700" />
  <span className="px-3 text-neutral-500">or</span>
  <hr className="flex-grow border-t border-neutral-700" />
        </div>
        <SignInWithGoogleButton/>
              </CardContent>
    </Card>
  );
}
