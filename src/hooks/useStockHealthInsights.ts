import { useLowStockAnalysis } from "@/hooks/useLowStockAnalysis";
import type { Product } from "@/types/Product";
import type { Order } from "@/types/Order";

export type StockHealthBadge = "Critical" | "Warning" | "Slow" | "Healthy";

export type StockHealthInsight = {
  product: { itemCode: string; name: string; numberInStock: number };
  badge: StockHealthBadge;
  lastSold: number | undefined;
  requiredStock: number;
  averageDailySales: number;
};

export function useStockHealthInsights(products: Product[], orders: Order[]) {
  const now = Date.now();

  const { salesMap, getRequiredStock, isLowStock } =
    useLowStockAnalysis(orders);

  const mapLastSale = new Map<string, number>();
  orders.forEach((order) => {
    const time = new Date(order.date).getTime();
    if (!Number.isFinite(time) || time > now) return;

    const existing = mapLastSale.get(order.itemCode);
    if (existing === undefined || time > existing) {
      mapLastSale.set(order.itemCode, time);
    }
  });

  return products.map((product): StockHealthInsight => {
    const required = getRequiredStock(product);
    const averageDailySales = (salesMap.get(product.itemCode) ?? 0) / 30;
    const lastSold = mapLastSale.get(product.itemCode);

    const badge: StockHealthBadge =
      product.numberInStock <= 0
        ? "Critical"
        : isLowStock(product)
          ? "Warning"
          : "Healthy";

    return {
      product: {
        itemCode: product.itemCode,
        name: product.name,
        numberInStock: product.numberInStock,
      },
      badge,
      lastSold,
      requiredStock: required,
      averageDailySales,
    };
  });
}
