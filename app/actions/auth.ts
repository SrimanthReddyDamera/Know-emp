"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { headers } from "next/headers"

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as "admin" | "employee" | "tech_support"

  if (!email || !password || !role) {
    return { error: "Email, password, and role are required" }
  }

  const supabase = await createClient()

  // Sign in with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) {
    return { error: "Invalid email or password" }
  }

  // Check if employee exists and has correct role
  const { data: employee, error: employeeError } = await supabase
    .from("employees")
    .select("*")
    .eq("auth_user_id", authData.user.id)
    .eq("role", role)
    .maybeSingle()

  if (employeeError || !employee) {
    await supabase.auth.signOut()
    return { error: `No ${role} account found with these credentials` }
  }

  // Check if employee is active
  if (employee.status !== "active") {
    await supabase.auth.signOut()
    return { error: "Your account is inactive. Please contact an administrator." }
  }

  revalidatePath("/", "layout")

  // Redirect based on role
  if (role === "admin") {
    redirect("/admin")
  } else if (role === "tech_support") {
    redirect("/tech-support/dashboard")
  } else {
    redirect("/employee/dashboard")
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/login")
}

export async function requestPasswordReset(email: string) {
  const supabase = await createClient()

  // Check if user is an employee (not admin)
  const { data: employee } = await supabase.from("employees").select("role").eq("email", email).single()

  if (!employee) {
    return { error: "No account found with this email" }
  }

  if (employee.role === "admin") {
    return { error: "Admins cannot reset passwords. Please contact support." }
  }

  const origin = (await headers()).get("origin")
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/auth/confirm?next=${encodeURIComponent("/reset-password")}&type=recovery`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function resetPassword(password: string) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "Authentication failed. The password reset link may have expired. Please request a new one." }
  }

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function changePassword(password: string) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "Authentication failed. Please log in again." }
  }

  // Check if user has opted to share password
  const { data: employee } = await supabase
    .from("employees")
    .select("share_password_with_admin")
    .eq("auth_user_id", user.id)
    .single()
  
  const updates: any = { password }
  
  // Update Auth User
  const { error } = await supabase.auth.updateUser(updates)

  if (error) {
    return { error: error.message }
  }

  // Update visible_password if shared
  if (employee?.share_password_with_admin) {
    await supabase
      .from("employees")
      .update({ visible_password: password })
      .eq("auth_user_id", user.id)
  } else {
    // Ensure it's cleared if not shared (though toggle logic handles this too, double safety)
    await supabase
      .from("employees")
      .update({ visible_password: null })
      .eq("auth_user_id", user.id)
  }

  return { success: true }
}

export async function togglePasswordSharing(enabled: boolean, currentPassword?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const updates: any = { share_password_with_admin: enabled }
  
  if (enabled && currentPassword) {
    updates.visible_password = currentPassword
  } else if (!enabled) {
    updates.visible_password = null
  }

  const { error } = await supabase
    .from("employees")
    .update(updates)
    .eq("auth_user_id", user.id)

  if (error) return { error: error.message }
  
  return { success: true }
}
