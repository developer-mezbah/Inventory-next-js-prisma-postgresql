import AuthForm from "@/components/auth-form";
import Link from "next/link";

export default async function page({ searchParams }) {
  const prevPage = await searchParams;
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Sign In</h1>

          <AuthForm prev={prevPage?.prev || "/"} mode="login" />

          <p className="text-center text-gray-600 mt-6">
            Don't have an account?{" "}
            <Link
              href={`/auth/signup?prev=${prevPage?.prev}`}
              className="text-blue-600 hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
