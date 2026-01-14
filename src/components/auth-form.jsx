"use client";
import client_api from "@/utils/API_FETCH";
import { getSession, signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { MdEmail, MdLock } from "react-icons/md";
import { toast } from "react-toastify";

export default function AuthForm({ mode = "login", onSuccess, prev }) {
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    function getAndCreateCompany(name, userId) {
      client_api
        .create("/api/company/get-and-create", "Token", {
          name: name,
          userId: userId,
        })
        .then((res) => {
          // window.location.href = prev;
          router.push("/company-setup");
        })
        .catch((error) => {
          console.error("Error fetching/creating company:", error);
        });
    }

    try {
      if (mode === "signup") {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Registration failed");
        }

        // Auto sign in after registration
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        if (result.status === 200) {
          const userSession = await getSession();
          getAndCreateCompany(
            userSession?.user?.name || "My Company",
            userSession?.user?.id
          );
          // window.location.href = prev;
          toast.success("Account created and logged in successfully!");
        }
        if (result.error) {
          throw new Error(result.error);
        }
      } else {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        if (result.status === 200) {
          const userSession = await getSession();
          getAndCreateCompany(
            userSession?.user?.name || "My Company",
            userSession?.user?.id
          );
          // window.location.href = prev;
          toast.success("Logged in successfully!");
        }

        if (result.error) {
          throw new Error(result.error);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signIn("google", { redirect: true, callbackUrl: "/company-setup" });
    } catch (err) {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {mode === "signup" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <div className="relative">
          <MdEmail className="absolute left-3 top-3 text-gray-400 text-lg" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <div className="relative">
          <MdLock className="absolute left-3 top-3 text-gray-400 text-lg" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium"
      >
        {loading ? "Loading..." : mode === "signup" ? "Sign Up" : "Sign In"}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading}
        className="w-full py-2 flex items-center justify-center gap-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium disabled:bg-gray-100"
      >
        <FcGoogle className="text-lg" />
        {googleLoading ? "Connecting..." : "Sign in with Google"}
      </button>
    </form>
  );
}
