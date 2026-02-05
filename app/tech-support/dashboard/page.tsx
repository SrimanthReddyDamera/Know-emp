import { redirect } from "next/navigation"
import { getCurrentEmployee } from "@/lib/auth"
import { DashboardLayout } from "@/components/dashboard-layout"
import { TechSupportDashboard } from "@/components/tech-support-dashboard"
import { createClient } from "@/lib/supabase/server"

export default async function TechSupportPage() {
  const employee = await getCurrentEmployee()

  if (!employee || employee.role !== "tech_support") {
    redirect("/login")
  }

  // Fetch pending requests
  const supabase = await createClient()
  
  // Note: Using a public client here assumes RLS policies allow reading 'password_requests' for 'tech_support' role.
  // We added policies for this in the SQL script.
  const { data: requests, error } = await supabase
    .from("password_requests")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching requests:", error)
  }

  return (
    <DashboardLayout employee={employee} role="tech_support">
      <TechSupportDashboard requests={requests || []} />
    </DashboardLayout>
  )
}
