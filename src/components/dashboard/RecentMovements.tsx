import useProducts from "@/hooks/useProducts";
import { EmptyState } from "@/components/EmptyState";
import { Link } from "react-router-dom";
import { SkeletonBlock } from "../SkeletonBlock";

export function RecentMovements() {
  const { products, isLoading } = useProducts();

  const sorted = [...products]
    .sort(
      (a, b) => new Date(b.received).getTime() - new Date(a.received).getTime()
    )
    .slice(0, 5);

  if (isLoading) {
    return <SkeletonBlock variant="table" />;
  }

  if (products.length === 0) {
    return <EmptyState message="No products data yet." />;
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-lg font-semibold mb-4">Recent Stock Updates</h3>
      <table className="w-full text-sm">
        <thead className="text-left border-b">
          <tr>
            <th>Code</th>
            <th>Item</th>
            <th>Stock</th>
            <th>Damaged</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => (
            <tr key={p._id} className="border-b">
              <td>{p.itemCode}</td>
              <td>{p.name}</td>
              <td>{p.numberInStock}</td>
              <td>{p.damaged}</td>
              <td>
                {new Date(p.received).toLocaleString("en-GB", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  hour12: true,
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link
        to="/stock"
        className="inline-block mt-3 text-purple-600 underline hover:text-purple-800"
      >
        View stock →
      </Link>
    </div>
  );
}
