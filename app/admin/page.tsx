import { redirect } from 'next/navigation';
import { getCurrentEmployee } from "@/lib/auth";
import { AdminDashboard } from "@/components/admin-dashboard";

export default async function AdminPage() {
  const employee = await getCurrentEmployee();

  if (!employee || employee.role !== "admin") {
    redirect("/login");
  }

  return <AdminDashboard employee={employee} />;
}
