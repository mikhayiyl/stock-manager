import { useEffect, useState } from "react";
import useReceipts from "@/hooks/useReceipts";
import { Link } from "react-router-dom";

export default function ExpressPage() {
  const { receipts } = useReceipts();

  const [expressReceipts, setExpressReceipts] = useState<typeof receipts>([]);
  const [filters, setFilters] = useState({
    itemCode: "",
    client: "",
    from: "",
    to: "",
  });

  useEffect(() => {
    const filtered = receipts
      .filter((r) => r.isExpress)
      .filter((r) => {
        const codeMatch = filters.itemCode
          ? r.itemCode.toLowerCase().includes(filters.itemCode.toLowerCase())
          : true;

        const clientMatch = filters.client
          ? r.client?.toLowerCase().includes(filters.client.toLowerCase())
          : true;

        const date = new Date(r.date).getTime();
        const from = filters.from
          ? new Date(filters.from).getTime()
          : -Infinity;
        const to = filters.to
          ? new Date(filters.to + "T23:59:59").getTime()
          : Infinity;
        const dateMatch = date >= from && date <= to;

        return codeMatch && clientMatch && dateMatch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setExpressReceipts(filtered);
  }, [receipts, filters]);

  return (
    <div className="bg-white p-6 rounded shadow space-y-6">
      <h2 className="text-2xl font-bold text-purple-700">Express Deliveries</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          value={filters.itemCode}
          onChange={(e) => setFilters({ ...filters, itemCode: e.target.value })}
          className="border p-2 rounded"
          placeholder="Filter by Item Code"
        />
        <input
          type="text"
          value={filters.client}
          onChange={(e) => setFilters({ ...filters, client: e.target.value })}
          className="border p-2 rounded"
          placeholder="Filter by Client"
        />
        <input
          type="date"
          value={filters.from}
          onChange={(e) => setFilters({ ...filters, from: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={filters.to}
          onChange={(e) => setFilters({ ...filters, to: e.target.value })}
          className="border p-2 rounded"
        />
      </div>

      {expressReceipts.length === 0 ? (
        <p className="text-center text-sm text-gray-500">
          No express deliveries match your filters.
        </p>
      ) : (
        <table className="min-w-full text-sm">
          <thead className="bg-purple-100 text-left">
            <tr>
              <th className="p-2">Item Code</th>
              <th className="p-2">Client</th>
              <th className="p-2">Quantity</th>
              <th className="p-2">Delivery Note</th>
              <th className="p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {expressReceipts.map((r) => (
              <tr key={r._id} className="border-b">
                <td className="p-2 text-blue-600 underline">
                  <Link to={`/product/${r.itemCode}`}>{r.itemCode}</Link>
                </td>
                <td className="p-2">{r.client ?? "—"}</td>
                <td className="p-2">{r.quantity}</td>
                <td className="p-2">{r.deliveryNote ?? "—"}</td>
                <td className="p-2">{new Date(r.date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
