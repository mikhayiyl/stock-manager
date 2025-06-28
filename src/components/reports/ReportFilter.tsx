import { useState } from "react";

type Props = {
  onFilterChange: (range: { from: string; to: string }) => void;
};

export function ReportFilter({ onFilterChange }: Props) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const handleChange = (field: "from" | "to", value: string) => {
    const updated =
      field === "from" ? { from: value, to } : { from, to: value };
    if (field === "from") setFrom(value);
    else setTo(value);
    onFilterChange(updated);
  };

  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div>
        <label className="text-sm font-medium">From</label>
        <input
          type="date"
          value={from}
          onChange={(e) => handleChange("from", e.target.value)}
          className="border px-3 py-2 rounded"
        />
      </div>
      <div>
        <label className="text-sm font-medium">To</label>
        <input
          type="date"
          value={to}
          onChange={(e) => handleChange("to", e.target.value)}
          className="border px-3 py-2 rounded"
        />
      </div>
    </div>
  );
}
