"use client";

import { useState } from "react";
import { createEntry } from "@/app/actions/knowledge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from 'next/navigation';

interface AddEntryFormProps {
  role?: "admin" | "employee" | "tech_support";
}

export function AddEntryForm({ role = "employee" }: AddEntryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const isAdmin = role === "admin";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const result = await createEntry(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      // Redirect admin to admin knowledge base, others to employee knowledge
      if (result?.role === "admin") {
        router.push("/admin/knowledge");
      } else {
        router.push("/employee/knowledge?filter=my-entries");
      }
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., How to reset VPN connection"
              required
              disabled={isLoading}
              className="text-lg font-medium"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="problem_description">Problem Description</Label>
            <Textarea
              id="problem_description"
              name="problem_description"
              placeholder="Describe the issue or context..."
              required
              disabled={isLoading}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="solution_steps">Solution Steps</Label>
            <Textarea
              id="solution_steps"
              name="solution_steps"
              placeholder={"1. Step one...\n2. Step two..."}
              required
              disabled={isLoading}
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? (isAdmin ? "Publishing..." : "Submitting...")
                : (isAdmin ? "Publish Entry" : "Submit for Approval")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

