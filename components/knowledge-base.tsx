import type { Employee } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { KnowledgeList } from "@/components/knowledge-list"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface KnowledgeBaseProps {
  employee: Employee
  role: "admin" | "employee"
}

export async function KnowledgeBase({ employee, role }: KnowledgeBaseProps) {
  const supabase = await createClient()

  // Fetch entries based on role
  const { data: allEntries, error } = await supabase
    .from("knowledge_entries")
    .select("*, employees(full_name)")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching knowledge entries:", error)
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load knowledge entries. Please check the database connection and schema.
          <br />
          Technical details: {error.message}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Know-Emp</h1>
          <p className="text-muted-foreground mt-2">
            {role === "admin" ? "Manage and approve knowledge entries" : "Browse solutions and documentation"}
          </p>
        </div>
        <Link href="/add-entry">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Knowledge Entries</CardTitle>
          <CardDescription>Search and filter through the knowledge base</CardDescription>
        </CardHeader>
        <CardContent>
          <KnowledgeList entries={allEntries || []} currentUserId={employee.id} role={role} />
        </CardContent>
      </Card>
    </div>
  )
}
