import { LatestArrival } from "@/components/dashboard/LatestArrival";
import { RecentMovements } from "@/components/dashboard/RecentMovements";
import { SummaryCards } from "@/components/dashboard/SummaryCard";
import { LatestExpress } from "@/components/dashboard/Express";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <SummaryCards />
      <RecentMovements />
      <LatestArrival />
      <LatestExpress />
    </div>
  );
}
