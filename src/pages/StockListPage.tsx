import Pagination from "@/components/PaginationBar";
import SearchBar from "@/components/stock/SearchBar";
import StockTable from "@/components/stock/StockTable";
import useProducts from "@/hooks/useProducts";
import { useDebounce } from "@/hooks/useDebounce";
import useOrders from "@/hooks/useOrders";
import { useLowStockAnalysis } from "@/hooks/useLowStockAnalysis";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

type StockStatus = "all" | "low-stock" | "out-of-stock";

export default function StockListPage() {
  const { products, isLoading } = useProducts();
  const { orders, isLoading: ordersLoading } = useOrders();
  const { isLowStock } = useLowStockAnalysis(orders);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const debouncedSearch = useDebounce(search.trim().toLowerCase(), 400);
  const statusParam = searchParams.get("status");
  const status: StockStatus =
    statusParam === "low-stock" || statusParam === "out-of-stock"
      ? statusParam
      : "all";
  const filteredProducts = products.filter((product) => {
    const matchesSearch = `${product.itemCode} ${product.name}`
      .toLowerCase()
      .includes(debouncedSearch);
    const matchesStatus =
      status === "low-stock"
        ? isLowStock(product)
        : status === "out-of-stock"
          ? product.numberInStock <= 0
          : true;

    return matchesSearch && matchesStatus;
  });
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, status]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        {status === "low-stock"
          ? "Low stock products"
          : status === "out-of-stock"
            ? "Out-of-stock products"
            : "Stock List"}
      </h2>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {products.length > 0 && (
          <SearchBar
            value={search}
            onChange={(val) => {
              setSearch(val);
              setCurrentPage(1);
            }}
          />
        )}
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <span className="shrink-0">Stock status</span>
          <select
            aria-label="Filter products by stock status"
            value={status}
            onChange={(event) => {
              const nextParams = new URLSearchParams(searchParams);
              if (event.target.value === "all") {
                nextParams.delete("status");
              } else {
                nextParams.set("status", event.target.value);
              }
              setSearchParams(nextParams);
            }}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            <option value="all">All products</option>
            <option value="low-stock">Low stock</option>
            <option value="out-of-stock">Out of stock</option>
          </select>
        </label>
      </div>

      <StockTable
        products={paginatedProducts}
        isLoading={isLoading || (status === "low-stock" && ordersLoading)}
        emptyMessage={
          status === "low-stock"
            ? "No low-stock products found."
            : status === "out-of-stock"
              ? "No out-of-stock products found."
              : debouncedSearch
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
