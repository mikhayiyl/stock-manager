import { useEffect, useState } from "react";
import useReceipts from "@/hooks/useReceipts";
import { Link } from "react-router-dom";

export function LatestExpress() {
  const { receipts } = useReceipts();
  const [latestExpress, setLatestExpress] = useState<
    null | (typeof receipts)[0]
  >(null);

  useEffect(() => {
    const expressOnly = receipts
      .filter((r) => r.isExpress)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setLatestExpress(expressOnly[0] ?? null);
  }, [receipts]);

  if (!latestExpress) {
    return (
      <div className="p-4 bg-white rounded shadow text-sm text-gray-500">
        No express deliveries yet.
      </div>
    );
  }

  return (
    <div className="bg-purple-50 border border-purple-200 rounded shadow p-4 text-sm">
      <h4 className="text-lg font-semibold text-purple-700 mb-2">
        Latest Express Delivery
      </h4>
      <p>
        <strong>Item Code:</strong> {latestExpress.itemCode}
      </p>
      <p>
        <strong>Quantity:</strong> {latestExpress.quantity}
      </p>
      <p>
        <strong>Client:</strong> {latestExpress.client ?? "—"}
      </p>
      <p>
        <strong>Delivery Note:</strong> {latestExpress.deliveryNote ?? "—"}
      </p>
      <p>
        <strong>Date:</strong> {new Date(latestExpress.date).toLocaleString()}
      </p>

      <Link
        to="/express"
        className="inline-block mt-3 text-purple-600 underline hover:text-purple-800"
      >
        View all express deliveries →
      </Link>
    </div>
  );
}
