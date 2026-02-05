"use server"

import { createClient } from "@/lib/supabase/server"

export async function searchKnowledge(query: string) {
  if (!query || query.length < 2) return []

  const supabase = await createClient()

  // Perform a case-insensitive search on title and problem_description
  // limiting to approved entries only
  const { data, error } = await supabase
    .from("knowledge_entries")
    .select("id, title, status")
    .eq("status", "approved")
    .or(`title.ilike.%${query}%,problem_description.ilike.%${query}%`)
    .limit(5)

  if (error) {
    console.error("Search error:", error)
    return []
  }

  return data
}
