"use client";

import { Employee } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/actions/auth";
import { LayoutDashboard, Users, FileText, LogOut, Menu, X, Settings } from 'lucide-react';
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { useState } from "react";

interface DashboardLayoutProps {
  employee: Employee;
  role: "admin" | "employee" | "tech_support";
  children: React.ReactNode;
}

export function DashboardLayout({ employee, role, children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const adminNavItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/employees", label: "Employees", icon: Users },
    { href: "/admin/knowledge", label: "Knowledge Base", icon: FileText },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  const techSupportNavItems = [
    { href: "/tech-support/dashboard", label: "Dashboard", icon: LayoutDashboard },
    // Tech support might need access to employees list too? Maybe not fully management, but let's stick to Dashboard for now.
    // Or maybe they need "Requests"? Dashboard covers it.
  ];

  const employeeNavItems = [
    { href: "/employee/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/employee/knowledge", label: "Knowledge Base", icon: FileText },
    { href: "/employee/settings", label: "Settings", icon: Settings },
  ];

  let navItems = employeeNavItems;
  if (role === "admin") navItems = adminNavItems;
  if (role === "tech_support") navItems = techSupportNavItems;

  async function handleLogout() {
    await logout();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center justify-between px-4">
        <h2 className="font-semibold text-foreground">Know-Emp</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-40 transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">Know-Emp</h2>
            <p className="text-sm text-muted-foreground mt-1 capitalize">{role} Portal</p>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border">
            <div className="mb-4 p-3 bg-secondary rounded-lg">
              <p className="text-sm font-medium text-foreground">{employee.full_name}</p>
              <p className="text-xs text-muted-foreground">{employee.email}</p>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-20 lg:pt-0">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
