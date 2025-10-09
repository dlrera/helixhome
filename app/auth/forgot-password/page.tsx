"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate email sending (placeholder for future implementation)
    setTimeout(() => {
      setEmailSent(true);
      setIsLoading(false);
      toast({
        title: "Reset link sent",
        description:
          "If an account exists with this email, you will receive password reset instructions.",
      });
    }, 1500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-card p-8 shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-black tracking-tight text-primary">
            Reset Password
          </h1>
          <p className="text-muted-foreground">
            {emailSent
              ? "Check your email for reset instructions"
              : "Enter your email address and we'll send you a reset link"}
          </p>
        </div>

        {!emailSent ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send reset link"}
            </Button>

            <div className="text-center">
              <Link
                href="/auth/signin"
                className="text-sm text-primary hover:underline"
              >
                Back to sign in
              </Link>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="rounded-lg bg-success/10 p-4 text-center">
              <p className="text-sm text-success">
                Password reset instructions have been sent to your email.
              </p>
            </div>

            <Button asChild className="w-full" variant="outline">
              <Link href="/auth/signin">Return to sign in</Link>
            </Button>

            <button
              onClick={() => {
                setEmailSent(false);
                setEmail("");
              }}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
            >
              Didn't receive the email? Try again
            </button>
          </div>
        )}

        <div className="rounded-lg border border-warning/50 bg-warning/10 p-4">
          <p className="text-xs text-warning">
            <strong>Note:</strong> Email functionality is not yet implemented.
            This is a placeholder for future password reset features.
          </p>
        </div>
      </div>
    </div>
  );
}
