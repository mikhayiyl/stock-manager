import { useEffect, useState } from "react";

type Order = {
  id: number;
  orderNumber: string;
  itemCode: string;
  quantity: number;
  date: string;
};

type Props = {
  highlightId: number | null;
};

export function OrderTable({ highlightId }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const res = await fetch("http://localhost:3001/orders");
    const data = await res.json();
    const sorted = data.sort(
      (a: Order, b: Order) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setOrders(sorted);
  };

  return (
    <div className="bg-white p-4 rounded shadow overflow-x-auto">
      <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-2">Item Code</th>
            <th className="p-2">Order No</th>
            <th className="p-2">Quantity</th>
            <th className="p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className={`border-b ${
                order.id === highlightId ? "bg-green-50 font-semibold" : ""
              }`}
            >
              <td className="p-2 font-mono">{order.itemCode}</td>
              <td className="p-2 font-mono">{order.orderNumber}</td>
              <td className="p-2">{order.quantity}</td>
              <td className="p-2">
                {new Date(order.date).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
