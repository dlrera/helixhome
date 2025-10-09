import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { CostReportView } from "@/components/dashboard/cost-report-view";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function CostReportPage() {
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

        <div className="space-y-6">
          {/* Page Header */}
          <div className="space-y-2">
            <h2 className="text-3xl font-black">Maintenance Cost Report</h2>
            <p className="text-muted-foreground">
              Detailed analysis of your maintenance spending, trends, and budget tracking.
            </p>
          </div>

          {/* Cost Report Component */}
          <CostReportView />
        </div>
      </main>
    </div>
  );
}
