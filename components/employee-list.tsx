"use client"

import type { Employee } from "@/lib/auth"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreVertical, Shield, User, Pencil, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { toggleEmployeeStatus, deleteEmployee } from "@/app/actions/employees"
import { useState } from "react"
import { EditEmployeeDialog } from "@/components/edit-employee-dialog"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface EmployeeListProps {
  employees: Employee[]
}

export function EmployeeList({ employees }: EmployeeListProps) {
  const [optimisticEmployees, setOptimisticEmployees] = useState(employees)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const totalPages = Math.ceil(optimisticEmployees.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentEmployees = optimisticEmployees.slice(startIndex, endIndex)

  async function handleToggleStatus(employeeId: string, currentStatus: string) {
    // Optimistic update
    setOptimisticEmployees((prev) =>
      prev.map((emp) =>
        emp.id === employeeId ? { ...emp, status: currentStatus === "active" ? "inactive" : "active" } : emp,
      ),
    )

    const result = await toggleEmployeeStatus(employeeId, currentStatus)

    if (result?.error) {
      toast.error(result.error)
      // Revert optimistic update on error
      setOptimisticEmployees(employees)
    } else {
      toast.success(`Employee ${currentStatus === "active" ? "deactivated" : "activated"} successfully`)
    }
  }

  async function handleDeleteEmployee() {
    if (!deletingEmployee) return

    const result = await deleteEmployee(deletingEmployee.id)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Employee deleted successfully")
      // Update local state
      setOptimisticEmployees((prev) => prev.filter((e) => e.id !== deletingEmployee.id))
      // Adjust current page if necessary
      if (currentEmployees.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      }
    }
    setDeletingEmployee(null)
  }

  if (optimisticEmployees.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No employees found. Create your first employee to get started.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Password</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentEmployees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">{employee.full_name}</TableCell>
                <TableCell className="text-muted-foreground">{employee.email}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {employee.role === "admin" ? (
                      <Shield className="h-4 w-4 text-primary" />
                    ) : (
                      <User className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="capitalize">{employee.role}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{employee.department || "-"}</TableCell>
                <TableCell className="font-mono text-xs">
                  {employee.visible_password ? (
                    <span className="bg-muted px-2 py-1 rounded select-all">{employee.visible_password}</span>
                  ) : (
                    <span className="text-muted-foreground italic flex items-center gap-1">
                      <Shield className="h-3 w-3" /> Hidden
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={employee.status === "active" ? "default" : "secondary"}>{employee.status}</Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingEmployee(employee)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(employee.id, employee.status)}>
                        {employee.status === "active" ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeletingEmployee(employee)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Employee
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (currentPage > 1) setCurrentPage(currentPage - 1)
                }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  isActive={page === currentPage}
                  onClick={(e) => {
                    e.preventDefault()
                    setCurrentPage(page)
                  }}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                }}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {editingEmployee && (
        <EditEmployeeDialog
          employee={editingEmployee}
          open={!!editingEmployee}
          onOpenChange={(open) => !open && setEditingEmployee(null)}
        />
      )}

      <AlertDialog open={!!deletingEmployee} onOpenChange={(open) => !open && setDeletingEmployee(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the employee account for{" "}
              <span className="font-medium text-foreground">{deletingEmployee?.full_name}</span> and remove their data
              from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEmployee}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
