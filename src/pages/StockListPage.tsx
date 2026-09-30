import Pagination from "@/components/PaginationBar";
import SearchBar from "@/components/stock/SearchBar";
import StockTable from "@/components/stock/StockTable";
import useProducts from "@/hooks/useProducts";
import { useDebounce } from "@/hooks/useDebounce";
import { useState } from "react";

export default function StockListPage() {
  const { products, isLoading } = useProducts();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const debouncedSearch = useDebounce(search.trim().toLowerCase(), 400);
  const filteredProducts = products.filter((product) =>
    `${product.itemCode} ${product.name}`
      .toLowerCase()
      .includes(debouncedSearch),
  );
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Stock List</h2>

      {products.length > 0 && (
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setCurrentPage(1);
          }}
        />
      )}

      <StockTable
        products={paginatedProducts}
        isLoading={isLoading}
        emptyMessage={
          debouncedSearch
            ? "No products match your search."
            : "No products available."
        }
      />

      <Pagination
        totalItems={filteredProducts.length}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
