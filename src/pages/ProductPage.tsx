import { useParams } from "react-router-dom";
import { useMemo } from "react";
import useProducts from "@/hooks/useProducts";
import useOrders from "@/hooks/useOrders";
import useDamages from "@/hooks/useDamages";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export function ProductPage() {
  const { itemCode } = useParams();
  const { products } = useProducts();
  const { orders } = useOrders();
  const { damages } = useDamages();

  const product = products.find((p) => p.itemCode === itemCode);

  const now = new Date();
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
  }, [orders, itemCode]);

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

  if (!product) {
    return <p className="text-red-600">Product not found.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{product.name}</h1>

      {/* Product Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded shadow-sm">
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
      <div className="bg-white p-4 rounded shadow-sm">
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
    </div>
  );
}
