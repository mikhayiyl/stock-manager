import { ReportFilter } from "@/components/reports/ReportFilter";
import { StockCardReport } from "@/components/reports/StockCardReport";
import { useState } from "react";

export default function ReportPage() {
  const [filter, setFilter] = useState<{
    from: string;
    to: string;
    search: string;
  }>({
    from: "",
    to: "",
    search: "",
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Stock Movement Report</h2>
      <ReportFilter onFilterChange={setFilter} />
      <StockCardReport filter={filter} />
    </div>
  );
}
