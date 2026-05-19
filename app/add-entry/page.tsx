import { redirect } from 'next/navigation';
import { getCurrentEmployee } from "@/lib/auth";
import { DashboardLayout } from "@/components/dashboard-layout";
import { AddEntryForm } from "@/components/add-entry-form";

export default async function AddEntryPage() {
  const employee = await getCurrentEmployee();

  if (!employee) {
    redirect("/login");
  }

  const isAdmin = employee.role === "admin";

  return (
    <DashboardLayout employee={employee} role={employee.role}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Add Knowledge Entry</h1>
          <p className="text-muted-foreground mt-2">
            {isAdmin
              ? "Share your knowledge with the team. Your entry will be published directly."
              : "Share your knowledge with the team. All entries require approval."}
          </p>
        </div>
        <AddEntryForm role={employee.role} />
      </div>
    </DashboardLayout>
  );
}

