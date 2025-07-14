import useProducts from "@/hooks/useProducts";
import { EmptyState } from "@/components/EmptyState";
import { Link } from "react-router-dom";
import { SkeletonBlock } from "../SkeletonBlock";

export function LatestArrival() {
  const { products, isLoading } = useProducts();
  const latest =
    products
      .filter((p) => p.received)
      .sort(
        (a, b) =>
          new Date(b.received).getTime() - new Date(a.received).getTime()
      )[0] ?? null;

  if (isLoading) {
    return <SkeletonBlock variant="card" />;
  }

  if (!latest?.itemCode) {
    return <EmptyState message="No arrival data yet." />;
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-lg font-semibold mb-2">Latest Arrival</h3>
      <p className="text-sm">
        <strong>Item:</strong> {latest.name}
      </p>
      <p className="text-sm">
        <strong>Code:</strong> {latest.itemCode}
      </p>
      <p className="text-sm">
        <strong>Date Received:</strong>{" "}
        {new Date(latest.received).toLocaleString("en-GB", {
          dateStyle: "medium",
          timeStyle: "short",
          hour12: true,
        })}
      </p>
      <p className="text-sm">
        <strong>Quantity:</strong> {latest.numberInStock} {latest.unit}
      </p>
      <Link
        to="/receive"
        className="inline-block mt-3 text-purple-600 underline hover:text-purple-800"
      >
        View all arrivals →
      </Link>
    </div>
  );
}
