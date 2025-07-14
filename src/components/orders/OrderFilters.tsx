type FiltersProps = {
  filters: {
    itemCode: string;
    orderNumber: string;
    startDate: string;
    endDate: string;
  };
  setFilters: (filters: FiltersProps["filters"]) => void;
};

export function OrderFilters({ filters, setFilters }: FiltersProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <input
        type="text"
        placeholder="Item Code"
        value={filters.itemCode}
        onChange={(e) => setFilters({ ...filters, itemCode: e.target.value })}
        className="border px-3 py-1 rounded bg-white text-black dark:bg-gray-800 dark:text-white"
      />
      <input
        type="text"
        placeholder="Order No"
        value={filters.orderNumber}
        onChange={(e) =>
          setFilters({ ...filters, orderNumber: e.target.value })
        }
        className="border px-3 py-1 rounded bg-white text-black dark:bg-gray-800 dark:text-white"
      />
      <input
        type="date"
        value={filters.startDate}
        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
        className="border px-3 py-1 rounded bg-white text-black dark:bg-gray-800 dark:text-white"
      />
      <input
        type="date"
        value={filters.endDate}
        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
        className="border px-3 py-1 rounded bg-white text-black dark:bg-gray-800 dark:text-white"
      />
    </div>
  );
}
