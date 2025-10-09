import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { DashboardSettingsForm } from "@/components/dashboard/dashboard-settings-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function DashboardSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-black text-primary">HelixIntel</h1>
          <span className="text-sm text-muted-foreground">
            {session.user?.email}
          </span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="max-w-3xl space-y-6">
          {/* Page Header */}
          <div className="space-y-2">
            <h2 className="text-3xl font-black">Dashboard Settings</h2>
            <p className="text-muted-foreground">
              Configure your dashboard preferences and maintenance budget tracking.
            </p>
          </div>

          {/* Budget Settings Section */}
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Budget</CardTitle>
              <CardDescription>
                Set your monthly maintenance budget to track spending and get alerts when you're approaching your limit.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DashboardSettingsForm />
            </CardContent>
          </Card>

          {/* Future Settings Sections - Commented for now */}
          {/*
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Layout</CardTitle>
              <CardDescription>
                Customize which widgets appear on your dashboard and their arrangement.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Layout customization coming soon...</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose which dashboard activities trigger notifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Notification settings coming soon...</p>
            </CardContent>
          </Card>
          */}
        </div>
      </main>
    </div>
  );
}
