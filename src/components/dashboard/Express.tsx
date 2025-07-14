import { useEffect, useState } from "react";
import useReceipts from "@/hooks/useReceipts";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonBlock } from "../SkeletonBlock";

export function LatestExpress() {
  const { receipts, isLoading } = useReceipts();
  const [latestExpress, setLatestExpress] = useState<
    null | (typeof receipts)[0]
  >(null);

  useEffect(() => {
    const expressOnly = receipts
      .filter((r) => r.isExpress)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setLatestExpress(expressOnly[0] ?? null);
  }, [receipts]);

  if (isLoading) {
    return <SkeletonBlock variant="card" />;
  }

  if (!latestExpress) {
    return <EmptyState message="No express deliveries yet." />;
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
        <strong>Date:</strong>{" "}
        {new Date(latestExpress.date).toLocaleString("en-GB", {
          dateStyle: "medium",
          timeStyle: "short",
          hour12: true,
        })}
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
