import { EmptyState } from "@/components/EmptyState";

type Order = {
  _id: string;
  itemCode: string;
  orderNumber: string;
  quantity: number;
  date: string;
};

type TableBodyProps = {
  orders: Order[];
  highlightId: string | null;
  isLoading: boolean;
  itemsPerPage: number;
};

export function OrdersTable({
  orders,
  highlightId,
  isLoading,
  itemsPerPage,
}: TableBodyProps) {
  if (isLoading)
    return (
      <div className="bg-white p-4 rounded shadow space-y-4 animate-pulse">
        <h3 className="text-lg font-semibold">Recent Orders</h3>
        {[...Array(itemsPerPage)].map((_, i) => (
          <div key={i} className="grid grid-cols-4 gap-4">
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );

  if (orders.length === 0) {
    return <EmptyState message="No orders yet" />;
  }

  return (
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
            key={order._id}
            className={`border-b ${
              order._id === highlightId ? "bg-green-50 font-semibold" : ""
            }`}
          >
            <td className="p-2 font-mono">{order.itemCode}</td>
            <td className="p-2 font-mono">{order.orderNumber}</td>
            <td className="p-2">{order.quantity}</td>
            <td className="p-2">
              {new Date(order.date).toLocaleString("en-GB", {
                dateStyle: "medium",
                timeStyle: "short",
                hour12: true,
              })}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
