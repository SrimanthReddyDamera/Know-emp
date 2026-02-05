"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { login } from "@/app/actions/auth"
import { createPasswordRequest } from "@/app/actions/tech-support"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Link from "next/link"
import { Loader2, User, ShieldCheck, Headset, HelpCircle } from "lucide-react"
import { toast } from "sonner"

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
  role: z.enum(["admin", "employee", "tech_support"]),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isRequesting, setIsRequesting] = useState(false)
  const [requestEmail, setRequestEmail] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "employee",
    },
  })

  const activeTab = form.watch("role")

  const onTabChange = (value: string) => {
    const role = value as "admin" | "employee" | "tech_support"
    form.setValue("role", role)
    form.clearErrors()
  }

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true)

    const formData = new FormData()
    formData.append("email", data.email)
    formData.append("password", data.password)
    formData.append("role", data.role)

    const result = await login(formData)

    if (result?.error) {
      toast.error(result.error)
      setIsLoading(false)
    }
    // Redirect is handled by server action
  }

  async function handleRequestHelp(e: React.FormEvent) {
    e.preventDefault()
    if (!requestEmail) return

    setIsRequesting(true)
    const result = await createPasswordRequest(requestEmail)
    setIsRequesting(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Password reset request submitted. Technical Support will contact you shortly.")
      setIsDialogOpen(false)
      setRequestEmail("")
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-12 p-1 bg-muted/50">
          <TabsTrigger
            value="employee"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm h-10"
          >
            <User className="h-4 w-4 mr-2" />
            Employee
          </TabsTrigger>
          <TabsTrigger
            value="admin"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm h-10"
          >
            <ShieldCheck className="h-4 w-4 mr-2" />
            Admin
          </TabsTrigger>
          <TabsTrigger
            value="tech_support"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm h-10"
          >
            <Headset className="h-4 w-4 mr-2" />
            Support
          </TabsTrigger>
        </TabsList>

        <div className="mt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          activeTab === "admin" 
                            ? "admin@company.com" 
                            : activeTab === "tech_support"
                              ? "support@company.com"
                              : "employee@company.com"
                        }
                        disabled={isLoading}
                        className="h-11 bg-background"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      {activeTab === "employee" && (
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="link" className="p-0 h-auto font-medium text-primary" type="button">
                              Request Password Help
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Request Password Reset</DialogTitle>
                              <DialogDescription>
                                Enter your email address below. A request will be sent to our Technical Support team to manually reset your password.
                              </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleRequestHelp} className="space-y-4 mt-4">
                              <div className="space-y-2">
                                <FormLabel htmlFor="request-email">Email Address</FormLabel>
                                <Input
                                  id="request-email"
                                  type="email"
                                  placeholder="employee@company.com"
                                  value={requestEmail}
                                  onChange={(e) => setRequestEmail(e.target.value)}
                                  required
                                />
                              </div>
                              <Button type="submit" className="w-full" disabled={isRequesting}>
                                {isRequesting ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting Request...
                                  </>
                                ) : (
                                  "Submit Request"
                                )}
                              </Button>
                            </form>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        disabled={isLoading}
                        className="h-11 bg-background"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full h-11 text-base font-medium" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  `Sign In as ${
                    activeTab === "admin" 
                      ? "Admin" 
                      : activeTab === "tech_support"
                        ? "Tech Support"
                        : "Employee"
                  }`
                )}
              </Button>

              {activeTab === "admin" && (
                <p className="text-center text-xs text-muted-foreground mt-4">
                  Admin accounts have elevated privileges and cannot request manual password resets.
                </p>
              )}
            </form>
          </Form>
        </div>
      </Tabs>
    </div>
  )
}
