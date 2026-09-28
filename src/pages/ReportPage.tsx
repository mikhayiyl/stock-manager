import { ReportFilter } from "@/components/reports/ReportFilter";
import { StockCardReport } from "@/components/reports/StockCardReport";
import { useState } from "react";

export default function ReportPage() {
  const now = new Date();

  const firstDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  ).toLocaleDateString("sv-SE"); // gives YYYY-MM-DD format in local time

  const today = new Date().toISOString().slice(0, 10); // returns today’s date

  const [filter, setFilter] = useState<{
    from: string;
    to: string;
    search: string;
  }>({
    from: firstDay,
    to: today,
    search: "",
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Stock Movement Report</h2>
      <ReportFilter
        onFilterChange={setFilter}
        dateFilter={{ firstDay, today }}
      />
      <StockCardReport filter={filter} />
    </div>
  );
}
