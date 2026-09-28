import type { Damage } from "@/types/Damage";
import type { Entry } from "@/types/Entry";
import type { Product } from "@/types/Product";
import { SkeletonBlock } from "../SkeletonBlock";
import { useStockMetrics } from "@/hooks/useStockMetrics";

type Props = {
  itemCode: string;
  receipts: Entry[];
  orders: Entry[];
  damages: Damage[];
  product?: Product;
};

export function StockCard({
  itemCode,
  receipts,
  orders,
  damages,
  product,
}: Props) {
  if (!product) {
    return <SkeletonBlock title="no product..." />;
  }

  const {
    name,
    unit,
    currentStock,
    totalReceived,
    totalOrdered,
    totalDisposed,
    previousBalance,
    movementTotal,
  } = useStockMetrics(itemCode, { receipts, orders, damages }, product);
  return (
    <div className="bg-white border border-gray-200 rounded-md shadow-sm p-4 mb-6 print-page hover:border-gray-300 transition">
      {/* Header */}
      <h4 className="text-lg font-semibold text-gray-800 mb-2">
        {name}
        <span className="text-sm text-gray-500 ml-1">({itemCode})</span>
      </h4>

      {/* Grid layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-gray-700">
        {/* Receipts */}
        <div>
          <p className="font-semibold text-gray-600 mb-1">Receipts</p>
          <ul className="space-y-1">
            {receipts.map((r) => (
              <li key={r._id} className="flex items-center gap-2">
                {r.quantity} on {new Date(r.date).toLocaleDateString()}
                {r.isExpress && (
                  <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-xs font-medium">
                    EXPRESS
                  </span>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-2 font-medium text-blue-700">
            Total Received: {totalReceived} {unit}
          </p>
        </div>

        {/* Orders */}
        <div>
          <p className="font-semibold text-gray-600 mb-1">Orders</p>
          <ul className="space-y-1">
            {orders.map((o) => (
              <li key={o._id}>
                –{o.quantity} on {new Date(o.date).toLocaleDateString()}
              </li>
            ))}
          </ul>
          <p className="mt-2 font-medium text-red-700">
            Total Ordered: {totalOrdered} {unit}
          </p>
        </div>

        {/* Damage summary */}
        {totalDisposed > 0 && (
          <div className="col-span-1 sm:col-span-2">
            <p className="font-semibold text-gray-600 mb-1">Damages</p>
            <ul className="space-y-1">
              <li className="text-xs text-gray-500 italic">
                Disposed: {totalDisposed} {unit} (excluded from stock)
              </li>
            </ul>
            <p className="mt-2 font-medium text-yellow-700">
              Counted Damages: {totalDisposed} {unit}
            </p>
          </div>
        )}
      </div>

      {/* Totals summary */}
      <div className="mt-4 border-t pt-3 text-sm text-gray-700 space-y-1">
        <p>
          <span className="font-semibold text-gray-800">Opening Balance:</span>{" "}
          {previousBalance} {unit}
        </p>
        <p>
          <span className="font-semibold text-gray-800">Movement Total:</span>{" "}
          {movementTotal} {unit}
        </p>
        <p className="font-semibold text-green-700">
          Current Stock Balance: {currentStock} {unit}
        </p>
      </div>
    </div>
  );
}
