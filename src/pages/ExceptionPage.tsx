import { ExceptionCardGrid } from "@/exceptions/ExceptionCardGrid";
import { ExportButtons } from "@/exceptions/ExportButtons";
import { FiltersBar } from "@/exceptions/FiltersBar";
import Pagination from "@/exceptions/PaginationBar";
import useDamages from "@/hooks/useDamages";
import { useDebounce } from "@/hooks/useDebounce";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useLowStockAnalysis } from "@/hooks/useLowStockAnalysis";
import useOrders from "@/hooks/useOrders";
import useProducts from "@/hooks/useProducts";
import type { FilterType } from "@/types/FiltersType";
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { useEffect, useState } from "react";
pdfMake.vfs = pdfFonts.vfs;

export function ProductExceptionsReport() {
  const { products } = useProducts();
  const { damages } = useDamages();
  const { orders } = useOrders();
  useDocumentTitle();

  const { isLowStock, getRequiredStock } = useLowStockAnalysis(orders);

  const [selectedFilters, setSelectedFilters] = useState<FilterType[]>([
    "Damaged",
  ]);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 6;
  const debouncedSearch = useDebounce(search, 400);
  const debouncedRange = useDebounce(dateRange, 400);

  const toggleFilter = (filter: FilterType) => {
    setCurrentPage(1);
    setSelectedFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, debouncedRange, selectedFilters]);

  const isInRange = (dateStr: string) => {
    const time = new Date(dateStr).getTime();
    const from = debouncedRange.from
      ? new Date(debouncedRange.from).getTime()
      : -Infinity;
    const to = debouncedRange.to
      ? new Date(debouncedRange.to + "T23:59:59").getTime()
      : Infinity;
    return time >= from && time <= to;
  };

  const damagedMap = new Map<string, any[]>();
  if (selectedFilters.includes("Damaged")) {
    damages.forEach((d) => {
      if (!isInRange(d.date)) return;
      if (!damagedMap.has(d.itemCode)) damagedMap.set(d.itemCode, []);
      damagedMap.get(d.itemCode)!.push(d);
    });
  }

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.itemCode.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      p.name.toLowerCase().includes(debouncedSearch.toLowerCase());

    const isDamaged =
      selectedFilters.includes("Damaged") && damagedMap.has(p.itemCode);
    const isLow = selectedFilters.includes("Low Stock") && isLowStock(p);
    const isOut =
      selectedFilters.includes("Out of Stock") && p.numberInStock === 0;

    return matchesSearch && (isDamaged || isLow || isOut);
  });

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <FiltersBar
        selectedFilters={selectedFilters}
        toggleFilter={toggleFilter}
        dateRange={dateRange}
        setDateRange={setDateRange}
        search={search}
        setSearch={setSearch}
        setCurrentPage={setCurrentPage}
      />

      <ExportButtons
        filteredProducts={filteredProducts}
        selectedFilters={selectedFilters}
        damagedMap={damagedMap}
      />

      <ExceptionCardGrid
        products={paginatedProducts}
        damagedMap={damagedMap}
        selectedFilters={selectedFilters}
        getRequiredStock={getRequiredStock}
      />

      <Pagination
        totalItems={filteredProducts.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
