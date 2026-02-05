import { Suspense } from "react"
import { Employee } from "@/lib/auth"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, FileText, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

interface AdminDashboardProps {
  employee: Employee
}

export function AdminDashboard({ employee }: AdminDashboardProps) {
  return (
    <DashboardLayout employee={employee} role="admin">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back, {employee.full_name}</p>
        </div>

        <Suspense fallback={<StatsGridSkeleton />}>
          <StatsGrid />
        </Suspense>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link
                href="/admin/employees?action=create"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Create Employee</div>
                  <div className="text-sm text-muted-foreground">Add a new employee account</div>
                </div>
              </Link>
              <Link
                href="/admin/knowledge?status=pending"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Review Pending</div>
                  <div className="text-sm text-muted-foreground">Approve knowledge entries</div>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Suspense fallback={<SystemOverviewSkeleton />}>
            <SystemOverview />
          </Suspense>
        </div>
      </div>
    </DashboardLayout>
  )
}

async function getStats() {
  const supabase = await createClient()

  try {
    const [employeesData, knowledgeData, pendingData] = await Promise.all([
      supabase.from("employees").select("id", { count: "exact" }),
      supabase.from("knowledge_entries").select("id", { count: "exact" }).eq("status", "approved"),
      supabase.from("knowledge_entries").select("id", { count: "exact" }).eq("status", "pending"),
    ])

    return {
      employees: employeesData.count ?? 0,
      knowledge: knowledgeData.count ?? 0,
      pending: pendingData.count ?? 0,
      error: null
    }
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error)
    return {
      employees: 0,
      knowledge: 0,
      pending: 0,
      error: "Failed to load statistics"
    }
  }
}

async function StatsGrid() {
  const { employees, knowledge, pending, error } = await getStats()

  const stats = [
    {
      title: "Total Employees",
      value: employees,
      icon: Users,
      href: "/admin/employees",
      description: "Manage employee accounts",
    },
    {
      title: "Knowledge Entries",
      value: knowledge,
      icon: FileText,
      href: "/admin/knowledge",
      description: "View all approved entries",
    },
    {
      title: "Pending Approvals",
      value: pending,
      icon: Clock,
      href: "/admin/knowledge?status=pending",
      description: "Entries awaiting review",
    },
  ]

  if (error) {
    return (
      <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive">
        <p className="font-medium">Error loading statistics</p>
        <p className="text-sm opacity-90">Please try refreshing the page.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-2">{stat.description}</p>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}

function StatsGridSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-[60px] mb-2" />
            <Skeleton className="h-3 w-[140px]" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

async function SystemOverview() {
  const { employees, knowledge, pending, error } = await getStats()

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
          <CardDescription>Platform statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Failed to load overview data.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Overview</CardTitle>
        <CardDescription>Platform statistics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Active Employees</span>
          <span className="font-medium">{employees}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Approved Entries</span>
          <span className="font-medium">{knowledge}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Pending Reviews</span>
          <span className="font-medium">{pending}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function SystemOverviewSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Overview</CardTitle>
        <CardDescription>Platform statistics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-4 w-[40px]" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
