"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { loginWithMicrosoft, loginWithGoogle } from "@/lib/auth"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleMicrosoftLogin = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await loginWithMicrosoft()
      onSuccess()
    } catch (err) {
      setError("Failed to sign in with Microsoft. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await loginWithGoogle()
      onSuccess()
    } catch (err) {
      setError("Google sign-in is not implemented yet.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-lg p-6 shadow-xl border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Sign in to your calendar</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-white text-sm">{error}</div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleMicrosoftLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-[#2F2F2F]/30 hover:bg-[#2F2F2F]/50 text-white py-3 px-4 rounded-xl border border-white/10 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
              <path fill="#f3f3f3" d="M0 0h10.931v10.931H0z" />
              <path fill="#f35325" d="M12.069 0H23v10.931H12.069z" />
              <path fill="#81bc06" d="M0 12.069h10.931V23H0z" />
              <path fill="#05a6f0" d="M12.069 12.069H23V23H12.069z" />
            </svg>
            <span>Continue with Microsoft</span>
          </button>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-[#2F2F2F]/30 hover:bg-[#2F2F2F]/50 text-white py-3 px-4 rounded-xl border border-white/10 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                fill="#EA4335"
                d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"
              />
              <path
                fill="#34A853"
                d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"
              />
              <path
                fill="#4A90E2"
                d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"
              />
              <path
                fill="#FBBC05"
                d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        <p className="mt-6 text-center text-white/70 text-sm">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}

