import useProducts from "@/hooks/useProducts";
import useReceipts from "@/hooks/useReceipts";
import { Link } from "react-router-dom";
import { useState } from "react";

type Props = {
  highlightId: string | null;
};

const itemsPerPage = 10;

export default function ProductTable({ highlightId }: Props) {
  const { products, isLoading: loadingProducts } = useProducts();
  const { receipts, isLoading: loadingReceipts } = useReceipts();

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    itemCode: "",
    name: "",
  });

  const [currentPage, setCurrentPage] = useState(1);

  const isLoading = loadingProducts || loadingReceipts;
  const hasLoaded = !loadingProducts && !loadingReceipts;
  const isEmpty = hasLoaded && receipts.length === 0;

  const today = new Date().toISOString().slice(0, 10);
  const skipDateFilter =
    filters.startDate === today && filters.endDate === today;

  const filteredReceipts = receipts
    .filter((receipt) => !receipt.isExpress)
    .filter((receipt) => {
      const product = products.find((p) => p.itemCode === receipt.itemCode);
      const receiptDate = new Date(receipt.date);

      const matchesStartDate = skipDateFilter
        ? true
        : filters.startDate
        ? receiptDate >= new Date(filters.startDate)
        : true;

      const matchesEndDate = skipDateFilter
        ? true
        : filters.endDate
        ? receiptDate <= new Date(filters.endDate + "T23:59:59")
        : true;

      const codeMatch = filters.itemCode
        ? receipt.itemCode
            .toLowerCase()
            .includes(filters.itemCode.toLowerCase())
        : true;

      const nameMatch = filters.name
        ? product?.name?.toLowerCase().includes(filters.name.toLowerCase())
        : true;

      return matchesStartDate && matchesEndDate && codeMatch && nameMatch;
    });

  const paginatedReceipts = filteredReceipts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage);

  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded shadow overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4">Recent Arrivals</h3>
        <p className="text-gray-500 text-sm">Loading receipts...</p>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="bg-white p-4 rounded shadow text-center text-gray-500 py-10">
        No receipts found.
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded shadow overflow-x-auto">
      <h3 className="text-lg font-semibold mb-4">Recent Arrivals</h3>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-4">
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) =>
            setFilters({ ...filters, startDate: e.target.value })
          }
          className="border px-3 py-1 rounded bg-white text-black dark:bg-gray-800 dark:text-white"
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          className="border px-3 py-1 rounded bg-white text-black dark:bg-gray-800 dark:text-white"
        />
        <input
          type="text"
          value={filters.itemCode}
          onChange={(e) => setFilters({ ...filters, itemCode: e.target.value })}
          className="border px-3 py-1 rounded bg-white text-black dark:bg-gray-800 dark:text-white"
          placeholder="Item Code"
        />
        <input
          type="text"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          className="border px-3 py-1 rounded bg-white text-black dark:bg-gray-800 dark:text-white"
          placeholder="Name"
        />
      </div>

      {/* Table */}
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-2">Item Code</th>
            <th className="p-2">Name</th>
            <th className="p-2">Quantity</th>
            <th className="p-2">Stock</th>
            <th className="p-2">Unit</th>
            <th className="p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {paginatedReceipts.map((receipt) => {
            const product = products.find(
              (p) => p.itemCode === receipt.itemCode
            );

            return (
              <tr
                key={receipt._id}
                className={`border-b ${
                  receipt._id === highlightId
                    ? "bg-orange-300 font-semibold"
                    : ""
                }`}
              >
                <td className="p-2 text-blue-600 underline">
                  <Link to={`/product/${receipt.itemCode}`}>
                    {receipt.itemCode}
                  </Link>
                </td>
                <td className="p-2">{product?.name ?? "—"}</td>
                <td className="p-2">{receipt.quantity}</td>
                <td className="p-2">{product?.numberInStock ?? "—"}</td>
                <td className="p-2">{product?.unit ?? "—"}</td>
                <td className="p-2">
                  {new Date(receipt.date).toLocaleDateString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2 text-sm">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
