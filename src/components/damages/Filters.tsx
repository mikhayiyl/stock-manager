import React from "react";

interface FiltersState {
  itemCode: string;
  name: string;
  startDate: string;
  endDate: string;
}

interface Props {
  filters: FiltersState;
  setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
}

const Filters = ({ filters, setFilters }: Props) => {
  return (
    <div className="flex flex-wrap gap-4">
      <input
        placeholder="Item Code"
        value={filters.itemCode}
        onChange={(e) => setFilters({ ...filters, itemCode: e.target.value })}
        className="border px-3 py-1 rounded bg-white text-black dark:bg-gray-800 dark:text-white"
      />
      <input
        placeholder="Product Name"
        value={filters.name}
        onChange={(e) => setFilters({ ...filters, name: e.target.value })}
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
};

export default Filters;
