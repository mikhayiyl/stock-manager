import { ProductFilters } from "./ProductFilters";
import { EmptyState } from "@/components/EmptyState";
import useProducts from "@/hooks/useProducts";
import useReceipts from "@/hooks/useReceipts";
import { useEffect, useState } from "react";
import { DataTable } from "./DataTable";
import { SkeletonBlock } from "../SkeletonBlock";
import { useDebounce } from "@/hooks/useDebounce";
import Pagination from "../PaginationBar";

export function ReceiveData({ highlightId }: { highlightId: string | null }) {
  const { products, isLoading: loadingProducts } = useProducts();
  const { receipts, isLoading: loadingReceipts } = useReceipts();

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    itemCode: "",
    name: "",
  });

  const debouncedFilters = useDebounce(filters, 400);

  // Reset page when filters change
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedFilters]);

  const isLoading = loadingProducts || loadingReceipts;
  const hasLoaded = !loadingProducts && !loadingReceipts;
  const isEmpty = hasLoaded && receipts.length === 0;

  const today = new Date().toISOString().slice(0, 10);
  const skipDateFilter =
    debouncedFilters.startDate === today && debouncedFilters.endDate === today;

  const filteredReceipts = receipts
    .filter((r) => !r.isExpress)
    .filter((r) => {
      const p = products.find((p) => p.itemCode === r.itemCode);
      const date = new Date(r.date);
      const start = debouncedFilters.startDate
        ? new Date(debouncedFilters.startDate)
        : null;
      const end = debouncedFilters.endDate
        ? new Date(debouncedFilters.endDate + "T23:59:59")
        : null;

      return (
        (skipDateFilter || !start || date >= start) &&
        (skipDateFilter || !end || date <= end) &&
        (!debouncedFilters.itemCode ||
          r.itemCode
            .toLowerCase()
            .includes(debouncedFilters.itemCode.toLowerCase())) &&
        (!debouncedFilters.name ||
          p?.name?.toLowerCase().includes(debouncedFilters.name.toLowerCase()))
      );
    });

  const itemsPerPage = 10;
  const paginatedReceipts = filteredReceipts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) {
    return <SkeletonBlock rows={6} columns={6} title="Loading receipts..." />;
  }

  if (isEmpty) {
    return <EmptyState message="No receipts found." />;
  }

  return (
    <div className="bg-white p-4 rounded shadow overflow-x-auto">
      <h3 className="text-lg font-semibold mb-4">Recent Arrivals</h3>

      <ProductFilters filters={filters} onChange={setFilters} />

      <DataTable
        receipts={paginatedReceipts}
        products={products}
        highlightId={highlightId}
      />

      <Pagination
        totalItems={filteredReceipts.length}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
