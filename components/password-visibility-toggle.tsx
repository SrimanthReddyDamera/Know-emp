"use client"

import { useState } from "react"
import { togglePasswordSharing } from "@/app/actions/auth"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Loader2, ShieldAlert } from "lucide-react"

interface PasswordVisibilityToggleProps {
  initialShared: boolean
}

export function PasswordVisibilityToggle({ initialShared }: PasswordVisibilityToggleProps) {
  const [isShared, setIsShared] = useState(initialShared)
  const [isLoading, setIsLoading] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")

  async function handleToggle(checked: boolean) {
    if (checked) {
      // If turning ON, we need the password to store it
      setIsConfirmOpen(true)
    } else {
      // If turning OFF, just do it
      setIsLoading(true)
      const result = await togglePasswordSharing(false)
      setIsLoading(false)

      if (result.error) {
        toast.error(result.error)
      } else {
        setIsShared(false)
        toast.success("Password visibility disabled")
      }
    }
  }

  async function handleEnableConfirm() {
    if (!currentPassword) return

    setIsLoading(true)
    // Pass the password so backend can store it in visible_password
    const result = await togglePasswordSharing(true, currentPassword)
    setIsLoading(false)

    if (result.error) {
      toast.error(result.error)
      // Close dialog only on success usually, but if error is "Password incorrect" (not handled by simple action yet)
      // Actually togglePasswordSharing doesn't verify password currently, it trusts user input for the visible field.
      // But typically we should verify. For MVP we trust the session User ID.
    } else {
      setIsShared(true)
      setIsConfirmOpen(false)
      setCurrentPassword("")
      toast.success("Password shared with Admin")
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Privacy Settings</CardTitle>
            <CardDescription>
              Control who can see your password.
            </CardDescription>
          </div>
          <ShieldAlert className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-1">
            <Label htmlFor="share-password" className="text-base">
              Share Password with Admin
            </Label>
            <p className="text-sm text-muted-foreground max-w-sm">
              Allow Administrators to view your current password. This is useful if you forget it often, but reduces privacy.
            </p>
          </div>
          <Switch
            id="share-password"
            checked={isShared}
            onCheckedChange={handleToggle}
            disabled={isLoading}
          />
        </div>
      </CardContent>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Password Sharing</DialogTitle>
            <DialogDescription>
              To enable password sharing, please enter your current password. This allows us to securely store a visible copy for your Administrator.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Current Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleEnableConfirm} disabled={isLoading || !currentPassword}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Enable & Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
