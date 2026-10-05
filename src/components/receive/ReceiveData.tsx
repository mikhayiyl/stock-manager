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

  const productsByCode = new Map(
    products.map((product) => [product.itemCode, product]),
  );

  const filteredReceipts = receipts
    .filter((r) => !r.isExpress)
    .filter((r) => {
      const product = productsByCode.get(r.itemCode);
      const receiptDate = new Date(r.date);
      const start = debouncedFilters.startDate
        ? new Date(`${debouncedFilters.startDate}T00:00:00`)
        : null;
      const end = debouncedFilters.endDate
        ? new Date(`${debouncedFilters.endDate}T23:59:59.999`)
        : null;

      return (
        (!start || receiptDate >= start) &&
        (!end || receiptDate <= end) &&
        (!debouncedFilters.itemCode ||
          r.itemCode
            .toLowerCase()
            .includes(debouncedFilters.itemCode.toLowerCase())) &&
        (!debouncedFilters.name ||
          product?.name
            ?.toLowerCase()
            .includes(debouncedFilters.name.toLowerCase()))
      );
    });

  const itemsPerPage = 10;
  const paginatedReceipts = filteredReceipts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  if (isLoading) {
    return <SkeletonBlock rows={6} columns={6} title="Loading receipts..." />;
  }

  if (isEmpty) {
    return <EmptyState message="No receipts found." />;
  }

  return (
    <section className="min-w-0 space-y-4 overflow-x-auto rounded-md border border-gray-200 bg-white p-4 shadow-sm">
      <ProductFilters filters={filters} onChange={setFilters} />

      {filteredReceipts.length > 0 ? (
        <DataTable
          receipts={paginatedReceipts}
          products={products}
          highlightId={highlightId}
        />
      ) : (
        <EmptyState message="No stock receipts match these filters." />
      )}

      <Pagination
        totalItems={filteredReceipts.length}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </section>
  );
}
