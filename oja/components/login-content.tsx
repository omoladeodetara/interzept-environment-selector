"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, LayoutGrid, DollarSign, Activity } from "lucide-react"
import { Button } from '@lastprice/ui'
import { Input } from '@lastprice/ui'

export function LoginContent() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle login
  }

  return (
    <div className="flex min-h-screen">
      {/* Left sidebar */}
      <div className="hidden lg:flex lg:w-[420px] flex-col bg-[#1a1a1a] text-white p-8">
        {/* Logo - vertical bars */}
        <div className="mb-auto">
          <div className="flex items-center gap-[3px] h-10">
            <div className="w-[3px] h-6 bg-white rounded-full" />
            <div className="w-[3px] h-8 bg-white rounded-full" />
            <div className="w-[3px] h-10 bg-white rounded-full" />
            <div className="w-[3px] h-8 bg-white rounded-full" />
            <div className="w-[3px] h-5 bg-white rounded-full" />
            <div className="w-[3px] h-7 bg-white rounded-full" />
            <div className="w-[3px] h-9 bg-white rounded-full" />
          </div>
        </div>

        {/* Feature highlights */}
        <div className="space-y-8 mb-auto">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <LayoutGrid className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Know your margins</h3>
              <p className="text-sm text-gray-400">Track profit per-agent to spot your best workflows.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <DollarSign className="h-5 w-5 text-pink-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Price with confidence</h3>
              <p className="text-sm text-gray-400">Use real data to set prices that protect your margins.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <Activity className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Scale without surprises</h3>
              <p className="text-sm text-gray-400">Get alerts when agent costs spike unexpectedly.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-8">
          <p className="text-sm text-gray-500">
            &copy; 2025 Paid.{" "}
            <Link href="/privacy" className="underline hover:text-gray-400">
              Privacy policy
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold text-center mb-8">Welcome</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email address*"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
                required
              />
            </div>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password*"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="text-left">
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full h-12 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white">
              Continue
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            Don't have an account?{" "}
            <Link href="/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">OR</span>
            </div>
          </div>

          <Button type="button" variant="outline" className="w-full h-12 border-gray-300 bg-transparent">
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>
        </div>
      </div>
    </div>
  )
}
