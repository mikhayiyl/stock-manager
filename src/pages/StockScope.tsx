import { useState } from "react";
import useProducts from "@/hooks/useProducts";
import useOrders from "@/hooks/useOrders";
import { useStockHealthInsights } from "@/hooks/useStockHealthInsights";
import StockHealthTabs from "@/components/stockScope/StockHealthTabs";
import Legend from "@/components/stockScope/Legend";
import StockHealthCardGrid from "@/components/stockScope/StockHealthCardGrid";

type TabKey = "reorder" | "outOfStock" | "slowMovers";

const TABS: { key: TabKey; label: string }[] = [
  { key: "reorder", label: "Reorder Needed" },
  { key: "outOfStock", label: "Out of Stock" },
  { key: "slowMovers", label: "Slow Movers" },
];

export default function StockHealthDashboard() {
  const { products } = useProducts();
  const { orders } = useOrders();
  const stockInsights = useStockHealthInsights(products, orders);
  const [activeTab, setActiveTab] = useState<TabKey>("reorder");

  const filtered = stockInsights.filter((item) => {
    if (activeTab === "reorder") return item.badge === "Warning";
    if (activeTab === "outOfStock") return item.badge === "Critical";
    if (activeTab === "slowMovers") return item.badge === "Slow";
    return false;
  });

  return (
    <div className="space-y-6">
      <StockHealthTabs active={activeTab} onSelect={setActiveTab} tabs={TABS} />
      <Legend />
      <StockHealthCardGrid items={filtered} />
    </div>
  );
}
