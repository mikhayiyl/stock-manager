import { Link } from "react-router-dom";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonBlock } from "../SkeletonBlock";
import type { Receipt } from "@/types/Receipt";

type Props = {
  receipts: Receipt[];
  isLoading: boolean;
};

export function LatestExpress({ receipts, isLoading }: Props) {
  const latestExpress = receipts
    .filter((receipt) => receipt.isExpress)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  if (isLoading) {
    return <SkeletonBlock variant="card" />;
  }

  if (!latestExpress) {
    return <EmptyState message="No express deliveries yet." />;
  }

  return (
    <section className="min-w-0 rounded-xl border border-gray-200/80 bg-white p-4 text-sm shadow-sm shadow-slate-900/[0.03] sm:p-5">
      <h3 className="mb-4 text-lg font-semibold tracking-tight text-slate-900">
        Latest express delivery
      </h3>
      <p>
        <strong>Item code:</strong> {latestExpress.itemCode}
      </p>
      <p className="mt-2">
        <strong>Quantity:</strong> {latestExpress.quantity.toLocaleString()}
      </p>
      <p className="mt-2 break-words">
        <strong>Client:</strong> {latestExpress.client || "—"}
      </p>
      <p className="mt-2 break-words">
        <strong>Delivery note:</strong> {latestExpress.deliveryNote || "—"}
      </p>
      <p className="mt-2">
        <strong>Date:</strong>{" "}
        {new Date(latestExpress.date).toLocaleString("en-GB", {
          dateStyle: "medium",
          timeStyle: "short",
          hour12: true,
        })}
      </p>

      <Link
        to="/express"
        className="mt-4 inline-block font-semibold text-emerald-700 hover:text-emerald-900"
      >
        View express deliveries
      </Link>
    </section>
  );
}
