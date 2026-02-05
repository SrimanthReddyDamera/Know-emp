"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Search, Check, X, Clock, Trash2, Edit, Save } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { updateEntryStatus, deleteEntry, updateEntry } from "@/app/actions/knowledge"
import { toast } from "sonner"

interface KnowledgeEntry {
  id: string
  title: string
  problem_description: string
  solution_steps: string
  status: "pending" | "approved" | "rejected"
  created_by: string
  created_at: string
  employees?: {
    full_name: string
  }
}

interface KnowledgeListProps {
  entries: any[]
  currentUserId: string
  role: "admin" | "employee"
}

export function KnowledgeList({ entries, currentUserId, role }: KnowledgeListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [activeTab, setActiveTab] = useState(role === "admin" ? "pending" : "approved")
  const [optimisticEntries, setOptimisticEntries] = useState<KnowledgeEntry[]>(entries)

  // Sync URL with search query (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only push if the query has changed from what's potentially in the URL
      // We check if we need to update the URL
      const currentUrlQuery = searchParams.get("q") || ""
      if (searchQuery !== currentUrlQuery) {
        if (searchQuery) {
          router.push(`?q=${encodeURIComponent(searchQuery)}`, { scroll: false })
        } else {
           router.push("?", { scroll: false })
        }
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery, router, searchParams])

  // Edit state
  const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sync with server props when they change (e.g. after router.refresh())
  useEffect(() => {
    setOptimisticEntries(entries)
  }, [entries])

  // Auto-sync for admin to see new pending requests
  useEffect(() => {
    // Only poll if we are an admin
    if (role === "admin") {
      const interval = setInterval(() => {
        router.refresh()
      }, 5000) // Poll every 5 seconds
      return () => clearInterval(interval)
    }
  }, [router, role])

  const filteredEntries = optimisticEntries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.problem_description.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (activeTab === "my-entries") {
      return entry.created_by === currentUserId
    }

    return entry.status === activeTab
  })

  async function handleStatusUpdate(entryId: string, newStatus: "approved" | "rejected") {
    // Optimistic update
    setOptimisticEntries((prev) =>
      prev.map((entry) => (entry.id === entryId ? { ...entry, status: newStatus } : entry)),
    )

    const result = await updateEntryStatus(entryId, newStatus)
    if (result.error) {
      toast.error(result.error)
      router.refresh() // Revert on error
    } else {
      toast.success(`Entry ${newStatus}`)
    }
  }

  async function handleDelete(entryId: string) {
    if (!confirm("Are you sure you want to delete this entry?")) return

    // Optimistic update
    setOptimisticEntries((prev) => prev.filter((e) => e.id !== entryId))

    const result = await deleteEntry(entryId)
    if (result.error) {
      toast.error(result.error)
      router.refresh()
    } else {
      toast.success("Entry deleted")
    }
  }

  function openEditDialog(entry: KnowledgeEntry) {
    setEditingEntry(entry)
    setIsEditDialogOpen(true)
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editingEntry) return

    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)

    const result = await updateEntry(editingEntry.id, formData)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Entry updated successfully")
      setIsEditDialogOpen(false)
      setEditingEntry(null)
      router.refresh()
    }
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search knowledge base..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          {role === "admin" && (
            <TabsTrigger value="pending" className="relative">
              Pending Review
              {optimisticEntries.filter((e) => e.status === "pending").length > 0 && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full" />
              )}
            </TabsTrigger>
          )}
          <TabsTrigger value="my-entries">My Entries</TabsTrigger>
          {role === "admin" && <TabsTrigger value="rejected">Rejected</TabsTrigger>}
        </TabsList>

        <div className="mt-6">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
              No entries found in this category.
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full space-y-4">
              {filteredEntries.map((entry) => (
                <AccordionItem key={entry.id} value={entry.id} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="text-left">
                        <div className="font-medium text-lg">{entry.title}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          By {entry.employees?.full_name || "Unknown"} •{" "}
                          {new Date(entry.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge
                        variant={
                          entry.status === "approved"
                            ? "default"
                            : entry.status === "pending"
                              ? "secondary"
                              : "destructive"
                        }
                        className="ml-4 shrink-0"
                      >
                        {entry.status}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-6 space-y-6">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground">Problem Description</h4>
                      <div className="p-4 bg-muted/50 rounded-md text-muted-foreground whitespace-pre-wrap">
                        {entry.problem_description}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground">Solution Steps</h4>
                      <div className="p-4 bg-muted/50 rounded-md text-muted-foreground whitespace-pre-wrap">
                        {entry.solution_steps}
                      </div>
                    </div>

                    {role === "admin" && (
                      <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        {/* Edit/Delete for Admins */}
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(entry)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(entry.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>

                        {/* Approval Actions */}
                        {entry.status === "pending" && (
                          <>
                            <div className="w-px h-8 bg-border mx-2" />
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleStatusUpdate(entry.id, "rejected")}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                            <Button size="sm" onClick={() => handleStatusUpdate(entry.id, "approved")}>
                              <Check className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Knowledge Entry</DialogTitle>
            <DialogDescription>
              Make changes to the knowledge base entry here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {editingEntry && (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" defaultValue={editingEntry.title} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="problem_description">Problem Description</Label>
                <Textarea
                  id="problem_description"
                  name="problem_description"
                  defaultValue={editingEntry.problem_description}
                  required
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="solution_steps">Solution Steps</Label>
                <Textarea
                  id="solution_steps"
                  name="solution_steps"
                  defaultValue={editingEntry.solution_steps}
                  required
                  className="min-h-[150px]"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
