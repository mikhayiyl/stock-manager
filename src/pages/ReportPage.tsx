import { ReportFilter } from "@/components/reports/ReportFilter";
import { StockCardReport } from "@/components/reports/StockCardReport";
import { useState } from "react";

export default function ReportPage() {
  const now = new Date();
  const toDateInputValue = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const firstDay = toDateInputValue(
    new Date(now.getFullYear(), now.getMonth(), 1),
  );
  const today = toDateInputValue(now);

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
      <h2 className="text-2xl font-bold text-gray-900">
        Stock movement report
      </h2>
      <ReportFilter
        onFilterChange={setFilter}
        dateFilter={{ firstDay, today }}
      />
      <StockCardReport filter={filter} />
    </div>
  );
}
