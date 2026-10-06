import { EmptyState } from "@/components/EmptyState";
import { Link } from "react-router-dom";
import { SkeletonBlock } from "../SkeletonBlock";
import type { Product } from "@/types/Product";
import type { Receipt } from "@/types/Receipt";

type Props = {
  products: Product[];
  receipts: Receipt[];
  isLoading: boolean;
};

export function RecentMovements({ products, receipts, isLoading }: Props) {
  const productByCode = new Map(
    products.map((product) => [product.itemCode, product]),
  );
  const recentReceipts = [...receipts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  if (isLoading) {
    return <SkeletonBlock variant="table" columns={3} />;
  }

  if (recentReceipts.length === 0) {
    return <EmptyState message="No stock receipts yet." />;
  }

  return (
    <section className="min-w-0 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/[0.035] sm:p-5">
      <h3 className="mb-5 text-lg font-semibold tracking-tight text-slate-900">
        Recent stock receipts
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead className="border-b border-slate-200 text-[11px] uppercase tracking-[0.12em] text-slate-500">
            <tr>
              <th className="pb-3 pr-4 font-medium">Item</th>
              <th className="pb-3 pr-4 font-medium">Quantity received</th>
              <th className="pb-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {recentReceipts.map((receipt) => {
              const product = productByCode.get(receipt.itemCode);

              return (
                <tr
                  key={receipt._id}
                  className="border-b border-slate-100 transition-colors last:border-0 hover:bg-emerald-50/50"
                >
                  <td className="py-3 pr-4">
                    <div className="font-semibold text-slate-800">
                      {product?.name ?? receipt.itemCode}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {receipt.itemCode}
                    </div>
                  </td>
                  <td className="py-3 pr-4 font-medium tabular-nums text-slate-700">
                    {receipt.quantity.toLocaleString()} {product?.unit}
                  </td>
                  <td className="whitespace-nowrap py-3 text-slate-600">
                    {new Date(receipt.date).toLocaleString("en-GB", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      hour12: true,
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Link
        to="/stock"
        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-900"
      >
        View stock
      </Link>
    </section>
  );
}
