import type { Product } from "@/types/Product";

type EntryType = "received" | "order" | "damage";

export type Entry = {
  _id: string;
  itemCode: string;
  quantity: number;
  date: string;
  isExpress?: boolean;
  type?: EntryType; // optional if not always used
};

type Props = {
  itemCode: string;
  receipts: Entry[];
  orders: Entry[];
  product?: Product;
};

export function StockCard({ itemCode, receipts, orders, product }: Props) {
  const totalReceived = receipts.reduce((sum, r) => sum + r.quantity, 0);
  const totalOrdered = orders.reduce((sum, o) => sum + o.quantity, 0);
  const currentStock = product?.numberInStock ?? 0;

  return (
    <div className="border p-4 rounded shadow bg-white print-page mb-6">
      <h4 className="font-bold text-lg mb-2">
        {product?.name ?? itemCode}{" "}
        <span className="text-sm text-gray-500">({itemCode})</span>
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-600 mb-1">Receipts</p>
          <ul className="text-sm space-y-1">
            {receipts.map((r) => (
              <div key={r._id} className="text-sm flex items-center gap-2">
                <span>
                  {r.quantity} received on{" "}
                  {new Date(r.date).toLocaleDateString()}
                </span>

                {r.isExpress && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-medium">
                    EXPRESS
                  </span>
                )}
              </div>
            ))}
          </ul>
          <p className="mt-2 font-medium text-blue-700">
            Total Received: {totalReceived}
          </p>
        </div>

        {totalOrdered > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-1">Orders</p>
            <ul className="text-sm space-y-1">
              {orders.map((o) => (
                <li key={o._id}>
                  –{o.quantity} on {new Date(o.date).toLocaleDateString()}
                </li>
              ))}
            </ul>

            <p className="mt-2 font-medium text-red-700">
              Total Ordered: {totalOrdered}
            </p>
          </div>
        )}
      </div>

      <p className="mt-4 font-semibold text-green-700">
        Remaining Stock Balance: {currentStock} {product?.unit ?? ""}
      </p>
    </div>
  );
}
