import useOrders from "@/hooks/useOrders";
import type { Order } from "@/types/Order";

type Props = {
  highlightId: string | null;
};

export function OrderTable({ highlightId }: Props) {
  const { orders } = useOrders();
  const sorted = orders.sort(
    (a: Order, b: Order) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
  );

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
          {sorted.map((order) => (
            <tr
              key={order._id}
              className={`border-b ${
                order._id === highlightId ? "bg-green-50 font-semibold" : ""
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
