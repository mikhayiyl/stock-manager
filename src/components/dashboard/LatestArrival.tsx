import useProducts from "@/hooks/useProducts";
import { Link } from "react-router-dom";

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
    return (
      <div className="bg-white p-4 rounded shadow animate-pulse space-y-3">
        <div className="h-6 w-1/3 bg-gray-200 rounded" />
        <div className="h-4 w-2/3 bg-gray-200 rounded" />
        <div className="h-4 w-1/2 bg-gray-200 rounded" />
        <div className="h-4 w-2/3 bg-gray-200 rounded" />
        <div className="h-4 w-1/3 bg-gray-200 rounded" />
      </div>
    );
  }

  if (!latest?.itemCode) {
    return (
      <div className="bg-white p-4 rounded shadow">
        <p className="text-gray-500 text-sm">No arrival data yet.</p>
      </div>
    );
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
