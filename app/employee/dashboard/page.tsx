import { redirect } from "next/navigation"
import { getCurrentEmployee } from "@/lib/auth"
import { EmployeeDashboard } from "@/components/employee-dashboard"

export default async function EmployeeDashboardPage() {
  const employee = await getCurrentEmployee()

  if (!employee || employee.role !== "employee") {
    redirect("/login")
  }

  if (employee.status !== "active") {
    redirect("/login")
  }

  return <EmployeeDashboard employee={employee} />
}
