import { PageHeader } from "@/components/shared/page-header";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { ActivityLog } from "@/components/dashboard/activity-log";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <PageHeader
        title="Dashboard"
        description="Here's a summary of your logistic operations."
      />
      
      <OverviewCards />
      
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <SalesChart />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityLog />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
