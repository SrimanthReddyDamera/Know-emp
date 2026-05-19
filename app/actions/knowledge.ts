"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getCurrentEmployee } from "@/lib/auth"

export async function createEntry(formData: FormData) {
  const supabase = await createClient()
  const employee = await getCurrentEmployee()

  if (!employee) {
    return { error: "Unauthorized" }
  }

  if (employee.status !== "active") {
    return { error: "Your account is inactive. Please contact an administrator." }
  }

  const title = formData.get("title") as string
  const problem_description = formData.get("problem_description") as string
  const solution_steps = formData.get("solution_steps") as string

  if (!title || !problem_description || !solution_steps) {
    return { error: "All fields are required" }
  }

  // Admin entries are auto-approved; other roles require approval
  const entryStatus = employee.role === "admin" ? "approved" : "pending"

  const { error } = await supabase.from("knowledge_entries").insert({
    title,
    problem_description,
    solution_steps,
    created_by: employee.id,
    status: entryStatus,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/employee/knowledge")
  revalidatePath("/admin/knowledge")
  return { success: true, role: employee.role }
}

export async function updateEntry(entryId: string, formData: FormData) {
  const supabase = await createClient()
  const employee = await getCurrentEmployee()

  if (!employee || employee.role !== "admin") {
    return { error: "Unauthorized" }
  }

  const title = formData.get("title") as string
  const problem_description = formData.get("problem_description") as string
  const solution_steps = formData.get("solution_steps") as string

  if (!title || !problem_description || !solution_steps) {
    return { error: "All fields are required" }
  }

  const { error } = await supabase
    .from("knowledge_entries")
    .update({
      title,
      problem_description,
      solution_steps,
    })
    .eq("id", entryId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/employee/knowledge")
  revalidatePath("/admin/knowledge")
  return { success: true }
}

export async function deleteEntry(entryId: string) {
  const supabase = await createClient()
  const employee = await getCurrentEmployee()

  if (!employee || employee.role !== "admin") {
    return { error: "Unauthorized" }
  }

  const { error } = await supabase.from("knowledge_entries").delete().eq("id", entryId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/employee/knowledge")
  revalidatePath("/admin/knowledge")
  return { success: true }
}

export async function updateEntryStatus(entryId: string, status: "approved" | "rejected") {
  const supabase = await createClient()
  const employee = await getCurrentEmployee()

  if (!employee || employee.role !== "admin") {
    return { error: "Unauthorized" }
  }

  const { error } = await supabase.from("knowledge_entries").update({ status }).eq("id", entryId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/employee/knowledge")
  revalidatePath("/admin/knowledge")
  return { success: true }
}
