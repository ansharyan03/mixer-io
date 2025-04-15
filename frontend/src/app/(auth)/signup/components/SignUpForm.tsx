import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signup } from "@/lib/auth-actions";

export function SignUpForm() {
  return (
    <Card className="mx-auto font-sans font-bold bg-white max-w-lg p-8">
      <CardHeader>
        <CardTitle className="text-3xl">Sign Up</CardTitle>
        <CardDescription className="text-lg mt-1">
          Sign up for unlimited mashes!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action="">
          <div className="grid gap-6">
            {/* First and Last name fields side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-3">
                <Label htmlFor="first-name" className="text-xl">
                  First name
                </Label>
                <Input
                  name="first-name"
                  id="first-name"
                  placeholder="Max"
                  required
                  className="text-xl p-3"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="last-name" className="text-xl">
                  Last name
                </Label>
                <Input
                  name="last-name"
                  id="last-name"
                  placeholder="Robinson"
                  required
                  className="text-xl p-3"
                />
              </div>
            </div>
            {/* Email field */}
            <div className="grid gap-3">
              <Label htmlFor="email" className="text-xl">
                Email
              </Label>
              <Input
                name="email"
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                className="text-xl p-3"
              />
            </div>
            {/* Password field */}
            <div className="grid gap-3">
              <Label htmlFor="password" className="text-xl">
                Password
              </Label>
              <Input
                name="password"
                id="password"
                type="password"
                required
                className="text-xl p-3"
              />
            </div>
            {/* Submit button */}
            <Button
              type="submit"
              formAction={signup}
              className="w-full bg-pink-500 text-white py-4 rounded-md border border-pink-600 hover:bg-pink-600 transition"
            >
              Create an account
            </Button>
          </div>
        </form>
        <CardDescription className="text-md flex justify-center mt-2">
            Look for a confirmation email        
        </CardDescription>
        <div className="mt-6 text-center text-l">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
