import type { GroupedEntry } from "@/types/Entry";
import type { Product } from "@/types/Product";

export type StockMetrics = {
  name: string;
  unit: string;
  currentStock: number;
  totalReceived: number;
  totalOrdered: number;
  totalDisposed: number;
  previousBalance: number;
  movementTotal: number;
};

export function useStockMetrics(
  itemCode: string,
  entry: GroupedEntry,
  product?: Product
): StockMetrics {
  const name = product?.name ?? itemCode;
  const unit = product?.unit ?? "";
  const currentStock = product?.numberInStock ?? 0;

  const totalReceived = entry.receipts.reduce((sum, r) => sum + r.quantity, 0);
  const totalOrdered = entry.orders.reduce((sum, o) => sum + o.quantity, 0);
  const totalDisposed = entry.damages.reduce((sum, d) => {
    if (d.itemCode !== itemCode || !Array.isArray(d.resolutionHistory))
      return sum;
    return (
      sum +
      d.resolutionHistory
        .filter((r) => r.type === "disposed")
        .reduce((s, r) => s + r.quantity, 0)
    );
  }, 0);

  const previousBalance =
    currentStock - totalReceived + totalOrdered + totalDisposed;
  const movementTotal =
    previousBalance + totalReceived - totalOrdered - totalDisposed;

  return {
    name,
    unit,
    currentStock,
    totalReceived,
    totalOrdered,
    totalDisposed,
    previousBalance,
    movementTotal,
  };
}
