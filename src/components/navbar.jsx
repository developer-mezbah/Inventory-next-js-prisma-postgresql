"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { FiLogOut } from "react-icons/fi"
import { Avatar } from "./avatar"

export function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-600">
          AuthApp
        </Link>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              <div className="flex items-center gap-3">
                <Avatar name={session.user.name} image={session.user.image} size="sm" />
                <span className="text-gray-600">{session.user.email}</span>
              </div>
              <button
                onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <FiLogOut />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
