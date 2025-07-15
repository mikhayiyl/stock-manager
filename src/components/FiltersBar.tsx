import type { FilterType } from "@/types/FiltersType";

const FILTERS: FilterType[] = ["Damaged", "Low Stock", "Out of Stock"];

type Props = {
  selectedFilters: FilterType[];
  toggleFilter: (filter: FilterType) => void;
  dateRange: { from: string; to: string };
  setDateRange: React.Dispatch<
    React.SetStateAction<{ from: string; to: string }>
  >;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
};

export function FiltersBar({
  selectedFilters,
  toggleFilter,
  dateRange,
  setDateRange,
  setSearch,
  search,
  setCurrentPage,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {FILTERS.map((filter) => (
        <label key={filter} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedFilters.includes(filter)}
            onChange={() => toggleFilter(filter)}
          />
          {filter}
        </label>
      ))}

      <input
        type="date"
        value={dateRange.from}
        onChange={(e) => {
          setCurrentPage(1);
          setDateRange((prev) => ({ ...prev, from: e.target.value }));
        }}
        className="border px-3 py-1 rounded bg-white text-black dark:bg-gray-800 dark:text-white"
      />
      <span>to</span>
      <input
        type="date"
        value={dateRange.to}
        onChange={(e) => {
          setCurrentPage(1);
          setDateRange((prev) => ({ ...prev, to: e.target.value }));
        }}
        className="border px-3 py-1 rounded bg-white text-black dark:bg-gray-800 dark:text-white"
      />

      <input
        type="text"
        placeholder="Search by name or code"
        value={search}
        onChange={(e) => {
          setCurrentPage(1);
          setSearch(e.target.value);
        }}
        className="border px-2 py-1 rounded w-64"
      />
    </div>
  );
}
