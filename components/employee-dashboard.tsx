import { Employee } from "@/lib/auth";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Clock, CheckCircle, Plus } from 'lucide-react';
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

import { DashboardSearch } from "@/components/dashboard-search";

interface EmployeeDashboardProps {
  employee: Employee;
}

export async function EmployeeDashboard({ employee }: EmployeeDashboardProps) {
  const supabase = await createClient();

  // Fetch statistics
  const [approvedData, pendingData, myEntriesData] = await Promise.all([
    supabase.from("knowledge_entries").select("id", { count: "exact" }).eq("status", "approved"),
    supabase.from("knowledge_entries").select("id", { count: "exact" }).eq("status", "pending").eq("created_by", employee.auth_user_id),
    supabase.from("knowledge_entries").select("id", { count: "exact" }).eq("created_by", employee.auth_user_id),
  ]);

  // Fetch recent approved entries
  const { data: recentEntries } = await supabase
    .from("knowledge_entries")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(5);

  const stats = [
    {
      title: "Knowledge Base",
      value: approvedData.count || 0,
      icon: FileText,
      href: "/employee/knowledge",
      description: "Total approved articles",
    },
    {
      title: "My Contributions",
      value: myEntriesData.count || 0,
      icon: CheckCircle,
      href: "/employee/knowledge?filter=my",
      description: "Entries you created",
    },
    {
      title: "Pending Review",
      value: pendingData.count || 0,
      icon: Clock,
      href: "/employee/knowledge?filter=pending",
      description: "Awaiting admin approval",
    },
  ];

  return (
    <DashboardLayout employee={employee} role="employee">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Employee Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {employee.full_name}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <DashboardSearch />
            <Link href="/add-entry">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Knowledge Entry
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.title} href={stat.href}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Recent Knowledge Entries</CardTitle>
              <CardDescription>Latest approved solutions and guides</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEntries && recentEntries.length > 0 ? (
                  recentEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <div>
                        <h3 className="font-medium text-foreground">{entry.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {entry.problem_description}
                        </p>
                      </div>
                      <Link href={`/employee/knowledge?id=${entry.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No knowledge entries found yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Tips</CardTitle>
              <CardDescription>Using the knowledge base</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="font-bold text-primary">1</span>
                </div>
                <p>Search before creating new entries to avoid duplicates.</p>
              </div>
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="font-bold text-primary">2</span>
                </div>
                <p>Provide clear, step-by-step solutions for better readability.</p>
              </div>
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="font-bold text-primary">3</span>
                </div>
                <p>All new entries require admin approval before becoming public.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
