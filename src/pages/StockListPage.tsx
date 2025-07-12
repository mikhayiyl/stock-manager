import Pagination from "@/components/stock/Pagination";
import SearchBar from "@/components/stock/SearchBar";
import StockTable from "@/components/stock/StockTable";
import useProducts from "@/hooks/useProducts";
import { useState } from "react";

export default function StockListPage() {
  const { products, isLoading } = useProducts();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Stock List</h2>

      <SearchBar
        value={search}
        onChange={(val) => {
          setSearch(val);
          setCurrentPage(1);
        }}
      />

      <StockTable
        products={products}
        search={search}
        isLoading={isLoading}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
      />

      <Pagination
        totalItems={products.length}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
