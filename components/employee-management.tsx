import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { EmployeeList } from "@/components/employee-list";
import { CreateEmployeeDialog } from "@/components/create-employee-dialog";

export async function EmployeeManagement() {
  const supabase = await createClient();

  const { data: employees, error } = await supabase
    .from("employees")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Employee Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage employee accounts and permissions
          </p>
        </div>
        <CreateEmployeeDialog>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Employee
          </Button>
        </CreateEmployeeDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Employees</CardTitle>
          <CardDescription>
            {employees?.length || 0} employee(s) in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeList employees={employees || []} />
        </CardContent>
      </Card>
    </div>
  );
}
