import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import DashboardLayout from "./DashboardLayout";
import { authOptions } from "@/lib/auth";

export default async function Layout({ children }) {
  // Get session on the server
  const session = await getServerSession(authOptions);
  
  // Redirect if not logged in
  if (!session) {
    redirect("/auth/login");
  }

  // Pass user data to client component
  return (
    <DashboardLayout
      userRole={session?.user?.role}
      userName={session?.user?.name}
      userImage={session?.user?.image}
    >
      {children}
    </DashboardLayout>
  );

// return children;
}