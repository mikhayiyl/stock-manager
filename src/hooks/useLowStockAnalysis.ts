import type { Product } from "@/types/Product";
import type { Order } from "@/types/Order";

export function useLowStockAnalysis(orders: Order[]) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  // Build sales map: itemCode → total quantity sold in last 30 days
  const salesMap = new Map<string, number>();
  orders.forEach((o) => {
    const orderDate = new Date(o.date);
    if (orderDate >= thirtyDaysAgo) {
      salesMap.set(o.itemCode, (salesMap.get(o.itemCode) ?? 0) + o.quantity);
    }
  });

  // Dynamic buffer days based on sales velocity
  const getBufferDays = (dailyRate: number): number => {
    if (dailyRate >= 5) return 14;
    if (dailyRate >= 1) return 7;
    return 3;
  };

  // Compute required stock for a product
  const getRequiredStock = (product: Product): number => {
    const totalSales = salesMap.get(product.itemCode) ?? 0;
    const dailyRate = totalSales / 30;
    const bufferDays = getBufferDays(dailyRate);
    return Math.ceil(dailyRate * bufferDays);
  };

  // Determine if a product is low in stock
  const isLowStock = (product: Product): boolean => {
    const totalSales = salesMap.get(product.itemCode) ?? 0;
    if (totalSales < 3) return false;
    const required = getRequiredStock(product);
    return product.numberInStock <= required;
  };

  return {
    salesMap,
    getBufferDays,
    getRequiredStock,
    isLowStock,
  };
}
