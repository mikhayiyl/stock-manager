import { useLowStockAnalysis } from "@/hooks/useLowStockAnalysis";
import type { Product } from "@/types/Product";
import type { Order } from "@/types/Order";

export function useStockHealthInsights(products: Product[], orders: Order[]) {
  const recentThreshold = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
  const now = Date.now();

  const { getRequiredStock } = useLowStockAnalysis(orders);

  // Map of latest sale date per product
  const mapLastSale = new Map<string, number>();
  orders.forEach((order) => {
    const time = new Date(order.date).getTime();
    const existing = mapLastSale.get(order.itemCode);
    if (!existing || time > existing) {
      mapLastSale.set(order.itemCode, time);
    }
  });

  return products.map(
    (
      product
    ): {
      product: { itemCode: string; name: string; numberInStock: number };
      badge: "Critical" | "Warning" | "Slow";
      lastSold: number | undefined;
      requiredStock: number;
    } => {
      const required = getRequiredStock(product);
      const lastSold = mapLastSale.get(product.itemCode);

      const inactive = !lastSold || now - lastSold > recentThreshold;

      const badge =
        product.numberInStock === 0
          ? "Critical"
          : product.numberInStock <= required
          ? "Warning"
          : inactive
          ? "Slow"
          : "Warning";

      return {
        product: {
          itemCode: product.itemCode,
          name: product.name,
          numberInStock: product.numberInStock,
        },
        badge,
        lastSold,
        requiredStock: required,
      };
    }
  );
}
