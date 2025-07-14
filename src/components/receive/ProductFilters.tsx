type FilterProps = {
  filters: {
    startDate: string;
    endDate: string;
    itemCode: string;
    name: string;
  };
  onChange: (filters: FilterProps["filters"]) => void;
};

export function ProductFilters({ filters, onChange }: FilterProps) {
  const update = (field: keyof FilterProps["filters"], value: string) => {
    onChange({ ...filters, [field]: value });
  };

  return (
    <div className="mb-4 flex flex-wrap gap-4">
      <input
        type="date"
        value={filters.startDate}
        onChange={(e) => update("startDate", e.target.value)}
        className="border px-3 py-1 rounded bg-white text-black dark:bg-gray-800 dark:text-white"
      />
      <input
        type="date"
        value={filters.endDate}
        onChange={(e) => update("endDate", e.target.value)}
        className="border px-3 py-1 rounded bg-white text-black dark:bg-gray-800 dark:text-white"
      />
      <input
        type="text"
        placeholder="Item Code"
        value={filters.itemCode}
        onChange={(e) => update("itemCode", e.target.value)}
        className="border px-3 py-1 rounded bg-white text-black dark:bg-gray-800 dark:text-white"
      />
      <input
        type="text"
        placeholder="Name"
        value={filters.name}
        onChange={(e) => update("name", e.target.value)}
        className="border px-3 py-1 rounded bg-white text-black dark:bg-gray-800 dark:text-white"
      />
    </div>
  );
}
