import { useState } from "react";

type Props = {
  onFilterChange: (range: { from: string; to: string; search: string }) => void;
  dateFilter: { today: string; firstDay: string };
};

export function ReportFilter({
  onFilterChange,
  dateFilter: { today, firstDay },
}: Props) {
  const [from, setFrom] = useState(firstDay || "");
  const [to, setTo] = useState(today || "");
  const [search, setSearch] = useState("");

  const handleChange = (field: "from" | "to" | "search", value: string) => {
    const updated = {
      from,
      to,
      search,
      [field]: value,
    };
    if (field === "from") setFrom(value);
    if (field === "to") setTo(value);
    if (field === "search") setSearch(value);
    onFilterChange(updated);
  };

  return (
    <div className="flex flex-wrap gap-4 items-end no-print">
      <div>
        <label className="text-sm font-medium p-1">From</label>
        <input
          type="date"
          value={from}
          onChange={(e) => handleChange("from", e.target.value)}
          className="border px-3 py-1 rounded bg-white text-black dark:bg-gray-800 dark:text-white"
        />
      </div>
      <div>
        <label className="text-sm font- p-1">To</label>
        <input
          type="date"
          value={to}
          onChange={(e) => handleChange("to", e.target.value)}
          className="border px-3 py-1 rounded bg-white text-black dark:bg-gray-800 dark:text-white"
        />
      </div>
      <div>
        <label className="text-sm font-medium p-1">Search Item</label>
        <input
          type="text"
          value={search}
          onChange={(e) => handleChange("search", e.target.value)}
          placeholder="Item code or name"
          className="border px-3 py-1 rounded bg-white text-black dark:bg-gray-800 dark:text-white"
        />
      </div>
    </div>
  );
}
