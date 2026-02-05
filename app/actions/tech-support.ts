"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

/**
 * Creates a password reset request for a given email.
 * This can be called publicly or by a logged-in user.
 */
export async function createPasswordRequest(email: string) {
  const supabase = await createClient()

  // 1. Verify email exists in employees table
  // We use the public client, assuming RLS allows reading employees or we have a public function.
  // Actually, standard RLS might block reading 'employees' for anon.
  // But we need to verify the email exists to associate the request.
  // We'll use the admin client to verify existence to be safe and secure (avoiding information leakage if possible,
  // but for this internal app, returning "success" even if email not found is best practice but might be annoying for internal tools).
  // Given the requirement is "employees will have option as request", let's assume valid employees.
  // We'll use admin client to find the employee ID.
  
  let supabaseAdmin
  try {
    supabaseAdmin = await createAdminClient()
  } catch (error) {
    console.error("Failed to create admin client:", error)
    return { error: "System configuration error. Please contact a system administrator." }
  }

  const { data: employee, error: empError } = await supabaseAdmin
    .from("employees")
    .select("id, role, full_name")
    .eq("email", email)
    .single()

  if (empError || !employee) {
    // Return a generic success message or specific error depending on security posture.
    // For internal apps, specific error is usually preferred for better UX.
    return { error: "No employee account found with this email address." }
  }
  
  // 2. Check for existing pending requests to avoid spam
  const { data: existing } = await supabaseAdmin
    .from("password_requests")
    .select("id")
    .eq("employee_id", employee.id)
    .eq("status", "pending")
    .single()
    
  if (existing) {
    return { error: "You already have a pending password reset request. Please contact Technical Support." }
  }

  // 3. Create the request
  const { error: insertError } = await supabaseAdmin
    .from("password_requests")
    .insert({
      employee_id: employee.id,
      email: email,
      status: "pending"
    })

  if (insertError) {
    console.error("Error creating password request:", insertError)
    return { error: "Failed to submit request. Please try again." }
  }

  return { success: true }
}

/**
 * Fulfills a password request by setting a new password.
 * Only accessible by 'admin' or 'tech_support'.
 */
export async function fulfillPasswordReset(requestId: string, newPassword: string) {
  const supabase = await createClient()

  // 1. Verify Authentication & Authorization
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: requester } = await supabase
    .from("employees")
    .select("role")
    .eq("auth_user_id", user.id)
    .single()

  if (!requester || (requester.role !== "admin" && requester.role !== "tech_support")) {
    return { error: "Unauthorized: You do not have permission to reset passwords." }
  }

  // 2. Get the request details using Admin client (to bypass potential RLS complexity if explicit policies aren't perfect yet,
  // though we added policies. But for the actual Auth update we definitely need Admin client).
  let supabaseAdmin
  try {
    supabaseAdmin = await createAdminClient()
  } catch (error) {
    return { error: "Server configuration error." }
  }

  const { data: request, error: reqError } = await supabaseAdmin
    .from("password_requests")
    .select("*, employees!employee_id(auth_user_id)")
    .eq("id", requestId)
    .single()

  if (reqError || !request) {
    return { error: "Request not found." }
  }
  
  // Check if already resolved
  if (request.status !== 'pending') {
      return { error: `Request is already ${request.status}.` }
  }

  const targetAuthUserId = request.employees?.auth_user_id

  if (!targetAuthUserId) {
    return { error: "Target employee does not have a linked account." }
  }

  // 3. Update the user's password in Supabase Auth
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    targetAuthUserId,
    { password: newPassword }
  )

  if (updateError) {
    return { error: `Failed to update password: ${updateError.message}` }
  }

  // 4. Mark request as resolved
  // We should identify who resolved it. We have the 'requester' employee (current user).
  // Need the requester's employee ID.
  const { data: requesterEmployee } = await supabase
    .from("employees")
    .select("id")
    .eq("auth_user_id", user.id)
    .single()

  await supabaseAdmin
    .from("password_requests")
    .update({
      status: 'resolved',
      resolved_at: new Date().toISOString(),
      resolved_by: requesterEmployee?.id
    })
    .eq("id", requestId)

  revalidatePath("/tech-support/dashboard")
  revalidatePath("/admin/dashboard") // If admins view it there too
  
  return { success: true }
}

/**
 * Rejects a password request.
 */
export async function rejectPasswordRequest(requestId: string) {
  const supabase = await createClient()
  
  // Authorization Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: requester } = await supabase
    .from("employees")
    .select("id, role")
    .eq("auth_user_id", user.id)
    .single()

  if (!requester || (requester.role !== "admin" && requester.role !== "tech_support")) {
    return { error: "Unauthorized" }
  }

  const supabaseAdmin = await createAdminClient()

  const { error } = await supabaseAdmin
    .from("password_requests")
    .update({
      status: 'rejected',
      resolved_at: new Date().toISOString(),
      resolved_by: requester.id
    })
    .eq("id", requestId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/tech-support/dashboard")
  return { success: true }
}
