import { useState } from "react";
import useProducts from "@/hooks/useProducts";
import useOrders from "@/hooks/useOrders";
import { useStockHealthInsights } from "@/hooks/useStockHealthInsights";
import StockHealthTabs from "@/components/stockScope/StockHealthTabs";
import Legend from "@/components/stockScope/Legend";
import StockHealthCardGrid from "@/components/stockScope/StockHealthCardGrid";
import { SkeletonBlock } from "@/components/SkeletonBlock";

type TabKey = "reorder" | "outOfStock" | "slowMovers";

const TABS: { key: TabKey; label: string }[] = [
  { key: "reorder", label: "Reorder Needed" },
  { key: "outOfStock", label: "Out of Stock" },
  { key: "slowMovers", label: "Lowest Sales" },
];

export default function StockHealthDashboard() {
  const { products, isLoading: productsLoading } = useProducts();
  const { orders, isLoading: ordersLoading } = useOrders();
  const stockInsights = useStockHealthInsights(products, orders);
  const [activeTab, setActiveTab] = useState<TabKey>("reorder");
  const isLoading = productsLoading || ordersLoading;

  const slowMovers = stockInsights
    .filter((item) => item.product.numberInStock > 0)
    .sort(
      (left, right) =>
        left.averageDailySales - right.averageDailySales ||
        left.product.name.localeCompare(right.product.name),
    )
    .slice(0, 5)
    .map((item, index) => ({
      ...item,
      badge: "Slow" as const,
      rank: index + 1,
    }));

  const filtered =
    activeTab === "reorder"
      ? stockInsights.filter((item) => item.badge === "Warning")
      : activeTab === "outOfStock"
        ? stockInsights.filter((item) => item.badge === "Critical")
        : slowMovers;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Stock scope</h2>
      <StockHealthTabs active={activeTab} onSelect={setActiveTab} tabs={TABS} />
      <Legend />
      <div
        id="stock-health-panel"
        role="tabpanel"
        aria-labelledby={`stock-health-tab-${activeTab}`}
        tabIndex={0}
      >
        {isLoading ? (
          <SkeletonBlock
            variant="card"
            rows={3}
            title="Loading stock health..."
          />
        ) : (
          <>
            {activeTab === "slowMovers" && filtered.length > 0 && (
              <p className="mb-4 text-sm text-gray-600">
                Five in-stock products with the lowest average units sold per
                day over the last 30 days. Products with no sales are included.
              </p>
            )}
            <StockHealthCardGrid
              items={filtered}
              emptyMessage={
                activeTab === "reorder"
                  ? "No products are at or below their 7-day sales target."
                  : activeTab === "outOfStock"
                    ? "No products are out of stock."
                    : "No in-stock products to rank by average sales."
              }
            />
          </>
        )}
      </div>
    </div>
  );
}
