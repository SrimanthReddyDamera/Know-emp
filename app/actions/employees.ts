"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createEmployee(formData: FormData) {
  const supabase = await createClient()

  // Safely attempt to create admin client
  let supabaseAdmin
  try {
    supabaseAdmin = await createAdminClient()
  } catch (error) {
    console.error("Failed to create admin client:", error)
    return { error: "Server configuration error: Missing admin keys. Please contact support." }
  }

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const full_name = formData.get("full_name") as string
  const role = formData.get("role") as "admin" | "employee" | "tech_support"
  const department = formData.get("department") as string
  const designation = formData.get("designation") as string
  const phone = formData.get("phone") as string

  if (!email || !password || !full_name || !role) {
    return { error: "Missing required fields" }
  }

  // Create auth user (using service role)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm email
  })

  if (authError) {
    return { error: authError.message }
  }

  // Create employee record
  const { error: employeeError } = await supabaseAdmin.from("employees").insert({
    auth_user_id: authData.user.id,
    email,
    full_name,
    role,
    status: "active",
    department: department || null,
    designation: designation || null,
    phone: phone || null,
    visible_password: password, // Store initial password for admin reference
    share_password_with_admin: true // Default to shared initially so admin can see what they set
  })

  if (employeeError) {
    // Rollback: delete auth user if employee creation fails
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    return { error: employeeError.message }
  }

  revalidatePath("/admin/employees")
  return { success: true }
}

export async function updateEmployee(employeeId: string, formData: FormData) {
  const supabase = await createClient()

  // Verify admin
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  // Check if requester is admin
  const { data: requester } = await supabase.from("employees").select("role").eq("auth_user_id", user.id).single()

  if (requester?.role !== "admin") {
    return { error: "Unauthorized" }
  }

  const full_name = formData.get("full_name") as string
  const role = formData.get("role") as "admin" | "employee"
  const department = formData.get("department") as string
  const designation = formData.get("designation") as string
  const phone = formData.get("phone") as string

  if (!full_name || !role) {
    return { error: "Name and role are required" }
  }

  const { error } = await supabase
    .from("employees")
    .update({
      full_name,
      role,
      department: department || null,
      designation: designation || null,
      phone: phone || null,
    })
    .eq("id", employeeId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/employees")
  return { success: true }
}

export async function toggleEmployeeStatus(employeeId: string, currentStatus: string) {
  const supabase = await createClient()

  const newStatus = currentStatus === "active" ? "inactive" : "active"

  const { error } = await supabase.from("employees").update({ status: newStatus }).eq("id", employeeId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/employees")
  return { success: true }
}

export async function deleteEmployee(employeeId: string) {
  const supabase = await createClient()

  // Verify admin
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  // Check if requester is admin
  const { data: requester } = await supabase.from("employees").select("role").eq("auth_user_id", user.id).single()

  if (requester?.role !== "admin") {
    return { error: "Unauthorized" }
  }

  // Get employee details to find auth_user_id
  const { data: employee } = await supabase.from("employees").select("auth_user_id, role").eq("id", employeeId).single()

  if (!employee) {
    return { error: "Employee not found" }
  }

  // Prevent deleting yourself
  if (employee.auth_user_id === user.id) {
    return { error: "You cannot delete your own account" }
  }

  // Create admin client to delete auth user
  let supabaseAdmin
  try {
    supabaseAdmin = await createAdminClient()
  } catch (error) {
    console.error("Failed to create admin client:", error)
    return { error: "Server configuration error" }
  }

  // Delete auth user (this should cascade to employees table)
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(employee.auth_user_id)

  if (authError) {
    console.error("Error deleting auth user:", authError)
    // If auth deletion fails (e.g. user not found), try deleting the employee record directly
    const { error: dbError } = await supabase.from("employees").delete().eq("id", employeeId)
    if (dbError) {
      return { error: "Failed to delete employee: " + dbError.message }
    }
  }

  revalidatePath("/admin/employees")
  return { success: true }
}
