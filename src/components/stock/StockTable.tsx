import { Link } from "react-router-dom";
import { DamageModal } from "@/components/stock/DamageModal";
import { StockAdjustmentModal } from "@/components/stock/StockAdjustmentModal";
import getAuthUser from "@/lib/auth";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonBlock } from "../SkeletonBlock";
import type { Product } from "@/types/Product";

type Props = {
  products: Product[];
  isLoading: boolean;
  emptyMessage: string;
};

export default function StockTable({
  products,
  isLoading,
  emptyMessage,
}: Props) {
  const isAdmin = getAuthUser()?.isAdmin === true;

  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <SkeletonBlock
          rows={8}
          columns={isAdmin ? 7 : 6}
          title="Loading stock products..."
        />
      </div>
    );
  }

  if (products.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="border-b border-slate-200 bg-emerald-50/70 text-left text-slate-700">
          <tr>
            <th className="p-3">Item Code</th>
            <th className="p-3">Name</th>
            <th className="p-3">In Stock</th>
            <th className="p-3">Damaged</th>
            <th className="p-3">Unit</th>
            <th className="p-3">Last Received</th>
            {isAdmin && <th className="p-3">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr
              key={product._id}
              className={
                product.numberInStock === 0
                  ? "bg-red-50 text-gray-600"
                  : "border-b"
              }
            >
              <td className="p-3 font-medium text-emerald-800 underline-offset-2 hover:underline">
                <Link to={`/product/${product.itemCode}`}>
                  {product.itemCode}
                </Link>
              </td>
              <td className="p-3 font-medium text-emerald-800 underline-offset-2 hover:underline">
                <Link to={`/product/${product.itemCode}`}>{product.name}</Link>
              </td>
              <td className="p-3">{product.numberInStock}</td>
              <td className="p-3">{product.damaged}</td>
              <td className="p-3">{product.unit}</td>
              <td className="p-3">
                {new Date(product.received).toLocaleString("en-GB", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  hour12: true,
                })}
              </td>
              {isAdmin && (
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <StockAdjustmentModal product={product} />
                    <DamageModal product={product} />
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
