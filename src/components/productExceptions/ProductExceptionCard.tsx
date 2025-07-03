import type { Product } from "@/types/Product";
import type { Entry } from "@/components/reports/StockCard";

type Props = {
  product: Product;
  damages: Entry[];
  status: string[];
};

export function ProductExceptionCard({ product, damages, status }: Props) {
  const totalDamaged = damages.reduce((sum, d) => sum + d.quantity, 0);

  return (
    <div className="border rounded shadow-sm p-4 space-y-2 bg-white">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="font-semibold text-lg">{product.name}</h2>
          <p className="text-sm text-gray-500">{product.itemCode}</p>
          {status.some((s) => s === "Low Stock" || s === "Out of Stock") && (
            <p className="text-sm text-gray-700">
              Remaining Stock:{" "}
              <span className="font-medium">{product.numberInStock}</span>
            </p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {status.map((s) => (
            <span
              key={s}
              className={`text-xs px-2 py-1 rounded-full ${
                s === "Damaged"
                  ? "bg-red-100 text-red-700"
                  : s === "Low Stock"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Damage Summary */}
      {damages.length > 0 && (
        <div className="text-sm">
          <p className="font-medium">Total Damaged: {totalDamaged}</p>
          <ul className="mt-2 space-y-1">
            {damages.map((d, i) => (
              <li
                key={`${product.itemCode}-${d._id ?? i}`}
                className="flex justify-between border-b pb-1"
              >
                <span>{new Date(d.date).toLocaleDateString()}</span>
                <span>{d.quantity}</span>
                <span className="italic text-gray-500">
                  {(d as any).notes ?? "—"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
