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
        aria-label="Start date"
        value={filters.startDate}
        onChange={(e) => update("startDate", e.target.value)}
        className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-black sm:w-auto"
      />
      <input
        type="date"
        aria-label="End date"
        value={filters.endDate}
        onChange={(e) => update("endDate", e.target.value)}
        className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-black sm:w-auto"
      />
      <input
        type="text"
        aria-label="Filter by item code"
        placeholder="Item Code"
        value={filters.itemCode}
        onChange={(e) => update("itemCode", e.target.value)}
        className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-black sm:w-auto"
      />
      <input
        type="text"
        aria-label="Filter by product name"
        placeholder="Name"
        value={filters.name}
        onChange={(e) => update("name", e.target.value)}
        className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-black sm:w-auto"
      />
    </div>
  );
}
