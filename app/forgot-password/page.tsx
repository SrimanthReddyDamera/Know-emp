import { ForgotPasswordForm } from "@/components/forgot-password-form";
import Link from "next/link";
import { ArrowLeft, BookOpen } from 'lucide-react';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen w-full flex">
      {/* Left Side - Hero/Brand */}
      <div className="hidden lg:flex w-1/2 bg-primary relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="relative z-10 p-12 text-primary-foreground max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-primary-foreground/10 rounded-xl backdrop-blur-sm">
              <BookOpen className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold">Knowledge Base</h1>
          </div>
          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Secure access recovery.
          </h2>
          <p className="text-lg text-primary-foreground/80 leading-relaxed">
            We'll help you get back to your account safely. Follow the instructions sent to your email to reset your password.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
          
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Reset Password</h2>
            <p className="text-muted-foreground mt-2">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>
          
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
