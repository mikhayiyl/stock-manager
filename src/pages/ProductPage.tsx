import { useParams } from "react-router-dom";
import { useEffect, useMemo } from "react";
import useProducts from "@/hooks/useProducts";
import useOrders from "@/hooks/useOrders";
import useDamages from "@/hooks/useDamages";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { EmptyState } from "@/components/EmptyState";
import { StockAdjustmentModal } from "@/components/stock/StockAdjustmentModal";
import { StockMovementHistory } from "@/components/stock/StockMovementHistory";
import getAuthUser from "@/lib/auth";
import { SkeletonBlock } from "@/components/SkeletonBlock";

ChartJS.register(ArcElement, Tooltip, Legend);

export function ProductPage() {
  const { itemCode } = useParams();
  const { products, isLoading: productsLoading } = useProducts();
  const { orders, isLoading: ordersLoading } = useOrders();
  const { damages, isLoading: damagesLoading } = useDamages();
  const isLoading = productsLoading || ordersLoading || damagesLoading;

  const product = products.find((p) => p.itemCode === itemCode);
  const isAdmin = getAuthUser()?.isAdmin === true;

  // page title
  useEffect(() => {
    document.title = `${product?.name}`;
  }, [product?.name]);

  const now = useMemo(() => new Date(), []);
  const thisMonth = now.getMonth();
  const lastMonth = (thisMonth + 11) % 12;

  const monthlyOrders = useMemo(() => {
    let thisMonthTotal = 0;
    let lastMonthTotal = 0;

    orders.forEach((o) => {
      if (o.itemCode !== itemCode) return;
      const orderDate = new Date(o.date);
      const month = orderDate.getMonth();
      const year = orderDate.getFullYear();

      if (month === thisMonth && year === now.getFullYear()) {
        thisMonthTotal += o.quantity;
      } else if (month === lastMonth && year === now.getFullYear()) {
        lastMonthTotal += o.quantity;
      }
    });

    return { thisMonthTotal, lastMonthTotal };
  }, [orders, itemCode, now, thisMonth, lastMonth]);

  const totalOrders = orders.reduce(
    (sum, o) => (o.itemCode === itemCode ? sum + o.quantity : sum),
    0
  );

  const totalDamaged = damages.reduce(
    (sum, d) => (d.itemCode === itemCode ? sum + d.quantity : sum),
    0
  );

  const delta =
    monthlyOrders.lastMonthTotal === 0
      ? monthlyOrders.thisMonthTotal > 0
        ? 100
        : 0
      : ((monthlyOrders.thisMonthTotal - monthlyOrders.lastMonthTotal) /
          monthlyOrders.lastMonthTotal) *
        100;

  const chartData = {
    labels: ["This Month", "Last Month"],
    datasets: [
      {
        data: [monthlyOrders.thisMonthTotal, monthlyOrders.lastMonthTotal],
        backgroundColor: ["#10b981", "#f59e0b"],
        borderWidth: 1,
      },
    ],
  };

  if (isLoading) {
    return (
      <SkeletonBlock
        variant="card"
        rows={2}
        title="Loading product details..."
      />
    );
  }

  if (!product?.itemCode) {
    return <EmptyState message="product not found" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <p className="mt-1 text-sm text-gray-600">{product.itemCode}</p>
        </div>
        {isAdmin && <StockAdjustmentModal product={product} />}
      </div>

      {/* Product Info */}
      <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm md:grid-cols-2">
        <div>
          <p>
            <strong>Item Code:</strong> {product.itemCode}
          </p>
          <p>
            <strong>Unit:</strong> {product.unit}
          </p>
          <p>
            <strong>Received:</strong>{" "}
            {new Date(product.received).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p>
            <strong>Number in Stock:</strong> {product.numberInStock}
          </p>
          <p>
            <strong>Total Orders:</strong> {totalOrders}
          </p>
          <p>
            <strong>Total Damaged:</strong> {totalDamaged}
          </p>
        </div>
      </div>

      {/* Sales Trend */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h2 className="font-semibold mb-2">Sales Trend</h2>
        <div className="flex items-center gap-6">
          <div className="w-64">
            <Pie data={chartData} />
          </div>
          <div>
            <p className="text-sm text-gray-600">
              This Month: {monthlyOrders.thisMonthTotal}
            </p>
            <p className="text-sm text-gray-600">
              Last Month: {monthlyOrders.lastMonthTotal}
            </p>
            <p
              className={`text-lg font-bold ${
                delta >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      <StockMovementHistory productId={product._id} unit={product.unit} />
    </div>
  );
}
