import { redirect } from "next/navigation"
import { getCurrentEmployee } from "@/lib/auth"
import { ChangePasswordForm } from "@/components/change-password-form"
import { DashboardLayout } from "@/components/dashboard-layout"

export default async function AdminSettingsPage() {
  const employee = await getCurrentEmployee()

  if (!employee || employee.role !== "admin") {
    redirect("/login")
  }

  return (
    <DashboardLayout employee={employee} role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your admin account settings
          </p>
        </div>
        
        <div className="max-w-xl">
          <ChangePasswordForm />
        </div>
      </div>
    </DashboardLayout>
  )
}
