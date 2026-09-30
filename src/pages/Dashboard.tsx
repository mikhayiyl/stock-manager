import { RecentMovements } from "@/components/dashboard/RecentMovements";
import { SummaryCards } from "@/components/dashboard/SummaryCard";
import { LatestExpress } from "@/components/dashboard/Express";
import useOrders from "@/hooks/useOrders";
import useProducts from "@/hooks/useProducts";
import useReceipts from "@/hooks/useReceipts";

export default function DashboardPage() {
  const { products, isLoading: productsLoading } = useProducts();
  const { orders, isLoading: ordersLoading } = useOrders();
  const { receipts, isLoading: receiptsLoading } = useReceipts();
  const isLoading = productsLoading || ordersLoading || receiptsLoading;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Inventory overview</h2>
      <SummaryCards products={products} orders={orders} isLoading={isLoading} />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RecentMovements
            products={products}
            receipts={receipts}
            isLoading={isLoading}
          />
        </div>
        <LatestExpress receipts={receipts} isLoading={isLoading} />
      </div>
    </div>
  );
}
