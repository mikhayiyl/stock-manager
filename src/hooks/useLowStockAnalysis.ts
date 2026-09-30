import type { Product } from "@/types/Product";
import type { Order } from "@/types/Order";

export const REORDER_COVER_DAYS = 7;

export function useLowStockAnalysis(orders: Order[]) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  // Build sales map: itemCode → total quantity sold in last 30 days
  const salesMap = new Map<string, number>();
  orders.forEach((o) => {
    const orderDate = new Date(o.date);
    if (orderDate >= thirtyDaysAgo && orderDate <= now) {
      salesMap.set(o.itemCode, (salesMap.get(o.itemCode) ?? 0) + o.quantity);
    }
  });
  const getRequiredStock = (product: Product): number => {
    const totalSales = salesMap.get(product.itemCode) ?? 0;
    return Math.ceil((totalSales / 30) * REORDER_COVER_DAYS);
  };

  const isLowStock = (product: Product): boolean => {
    const totalSales = salesMap.get(product.itemCode) ?? 0;
    if (totalSales <= 0 || product.numberInStock <= 0) return false;
    return product.numberInStock <= getRequiredStock(product);
  };

  return {
    salesMap,
    getRequiredStock,
    isLowStock,
  };
}
