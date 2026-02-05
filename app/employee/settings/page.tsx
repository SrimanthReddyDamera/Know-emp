import { redirect } from "next/navigation"
import { getCurrentEmployee } from "@/lib/auth"
import { ChangePasswordForm } from "@/components/change-password-form"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PasswordVisibilityToggle } from "@/components/password-visibility-toggle"

export default async function SettingsPage() {
  const employee = await getCurrentEmployee()

  if (!employee || employee.role !== "employee") {
    redirect("/login")
  }

  return (
    <DashboardLayout employee={employee} role="employee">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings
          </p>
        </div>
        
        <div className="max-w-xl space-y-6">
            <ChangePasswordForm />
            
            <PasswordVisibilityToggle initialShared={!!employee.share_password_with_admin} />
        </div>
      </div>
    </DashboardLayout>
  )
}
