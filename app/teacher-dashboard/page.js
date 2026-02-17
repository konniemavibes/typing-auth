import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import TeacherDashboardContent from "./TeacherDashboardContent";

export const metadata = {
  title: "Teacher Dashboard | TypingAuth",
  description: "Monitor your classes and track student progress",
};

export default async function TeacherDashboard() {
  const session = await getServerSession(authOptions);

  // Redirect to login if not authenticated
  if (!session) {
    redirect("/auth/login");
  }

  // Redirect to student dashboard if user is not a teacher
  if (session.user.role !== "teacher") {
    redirect("/dashboard");
  }

  return <TeacherDashboardContent />;
}
