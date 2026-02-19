import { Suspense } from 'react';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardContent from './DashboardContent';

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
      <div className="text-gray-900 dark:text-white text-xl">Loading dashboard...</div>
    </div>
  );
}

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  // Redirect to login if not authenticated
  if (!session) {
    redirect("/auth/login");
  }

  // Redirect based on role
  if (session.user.role === "admin") {
    redirect("/admin-dashboard");
  }

  if (session.user.role === "teacher") {
    redirect("/teacher-dashboard");
  }

  // Only students see the student dashboard
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
