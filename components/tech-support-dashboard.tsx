"use client"

import { useState } from "react"
import { fulfillPasswordReset, rejectPasswordRequest } from "@/app/actions/tech-support"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

interface PasswordRequest {
  id: string
  email: string
  status: string
  created_at: string
  employee_id: string
}

interface TechSupportDashboardProps {
  requests: PasswordRequest[]
}

export function TechSupportDashboard({ requests }: TechSupportDashboardProps) {
  const [selectedRequest, setSelectedRequest] = useState<PasswordRequest | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isRejecting, setIsRejecting] = useState<string | null>(null)

  async function handleResetSubmit() {
    if (!selectedRequest || !newPassword) return

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    setIsLoading(true)
    const result = await fulfillPasswordReset(selectedRequest.id, newPassword)
    setIsLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Password reset successfully")
      setSelectedRequest(null)
      setNewPassword("")
    }
  }

  async function handleReject(requestId: string) {
    setIsRejecting(requestId)
    const result = await rejectPasswordRequest(requestId)
    setIsRejecting(null)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Request rejected")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Technical Support Dashboard</h2>
          <p className="text-muted-foreground">
            Manage password reset requests from employees.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Requests</CardTitle>
          <CardDescription>
            {requests.length} pending password reset request{requests.length !== 1 && "s"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending requests found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.email}</TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog
                          open={selectedRequest?.id === request.id}
                          onOpenChange={(open) => !open && setSelectedRequest(null)}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => setSelectedRequest(request)}
                            >
                              Reset
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reset Password</DialogTitle>
                              <DialogDescription>
                                Set a new password for {request.email}.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <label htmlFor="new-password">New Password</label>
                                <Input
                                  id="new-password"
                                  type="text" // Show password so tech support can read it out or copy it
                                  placeholder="Enter new password"
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  minLength={8}
                                />
                                <p className="text-xs text-muted-foreground">
                                  Must be at least 8 characters. securely communicate this to the employee.
                                </p>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setSelectedRequest(null)}
                                disabled={isLoading}
                              >
                                Cancel
                              </Button>
                              <Button onClick={handleResetSubmit} disabled={isLoading}>
                                {isLoading ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Resetting...
                                  </>
                                ) : (
                                  "Confirm Reset"
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleReject(request.id)}
                          disabled={isRejecting === request.id}
                        >
                          {isRejecting === request.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Reject"
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
