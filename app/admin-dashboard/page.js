import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminDashboardContent from "./AdminDashboardContent";

export const metadata = {
  title: "Admin Dashboard | TypingAuth",
  description: "Manage all users and system settings",
};

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  // Redirect to login if not authenticated
  if (!session) {
    redirect("/auth/login");
  }

  // Redirect to appropriate dashboard if user is not an admin
  if (session.user.role !== "admin") {
    if (session.user.role === "teacher") {
      redirect("/teacher-dashboard");
    } else {
      redirect("/dashboard");
    }
  }

  return <AdminDashboardContent />;
}
