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
  const invalidDateRange = Boolean(from && to) && from > to;

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-md border border-gray-200 bg-white p-4 no-print">
      <div>
        <label
          htmlFor="report-from-date"
          className="block text-sm font-medium text-gray-700"
        >
          From
        </label>
        <input
          id="report-from-date"
          type="date"
          aria-label="Report from date"
          max={to || undefined}
          value={from}
          onChange={(e) => handleChange("from", e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 sm:w-auto"
        />
      </div>
      <div>
        <label
          htmlFor="report-to-date"
          className="block text-sm font-medium text-gray-700"
        >
          To
        </label>
        <input
          id="report-to-date"
          type="date"
          aria-label="Report to date"
          min={from || undefined}
          value={to}
          onChange={(e) => handleChange("to", e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 sm:w-auto"
        />
      </div>
      <div>
        <label
          htmlFor="report-search"
          className="block text-sm font-medium text-gray-700"
        >
          Search item
        </label>
        <input
          id="report-search"
          type="text"
          aria-label="Search item code or product name"
          value={search}
          onChange={(e) => handleChange("search", e.target.value)}
          placeholder="Item code or name"
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>
      <button
        type="button"
        disabled={!from && !to && !search}
        onClick={() => {
          setFrom("");
          setTo("");
          setSearch("");
          onFilterChange({ from: "", to: "", search: "" });
        }}
        className="rounded-md px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-gray-400"
      >
        Clear filters
      </button>
      {invalidDateRange && (
        <p className="w-full text-sm text-red-700" role="alert">
          The start date must be on or before the end date.
        </p>
      )}
    </div>
  );
}
