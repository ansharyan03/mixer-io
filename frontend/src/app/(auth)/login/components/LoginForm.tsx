import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login } from "@/lib/auth-actions"
import SignInWithGoogleButton from "./SignInWithGoogleButton"

export function LoginForm() {
  return (
    <Card className="mx-auto bg-white max-w-lg p-8">
      <CardHeader>
        <CardTitle className="text-3xl">Login</CardTitle>
        <CardDescription className="text-lg">
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action="">
          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email" className="text-xl">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                className="text-xl p-3"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="password" className="text-xl">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="text-xl p-3"
              />
            </div>
            <Button
              type="submit"
              formAction={login}
              className="w-full bg-pink-500 text-white py-4 rounded-md hover:bg-pink-600 transition"
            >
              Login
            </Button>
            <SignInWithGoogleButton />
          </div>
        </form>
        <div className="mt-6 text-center text-l">
          Don't have an account?{" "}
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
