import useOrders from "@/hooks/useOrders";
import useProducts from "@/hooks/useProducts";
import type { Order } from "@/types/Order";

export function SummaryCards() {
  const { products } = useProducts();
  const { orders } = useOrders();

  // Total number of distinct products
  const totalItems = products.length;

  // Total damaged quantity across all products
  const totalDamaged = products.reduce((sum, p) => sum + p.damaged, 0);

  // Count of products that are completely out of stock
  const notInStock = products.filter((p) => p.numberInStock === 0).length;

  //Demand-aware low stock logic
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  // Step 1: Build a map of itemCode → total quantity sold in the last 30 days
  const salesMap = new Map<string, number>();
  orders.forEach((o) => {
    const orderDate = new Date(o.date);
    if (orderDate >= thirtyDaysAgo) {
      salesMap.set(o.itemCode, (salesMap.get(o.itemCode) ?? 0) + o.quantity);
    }
  });

  // Step 2: Define dynamic buffer days based on sales velocity
  const getBufferDays = (dailyRate: number): number => {
    if (dailyRate >= 5) return 14; // fast movers → 2 weeks buffer
    if (dailyRate >= 1) return 7; // moderate movers → 1 week
    return 3; // slow movers → minimal buffer
  };

  // Step 3: Count products that are low in stock based on buffer coverage
  const lowStock = products.filter((p) => {
    const total30DaySales = salesMap.get(p.itemCode) ?? 0;

    // Skip products with very low or no recent sales
    if (total30DaySales < 3) return false;

    const dailyRate = total30DaySales / 30;
    const bufferDays = getBufferDays(dailyRate);
    const requiredStock = Math.ceil(dailyRate * bufferDays);

    return p.numberInStock <= requiredStock;
  }).length;

  // Step 4: Rank products by total quantity ordered (all time)
  const orderMap = new Map<string, number>();
  orders.forEach((o: Order) => {
    orderMap.set(o.itemCode, (orderMap.get(o.itemCode) ?? 0) + o.quantity);
  });

  const ranked = products
    .map((p) => ({
      ...p,
      totalOrdered: orderMap.get(p.itemCode) ?? 0,
    }))
    .sort((a, b) => b.totalOrdered - a.totalOrdered);

  const fastMover = ranked[0]?.name ?? "–";
  const slowMover = ranked[ranked.length - 1]?.name ?? "–";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card title="Total Items" value={totalItems} color="bg-blue-100" />
      <Card title="Low Stock" value={lowStock} color="bg-red-100" />
      <Card title="Total Damaged" value={totalDamaged} color="bg-rose-100" />
      <Card title="Not In Stock" value={notInStock} color="bg-orange-100" />
      <Card title="Fast Movers" value={fastMover} color="bg-green-100" />
      <Card title="Slow Movers" value={slowMover} color="bg-yellow-100" />
    </div>
  );
}

function Card({
  title,
  value,
  color,
}: {
  title: string;
  value: any;
  color: string;
}) {
  return (
    <div className={`p-4 rounded shadow ${color}`}>
      <h4 className="text-sm font-semibold text-gray-600">{title}</h4>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}
