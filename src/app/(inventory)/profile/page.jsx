"use client";

import { Avatar } from "@/components/avatar";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { MdSettings } from "react-icons/md";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  // if (status === "loading") {
  //   return (
  //     <Loading />
  //   )
  // }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Profile Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <Avatar
                    name={session?.user?.name}
                    image={session?.user?.image}
                    size="lg"
                  />
                  <div>
                    <p className="text-sm text-gray-600">Profile</p>
                    <p className="text-lg font-medium text-gray-900">
                      {session?.user?.name || "Not set"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-lg font-medium text-gray-900">
                    {session?.user?.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Link
                href="/profile/setting"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <MdSettings />
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
