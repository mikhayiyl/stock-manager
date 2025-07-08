import useOrders from "@/hooks/useOrders";
import { useState } from "react";

type Props = {
  highlightId: string | null;
};

export function OrderTable({ highlightId }: Props) {
  const { orders } = useOrders();
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

    const orderDate = new Date(order.date).toISOString().split("T")[0];
    const afterStart = !filters.startDate || orderDate >= filters.startDate;
    const beforeEnd = !filters.endDate || orderDate <= filters.endDate;

    return matchesItemCode && matchesOrderNo && afterStart && beforeEnd;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-white p-4 rounded shadow overflow-x-auto space-y-4">
      <h3 className="text-lg font-semibold">Recent Orders</h3>
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
                {new Date(order.date).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
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
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
