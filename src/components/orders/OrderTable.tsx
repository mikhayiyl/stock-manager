import useOrders from "@/hooks/useOrders";
import { useState } from "react";

type Props = {
  highlightId: string | null;
};

export function OrderTable({ highlightId }: Props) {
  const { orders, isLoading } = useOrders();
  const [filters, setFilters] = useState({
    itemCode: "",
    orderNumber: "",
    startDate: "",
    endDate: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filtered = orders.filter((order) => {
    const matchesItemCode = order.itemCode
      .toLowerCase()
      .includes(filters.itemCode.toLowerCase());
    const matchesOrderNo = order.orderNumber
      .toLowerCase()
      .includes(filters.orderNumber.toLowerCase());

    const orderDate = new Date(order.date).toISOString();
    const afterStart = !filters.startDate || orderDate >= filters.startDate;
    const beforeEnd = !filters.endDate || orderDate <= filters.endDate;

    return matchesItemCode && matchesOrderNo && afterStart && beforeEnd;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading)
    return (
      <div className="bg-white p-4 rounded shadow space-y-4 animate-pulse">
        <h3 className="text-lg font-semibold">Recent Orders</h3>
        {[...Array(itemsPerPage)].map((_, i) => (
          <div key={i} className="grid grid-cols-4 gap-4">
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );

  return (
    <div className="bg-white p-4 rounded shadow overflow-x-auto space-y-4">
      <h3 className="text-lg font-semibold">Recent Orders</h3>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Item Code"
          value={filters.itemCode}
          onChange={(e) => setFilters({ ...filters, itemCode: e.target.value })}
          className="border px-3 py-1 rounded"
        />
        <input
          type="text"
          placeholder="Order No"
          value={filters.orderNumber}
          onChange={(e) =>
            setFilters({ ...filters, orderNumber: e.target.value })
          }
          className="border px-3 py-1 rounded"
        />
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) =>
            setFilters({ ...filters, startDate: e.target.value })
          }
          className="border px-3 py-1 rounded"
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          className="border px-3 py-1 rounded"
        />
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <p className="text-sm text-center text-gray-500">
          No orders found for this filter.
        </p>
      ) : (
        <>
          {/* Orders Table */}
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2">Item Code</th>
                <th className="p-2">Order No</th>
                <th className="p-2">Quantity</th>
                <th className="p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((order) => (
                <tr
                  key={order._id}
                  className={`border-b ${
                    order._id === highlightId ? "bg-green-50 font-semibold" : ""
                  }`}
                >
                  <td className="p-2 font-mono">{order.itemCode}</td>
                  <td className="p-2 font-mono">{order.orderNumber}</td>
                  <td className="p-2">{order.quantity}</td>
                  <td className="p-2">
                    {new Date(order.date).toLocaleString("en-GB", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      hour12: true,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === i + 1 ? "bg-green-600 text-white" : ""
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
