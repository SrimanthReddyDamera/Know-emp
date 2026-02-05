import { redirect } from 'next/navigation';
import { getCurrentEmployee } from "@/lib/auth";
import { DashboardLayout } from "@/components/dashboard-layout";
import { KnowledgeBase } from "@/components/knowledge-base";

export default async function AdminKnowledgePage() {
  const employee = await getCurrentEmployee();

  if (!employee || employee.role !== "admin") {
    redirect("/login");
  }

  return (
    <DashboardLayout employee={employee} role="admin">
      <KnowledgeBase employee={employee} role="admin" />
    </DashboardLayout>
  );
}
