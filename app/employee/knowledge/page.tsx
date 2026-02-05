import { redirect } from "next/navigation"
import { getCurrentEmployee } from "@/lib/auth"
import { DashboardLayout } from "@/components/dashboard-layout"
import { KnowledgeBase } from "@/components/knowledge-base"

export default async function EmployeeKnowledgePage() {
  const employee = await getCurrentEmployee()

  if (!employee || employee.role !== "employee") {
    redirect("/login")
  }

  if (employee.status !== "active") {
    redirect("/login")
  }

  return (
    <DashboardLayout employee={employee} role="employee">
      <KnowledgeBase employee={employee} role="employee" />
    </DashboardLayout>
  )
}
