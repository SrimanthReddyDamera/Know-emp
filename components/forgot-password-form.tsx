"use client";

import { useState } from "react";
import { requestPasswordReset } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;

    const result = await requestPasswordReset(email);

    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }

    setIsLoading(false);
  }

  return (
    <Card className="border-border/50 shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
        <CardDescription>
          We'll send you a link to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="bg-primary/10 text-primary text-sm p-4 rounded-md border border-primary/20">
            <p className="font-medium mb-1">Check your email</p>
            <p className="text-primary/80">
              We've sent you a password reset link. Please check your inbox.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="employee@company.com"
                required
                disabled={isLoading}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Note: Only employee accounts can reset passwords
              </p>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
