import { redirect } from 'next/navigation';
import { getCurrentEmployee } from "@/lib/auth";
import { DashboardLayout } from "@/components/dashboard-layout";
import { EmployeeManagement } from "@/components/employee-management";

export default async function EmployeesPage() {
  const employee = await getCurrentEmployee();

  if (!employee || employee.role !== "admin") {
    redirect("/login");
  }

  return (
    <DashboardLayout employee={employee} role="admin">
      <EmployeeManagement />
    </DashboardLayout>
  );
}
